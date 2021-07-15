const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, response, next) {
  const user = users.find(u => u.username === req.headers.username)
  if (!user) {
      return response.status(400).json({ message: "User does not exist" })
  }
  req.user = user
  next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body
  const id = uuidv4()
  if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'User with username already exists' })
  }
  const user = { id, name, username, todos: [] }
  users.push(user)
  return res.status(200).json(user)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  return res.status(200).json(req.user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req

  const id = uuidv4()
  const todo = { id, title, done: false, deadline: new Date(deadline), created_at: new Date() }
  user.todos.push(todo)
  return res.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req

  let todo = user.todos.find(t => t.id === req.params.id)
  if (todo) {
      todo.title = title
      todo.deadline = new Date(deadline)
      return res.status(200).json(todo)
  }
  return res.status(404).json({ error: "Todo not found" })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req

    let todo = user.todos.find(t => t.id === req.params.id)
    if (todo) {
        todo.done = true
        return res.status(200).json(todo)
    }
    return res.status(404).json({ error: "Todo not found" })
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req

  let todoExists = user.todos.some(t => t.id === req.params.id)
  if (todoExists) {
      user.todos = user.todos.filter(t => t.id !== req.params.id)
      return res.status(204).json(user.todos)
  }
  return res.status(404).json({ error: "Todos is empty" })
})


module.exports = app;