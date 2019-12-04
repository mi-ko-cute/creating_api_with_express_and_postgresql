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


describe('Test Get api/todos', () => {
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

    it('リクエストのbodyプロパティにtitleが含まれていなかった場合、400エラーが返る', async () => {
        const oldTodos = await getTodos();

        const nonTitle = {
            body: 'test body'
        };

        const response = await requestHelper.request({
            method: 'post',
            endPoint: '/api/todos',
            statusCode: 400
        }).send(nonTitle);

        assert.strictEqual(response.body.data.error, "Field 'title' doesn't have a default value");

        // テーブルがロールバックされるので、過去のテーブルとレコード件数が一致することを確認する。
        const currentTodos = await getTodos();
        assert.strictEqual(oldTodos.todos.length, currentTodos.todos.length);
    });

    it('リクエストのbodyプロパティにbodyが含まれていなかった場合、400エラーが返る', async () => {
        const oldTodos = await getTodos();

        const nonBody = {
            title: 'test title'
        };

        const response = await requestHelper.request({
            method: 'post',
            endPoint: '/api/todos',
            statusCode: 400
        }).send(nonBody);

        assert.strictEqual(response.body.data.error, "Field 'body' doesn't have a default value");

        // テーブルがロールバックされるので、過去のテーブルとレコード件数が一致することを確認する。
        const currentTodos = await getTodos();
        assert.strictEqual(oldTodos.todos.length, currentTodos.todos.length);
    });

    it('リクエストのbodyプロパティにtitle,bodyが含まれていた場合、テーブルにデータが作成される', async () => {
        const oldTodos = await getTodos();

        const todo = {
            title: 'test title',
            body: 'test body'
        };

        const response = await requestHelper.request({
            method: 'post',
            endPoint: '/api/todos',
            statusCode: 200
        }).send(todo);

        const createdTodo = response.body.data;

        assert.deepStrictEqual({ ...createdTodo.todo }, {
            id: createdTodo.todo.id,
            title: todo.title,
            body: todo.body,
            createdAt: createdTodo.todo.createdAt,
            updatedAt: createdTodo.todo.updatedAt
        });

        // データをテーブルに作成したので、レコードが1件増えていることを確認
        const currentTodos = await getTodos();
        assert.strictEqual(currentTodos.todos.length, oldTodos.todos.length + 1);

    });
});