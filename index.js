const express = require('express')
const cors = require('cors')
const path = require('path')
const Note = require('./models/note')
const { request } = require('http')
// const mongoose = require('mongoose')

// require('dotenv').config()

// const password = process.argv[2]

// const url = process.env.MONGODB_URI

// console.log(url)

// mongoose.set('strictQuery', false)
// mongoose.connect(url)

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })

// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

// const Note = mongoose.model('Note', noteSchema)

const app = express()

// app.use(cors())

app.use(express.static('dist'))
app.use(express.json());




// let notes = [
//   {
//     id: "1",
//     content: "HTML is easy",
//     important: true
//   },
//   {
//     id: "22",
//     content: "Browser can execute only JavaScript",
//     important: false
//   },
//   {
//     id: "2",
//     content: "Browser can execute only JavaScript",
//     important: false
//   },
//   {
//     id: "3",
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true
//   }
// ]

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---');
  next()  
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformated id'})
  }

  next(error)
}

// app.use(express.json())


app.use(requestLogger)
const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}



app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      /* console.log(error);
      response.status(400).send({error: 'malformated id'})      
     */
      next(error)
    })
  /* const id = request.params.id
  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  } */
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
  // response.json(notes)
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, {new: true})
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
}) 

const generateId = () => {
  const maxId = notes.length > 0
  ? Math.max(...notes.map(n => Number(n.id)))
  : 0
  return String(maxId + 1)
}

app.post('/api/notes', (request, response) => {
  
  const body = request.body
  
  if(body.content === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  
  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false,
    // id: generateId()
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
  // note.id = String(maxId + 1)
  // console.log(maxId)
  // console.log(notes)
  
  /* notes = notes.concat(note)
  // console.log(note);
  // console.log(response)
  response.json(note)  */     
})

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
})
app.use(unknownEndpoint)
// app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})