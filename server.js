const cors = require('cors')
const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'DELETE']
  }
});

const { v4: uuidV4 } = require('uuid')

// const corsOptions = {
//   origin: '*', // Allow all origins
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
//   optionsSuccessStatus: 204 // For legacy browser support
// };
app.enable("trust proxy");
app.set('view engine', 'ejs')
// app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  console.log('router/get/');
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  console.log('router/get/:room ', req.params.room);
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  console.log('router/connection');
  socket.on('join-room', (roomId, userId) => {
    console.log('router/join-room ', roomId, userId);
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
      console.log('router/disconnect ', roomId, userId);
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)