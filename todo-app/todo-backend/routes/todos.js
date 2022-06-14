const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const { getAsync, setAsync } = require("../redis/index");

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  setAsync("totalCount", todos.length);
  res.send(todos);
});

router.get('/stats', async (_, res) => {
  const totalTodos = await getAsync("totalCount");
  const addedTodos = await getAsync("addedTodos")
  res.send({totalTodos,addedTodos});
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  console.log(req.body);
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  // let pastTotal = await getAsync("addedTodos");
  // if (pastTotal == 0) {
  //   setAsync("addedTodos", 1);
  // } else {
  //   setAsync("addedTodos", pastTotal++);
  // }
  
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo);
  //res.sendStatus(200); // Implement this
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  await req.todo.update({ text: req.body.text });
  res.sendStatus(200); // Implement this
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
