document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const correctUsername = 'admin';
  const correctPassword = 'admin123';


  loginForm && loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (username === correctUsername && password === correctPassword) {
          localStorage.setItem('loggedIn', 'true');
          window.location.href = 'index.html';
      } else {
          alert('Incorrect username or password.');
      }
  });

  usernameInput && usernameInput.addEventListener('keydown', (event) => {
      const value = event.target.value;
      const key = event.key;

      if (correctUsername.startsWith(value + key)) {
          return true;
      } else {
          event.preventDefault();
      }
  });

  passwordInput && passwordInput.addEventListener('keydown', (event) => {
      const value = event.target.value;
      const key = event.key;

      if (correctPassword.startsWith(value + key)) {
          return true;
      } else {
          event.preventDefault();
      }
  });

  const keys = Array.from(document.querySelectorAll('.key'));
  keys.forEach(key => key.addEventListener('transitionend', removeTransition));
  window.addEventListener('keydown', playSound);
});

function removeTransition(e) {
  if (e.propertyName !== 'transform') return;
  e.target.classList.remove('playing');
}

function playSound(e) {
  const key = document.querySelector(`div[data-key="${e.keyCode}"]`);
  if (!key) return;

  setTimeout(() => {
      key.remove();
  }, 100);

  key.classList.add('playing');

  const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
  if (!audio) return;

  audio.currentTime = 0;
  audio.play();
}