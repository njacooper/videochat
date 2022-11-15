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
  console.log('socket id: ', socket.id)
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
