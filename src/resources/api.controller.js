'use strict'

const models = require('../db/models/index');

const STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
};

const formatResponseData = (data) => ({ data });

// Controllers (CRUD)
//   C: Create
//   R: Read
//   U: UPDATE
//   D: Delete
module.exports = {
    // Read
    async getTodos(req, res) {
        try {
            const todos = await models.Todos.findAll({
                order: [
                    ['id', 'ASC']
                ]
            });

            res.status(STATUS_CODES.OK).json(formatResponseData({ todos }));
        } catch (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(formatResponseData({
                error: error.message
            }));
        }
    },

    // Create
    async postTodo(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
            const { title, body } = req.body;

            const todo = await models.Todos.create({
                title,
                body
            }, { transaction });

            await transaction.commit();
            res.status(STATUS_CODES.OK).json(formatResponseData({ todo }));
        } catch (error) {
            await transaction.rollback();
            res.status(STATUS_CODES.BAD_REQUEST).json(formatResponseData({
                error: error.message
            }))
        }
    },

    // Update
    async putTodo(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();

            // URLからidを取得して、idを文字列から数値に変換
            const id = req.params.id;
            const parsedId = parseInt(id, 10);

            // idで該当のレコードが存在するか確認し、存在しなかったら404エラーを返す
            const todo = await models.Todos.findByPk(parsedId, { transaction });
            if (!todo) {
                const error = new Error(`Couldn't find a todo of ID ${parsedId}`);
                error.status = STATUS_CODES.NOT_FOUND;
                throw error;
            }

            for (let property in req.body) {
                if (property !== 'id') {
                    todo[property] = req.body[property];
                }
            }

            await todo.save({ transaction });
            await transaction.commit();
            res.status(STATUS_CODES.OK).json(formatResponseData({ todo }));

        } catch (error) {
            await transaction.rollback();
            res.status(error.status).json(formatResponseData({
                error: error.message
            }));
        }
    },

    // Delete
    deleteTodo(req, res) {
        send(res, STATUS_CODES.OK, '`deleteTodo` should delete a todo from DB', false);
    }
}

/***Helpers***/
const send = (res, code, data, json = true) => {
    res.status(code).send(json ? JSON.stringify(data) : data);
}; 