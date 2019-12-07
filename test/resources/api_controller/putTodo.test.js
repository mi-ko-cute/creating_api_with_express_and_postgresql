const assert = require('power-assert');
const requestHelper = require('../../helper/requestHelper');
const model = require('../../../src/db/models/index').Todos;
const sequlize = require('../../../src/db/models/index').sequelize;

// テーブルからデータを取得するために、メソッドを用意
const getTodos = async () => {
    const response = await requestHelper.request({
        method: 'get',
        endPoint: '/api/todos',
        statusCode: 200
    });

    return response.body.data;
}

const VALID_ID = 1;
const INVALID_ID = 99999;

describe('Test PUT api/todos', () => {
    before(async () => {
        const insertTodos = [];
        for (let i = 1; i <= 5; i++) {
            const todo = {
                title: 'test_title' + i,
                body: 'test_body' + i
            };
            const promise = model.create(todo);
            insertTodos.push(promise);
        }
        await Promise.all(insertTodos);
    });
    after(async () => {
        await sequlize.truncate();
        await sequlize.close();
    });

    it('リクエストのbodyプロパティIDがテーブルに存在しないIDの場合、404エラーが返る', async () => {
        const oldTodos = await getTodos();

        const notExistId = {
            id: INVALID_ID,
            title: 'test_title',
            body: 'test body'
        };

        const response = await requestHelper.request({
            method: 'put',
            endPoint: '/api/todos',
            statusCode: 404
        }).send(notExistId);

        assert.strictEqual(response.body.data.error, `Couldn't find a todo of ID ${INVALID_ID}`);

        // テーブルがロールバックされるので、過去のテーブルとレコード件数が一致することを確認する。
        const currentTodos = await getTodos();
        assert.strictEqual(oldTodos.todos.length, currentTodos.todos.length);
    });

    it('リクエストのbodyプロパティIDがテーブルに存在した場合、対象のレコードが更新される', async () => {
        const oldTodos = await getTodos();

        const todo = {
            id: VALID_ID,
            title: 'update title',
            body: 'update body'
        };

        const response = await requestHelper.request({
            method: 'put',
            endPoint: '/api/todos',
            statusCode: 200
        }).send(todo);

        const updatedTodo = response.body.data;

        assert.deepStrictEqual({ ...updatedTodo.todo }, {
            id: VALID_ID,
            title: todo.title,
            body: todo.body,
            completed: false,
            createdAt: updatedTodo.todo.createdAt,
            updatedAt: updatedTodo.todo.updatedAt
        });

        // 対象レコードの更新前と更新後の中身が違うことを確認
        const currentTodos = await getTodos();
        assert.notStrictEqual(currentTodos.todos[0], oldTodos.todos.length[0]);

        // updatedAtがcreatedAtより最新であることを確認
        assert.strictEqual(currentTodos.todos[0].updatedAt >= currentTodos.todos[0].createdAt, true);
    });
});