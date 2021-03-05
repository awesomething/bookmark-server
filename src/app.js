const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const bookmarksRouter = require('./bookmarks/bookmarks-router')


const app = express()

const bookmarks = [
  {
    id: "01",
    name: "James"
  }
];

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
})

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.get('/bookmarks', (req, res) => {
  res.json(bookmarks)
})

app.get('/bookmarks/:id', (req, res) => {
    for (let i = 0; i < bookmarks.length; i++){
      if(bookmarks[i].id === req.params.id) {//inserts it in the Url
        return res.json(bookmarks[i])
      }
    }
    res.send("Not Found")
})

app.post('/bookmarks', (req, res) => {
  res.send('Hello, world!')
})

app.delete('/bookmarks/:id', (req, res) => {
  res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: 'server error' }
  } else {
    console.error(error)
    response = { error: error.message, details: error }
  }
  res.status(500).json(response)
})



module.exports = app
