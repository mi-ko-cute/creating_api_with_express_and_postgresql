const assert = require('power-assert');
const requestHelper = require('../../helper/requestHelper');
const model = require('../../../src/db/models/index').Todos;
const sequlize = require('../../../src/db/models/index').sequelize


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

    it('正常にGETリクエストが成功した場合、挿入したテストデータが返る', async () => {
        const response = await requestHelper.request({
            method: 'get',
            endPoint: '/api/todos',
            statusCode: 200
        });

        const todos = response.body.data.todos;
        assert.ok(Array.isArray(todos));
        assert.ok(todos.length > 0);
        todos.forEach((todo) => {
            assert.strictEqual(typeof todo.id, 'number');
            assert.strictEqual(typeof todo.title, 'string');
            assert.strictEqual(typeof todo.body, 'string');
            assert.strictEqual(typeof todo.completed, 'boolean');
            assert.strictEqual(typeof todo.createdAt, 'string');
            assert.strictEqual(typeof todo.updatedAt, 'string');
        });
    });
});