const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('client'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static('image'))
app.use(express.static('assets'))

const rooms = { 
}

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    // якщо кімната така існує то переміщує на головну сторінку знову 
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})
server.listen(3000, ()=>{
  console.log('server started')
  console.log('http://localhost:3000/')
})

io.on('connection', socket => {
  //отримати про те що підключився новий user і в якій кімнаті 
  socket.on('new-user', (room, name) => {
    //пудключитись у вибрану кімнату
    socket.join(room)
    rooms[room].users[socket.id] = name
    console.log(rooms)
    //відправити всім в конкретній кімнаті .to(room). крім user що він підключився
    socket.to(room).broadcast.emit('user-connected', name) 
  })
  //отримати повідомлення від клієнта який знаходиться в такій то кімнаті
  socket.on('send-chat-message', (room, message) => {
   //відправити повідомлення усім хто є в цій кімнаті .to(room). окрім людини яка відправила це повідомлення
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  //відправити повідомлення усім хто є в цій кімнаті .to(room). окрім людини яка відправила це повідомлення про те що вона покинула кімнату
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

