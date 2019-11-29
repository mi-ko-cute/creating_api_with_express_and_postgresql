'use strict';
module.exports = (sequelize, DataTypes) => {
  const Todos = sequelize.define('Todos', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    completed: DataTypes.BOOLEAN
  }, {});
  Todos.associate = function(models) {
    // associations can be defined here
  };
  return Todos;
};