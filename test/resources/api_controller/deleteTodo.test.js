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

describe('Test DELETE api/todos', () => {
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
    });

    it('リクエストURLのプロパティIDがテーブルに存在しないIDの場合、404エラーが返る', async () => {
        const oldTodos = await getTodos();

        const response = await requestHelper.request({
            method: 'delete',
            endPoint: `/api/todos/${INVALID_ID}`,
            statusCode: 404
        });

        assert.strictEqual(response.body.data.error, `Couldn't find a todo of ID ${INVALID_ID}`);

        // テーブルがロールバックされるので、過去のテーブルとレコード件数が一致することを確認する。
        const currentTodos = await getTodos();
        assert.strictEqual(oldTodos.todos.length, currentTodos.todos.length);
    });

    it('リクエストURLのプロパティIDがテーブルに存在する場合、対象のレコードが更新される', async () => {
        const oldTodos = await getTodos();

        const response = await requestHelper.request({
            method: 'delete',
            endPoint: `/api/todos/${VALID_ID}`,
            statusCode: 200
        });

        const deletedTodo = response.body.data;

        assert.deepStrictEqual({ ...deletedTodo.todo }, {
            id: VALID_ID,
            title: deletedTodo.todo.title,
            body: deletedTodo.todo.body,
            completed: false,
            createdAt: deletedTodo.todo.createdAt,
            updatedAt: deletedTodo.todo.updatedAt
        });

        // 対象レコードが削除されているので、
        // 削除される前よりテーブルのレコード件数が減っていることを確認
        const currentTodos = await getTodos();
        assert.strictEqual(currentTodos.todos.length + 1, oldTodos.todos.length);
    });
});