const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')



const app = express()

const bookmarks = [
  {
    id: "1",
    title: "James",
    description:"A web to display beatiful moments and photos of newly born babies",
    url:"https://jamie.com",
    rating: 4
  },
  {
    id: "2",
    title: "Ross",
    description:"Website that talks about the raw energy of hiphop music and artistes",
    url:"https://ross.io",
    rating: 3
  },
  {
    id: "3",
    title: "Coco",
    description:"Ecommerce platform for all things breakfast",
    url:"https://teawithcoco.com",
    rating: 4
  },
  {
    id: "4",
    title: "Mario",
    description:"Platform for hiring mentors at your own time",
    url:"https://mariomentors.io",
    rating: 5
  }
];
const jsonparser= express.json();
const winston = require('winston');


// set up winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}


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

app.post('/bookmarks', jsonparser, (req, res) => {
  const { title, url, description, rating } = req.body;

  if (!title || !url ) {
    logger.error(`Title && url is required`);
    return res
      .status(400)
      .send('Title && url is required');
  }


  // get an id
  const id = uuid();

  const list = {
    id,
    title,
    description,
    url,
    rating
  };

  bookmarks.push(list);

  logger.info(`Bookmarks with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json({id});
});

app.delete('/bookmarks/:id', (req, res) => {
  const { id } = req.params;

  const bookmarksIndex = bookmarks.findIndex(li => li.id == id);

  if (bookmarksIndex === -1) {
    logger.error(`Bookmarks with id ${id} not found.`);
    return res
      .status(404)
      .send('Not Found');
  }

  bookmarks.splice(bookmarksIndex, 1);

  logger.info(`Bookmarks with id ${id} deleted.`);
  res
    .status(204)
    .end();
});

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
