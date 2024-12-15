import express from 'express';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

mongoose.connect('mongodb+srv://imabhir:User234@cluster0.hw8wy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
// Mongoose Connection
// mongoose.connect("mongodb+srv://imabhir:vc7Ot59nKLisSWm5@cluster0.hw8wy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//   , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((error) => {
//   console.error('MongoDB connection error:', error);
// });

// Message Schema and Model
const messageSchema = new mongoose.Schema({
  userName: String,
  message: String,
  avatar: String,
});

const Message = mongoose.model('Message', messageSchema);

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

let connectedUsers = 0;
let onlineUserName=[];
io.on('connection', (socket) => {
  console.log('A user connected');
  connectedUsers++;
  socket.on('setUsername', (userName) => {
    socket.userName = userName; 
    connectedUsers++;
    onlineUserName.push(userName);
    io.emit('totalUser', connectedUsers);
    io.emit('userOnline', onlineUserName);
    socket.broadcast.emit('newUser', userName);
    // console.log('Online users:', onlineUserName);
  });
  io.emit('totalUser', connectedUsers);
  io.emit('userOnline',onlineUserName);
  Message.find().then((messages) => {
    messages.forEach((message) => {
      socket.emit('receiveMessage', message);  // Emit each message individually
    });
  }).catch((error) => {
    console.log("error in find");
    
    console.error('Error fetching messages:', error);
  });
  socket.on('sendMessage', (message) => {
    const newMessage = new Message({
      userName: message.userName,
      message: message.message,
      avatar: message.avatar,
    });
    newMessage.save().then(() => {
      console.log('Message saved:', message);
    }).catch((error) => {
      console.error('Error saving message:', error);
    });

    socket.broadcast.emit('receiveMessage', message);
  });

  socket.on('typing', (userName) => {
    socket.broadcast.emit('typing', userName);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    connectedUsers--;
    io.emit('totalUser', connectedUsers);
    // remove socket.user from onlineUserName 
    onlineUserName = onlineUserName.filter(user => user !== socket.userName);
    io.emit('totalUser', connectedUsers);
    io.emit('userOnline', onlineUserName);  
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});



// mongodb+srv://imabhir:<db_password>@cluster0.hw8wy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// atlas
// // url-mongodb+srv://imabhir:<db_password>@cluster0.hw8wy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// // password - 7zZ1tC83OaR4oVui