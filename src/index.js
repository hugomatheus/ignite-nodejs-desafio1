const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const findUser = users.find(user => user.username === username);

  if(!findUser) {
    return response.status(400).json({ error: "User not found!"});
  }

  request.user = findUser;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);
  if(userAlreadyExists) {
    return response.status(400).json({ error: "User already exist!"});
  }

  const data = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(data);

  return response.status(201).send(data);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const findUser = users.find(data => data.username === user.username)
  return response.send(findUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline } = request.body;

  const data = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(data);
  return response.status(201).send(data);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "todo not found"});
  }
  todo.id = id;
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "todo not found"});
  }
  todo.done = true;
  return response.send(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExist = user.todos.some(todo => todo.id === id);

  if (!todoExist) {
    return response.status(404).json({error: "todo not found"});
  }

  const findIndex = user.todos.findIndex(findTodo => findTodo.id === id);
  user.todos.splice(findIndex, 1);
  return response.status(204).send();

});

module.exports = app;