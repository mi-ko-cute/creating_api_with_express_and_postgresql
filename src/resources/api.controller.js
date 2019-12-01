'use strict'

const Todo = require('../db/models/index');

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
            const todos = await Todo.Todos.findAll({
                order: [
                    ['id', 'ASC']
                ],
                raw: true
            });

            res.status(STATUS_CODES.OK).json(formatResponseData({ todos }));
        } catch (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(formatResponseData({
                error: error.message
            }));
        }
    },

    // Create
    postTodo(req, res) {
        send(res, STATUS_CODES.OK, '`postTodo` should create a new todo to DB', false);
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