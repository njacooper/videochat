const express = require('express')
const app = require('express')()
const server = require('http').createServer(app)
const port = 8080
const cors = require('cors')

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())

app.get('/', (req, res) => {
  res.send('Video Chat')
})

io.on('connection', socket => {
  socket.emit('myId', socket.id)

  socket.on('makeCall', ({ to, from, signal }) => {
    io.to(to).emit('makeCall', { to, from, signal })
  })

  socket.on('answerCall', ({ to, signal }) => {
    console.log("call accepted: signal", signal)
    io.to(to).emit('callAccepted', signal)
  })

  socket.on('endCall', ({ to, from }) => {
    console.log('data to', to)
    console.log('data from', from)
    io.to(to).emit('callEnded', from)
    io.to(from).emit('callEnded', to)
  })
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
