// Handle user onboarding
const form = document.getElementById('onboarding-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get username and avatar
  const username = document.getElementById('username').value;
  const selectedAvatarInput = document.querySelector('input[name="avatar"]:checked');

  // Validate input
  if (!username || !selectedAvatarInput) {
    alert("Please enter a username and select an avatar.");
    return;
  }

  const parentLabel = selectedAvatarInput.parentElement;
  const avatarImg = parentLabel.querySelector('img');
  const avatarSrc = new URL(avatarImg.getAttribute('src'), window.location.origin).href;
  console.log(avatarSrc);
  localStorage.setItem('username', username);
  localStorage.setItem('avatar', avatarSrc);
  console.log("enter btn click");
  
  window.location.href = './chat.html';
});
