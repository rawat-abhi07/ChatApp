const chatWindow = document.getElementById('chat-window');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const onlineCount = document.getElementById('online-count');
const userTyping=document.getElementById('typing-user');
const onlineUsersContainer = document.getElementById('dropdown-content');
const onlineUsersElement = document.getElementById('online-users');
const socket = io();
let onlineUsers=[];
const username = localStorage.getItem('username') || 'Anonymous';


function displayMessage(text, sender = 'You', avatar = 'default-avatar.png', type = 'sent') {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);

  const col1 = document.createElement('div');
  col1.classList.add('col1');

  const col2 = document.createElement('div');
  col2.classList.add('col2');

  const avatarElement = document.createElement('img');
  avatarElement.classList.add('avatar');
  avatarElement.src = avatar;

  col1.appendChild(avatarElement);

  const nameElement = document.createElement('div');
  nameElement.classList.add('name');
  nameElement.innerText = sender;

  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.innerText = text;

  col2.appendChild(nameElement);
  col2.appendChild(messageText);

  messageElement.appendChild(col1);
  messageElement.appendChild(col2);
  chatWindow.appendChild(messageElement);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

window.onload = function () {
  const username = localStorage.getItem('username') || 'Anonymous';
  const avatar = localStorage.getItem('avatar') || 'default-avatar.png';

  document.getElementById('username').innerText = username;
  document.getElementById('user-avatar').src = avatar;
};

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const messageText = messageInput.value.trim();
  if (messageText) {
    const avatar = localStorage.getItem('avatar') || 'default-avatar.png';
    sendMessage(messageText, username,avatar);
    displayMessage(messageText, username, avatar);
    messageInput.value = '';
  }
});
messageInput.addEventListener('input',()=>{
  const username = localStorage.getItem('username') || 'Anonymous';

  socket.emit("typing", username);
});



onlineUsersElement.addEventListener('click', () => {
  const dropdownContent = document.getElementById('dropdown-content');
  dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
});

function updateOnlineUsersDropdown(users) {
  const onlineUsersContainer = document.getElementById('dropdown-content');
  onlineUsersContainer.innerHTML = ''; // Clear existing users
  users.forEach(user => {
    const userElement = document.createElement('p');
    userElement.textContent = user; // Add each user's name
    onlineUsersContainer.appendChild(userElement);
  });
}

socket.on("totalUser",(onlineUser)=>{
  // console.log("total user update ",onlineUser);
  
  onlineCount.innerHTML=onlineUser;
})

const sendMessage = (message, userName,avatar) => {
  socket.emit("sendMessage", {
    userName,
    message,
    avatar
  });
};

let typingTimeout;
socket.on("typing", (userName) => {
  userTyping.innerHTML = `${userName} `;
  document.getElementById('typing-indicator').hidden = false;

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    document.getElementById('typing-indicator').hidden = true;
  }, 2000);
});
socket.on('userOnline', (data) => {
  // console.log("data of online user ",data);
  
  onlineUsers = data;
  onlineCount.textContent = onlineUsers.length; 
  updateOnlineUsersDropdown(onlineUsers); 
});
socket.on("receiveMessage", (data) => {
  
  displayMessage(data.message, data.userName, data.avatar, "received");
});
socket.on('connect', () => {
  console.log("user connected ");
  
  const username = localStorage.getItem('username') || 'Anonymous';
  socket.emit('setUsername', username);
});

socket.on('newUser',(userName)=>{
  // add to chat that new user is added and name 
  const joinMessage = `${userName} has joined the chat.`;
  
  // Create a new div element for the join message
  const joinMessageElement = document.createElement('div');
  joinMessageElement.classList.add('join-message');
  joinMessageElement.innerText = joinMessage;
  
  // Append the message to the chat window
  chatWindow.appendChild(joinMessageElement);

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
});