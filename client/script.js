const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const nameBlock = document.getElementById('your-name')

if (messageForm != null) {

  do {
    const name = prompt('Ваше ім`я')
   
        if (name !== ''&& name !==null) { 
          appendMessage('Ви підключилися')
          nameBlock.innerHTML = `${name}`
          //відправити на сервер про нового user і в якій кімнаті він знаходиться
          socket.emit('new-user', roomName, name)
          //отримати від сервера що user підключився і відправити це всім крім цього user
          socket.on('user-connected', name => {
            appendMessage(`${name} підключився`)
          })
           }
        else if (name == null||name ==''){
            alert('Поле не може бути пустим');
            location.reload();
          }
        
      } while (name == null&&name=='');

      messageForm.addEventListener('submit', e => {
        e.preventDefault()
        //надіслати повідомлення на сервер яке ввів user та з якої кімнати
        const message = messageInput.value
        appendMessage(`Ви: ${message}`)
        socket.emit('send-chat-message', roomName, message)
        messageInput.value = ''
      })
}
//щоб кімната одразу створювалась в реальному часі у всіх клієнтів
socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'Приєднатися'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})
//отримати повідомлення від серверу та вставити його в html
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

// отримати від сервера що user відключився і відправити це всім крім цього user
socket.on('user-disconnected', name => {
  appendMessage(`${name} від'єднався`)
})
// функція яка створює div та append в наш message-container а також скролить до цього повідомлення
function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
  window.scrollTo(0,document.body.scrollHeight)
}