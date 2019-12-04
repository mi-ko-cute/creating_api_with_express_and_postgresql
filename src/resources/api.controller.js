'use strict'

const models = require('../db/models/index');

const STATUS_CODES = {
    OK: 200,
    BAD_REQUEST: 400
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
            const {title, body} = req.body;

            const todo = await models.Todos.create({
                title,
                body
            }, {transaction});

            await transaction.commit();
            res.status(STATUS_CODES.OK).json(formatResponseData({todo}));
        } catch (error) {
            await transaction.rollback();
            res.status(STATUS_CODES.BAD_REQUEST).json(formatResponseData({
                error: error.message
            }))
        }
    },

    // Update
    putTodo(req, res) {
        send(res, STATUS_CODES.OK, '`putTodo` should update a todo in DB', false);
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