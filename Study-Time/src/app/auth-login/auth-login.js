function validateEmail() {
  const username = document.getElementById('username');
  const errorMessage = document.getElementById('errorMessage');
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic regex

  if (emailFormat.test(username.value)) {
    errorMessage.style.display = 'none'; // ✅ hide error
    errorMessage.textContent = ''; // clear text
    console.log('Email is valid!');
    // proceed with form submission here
  } else {
    errorMessage.style.display = 'block'; // ✅ show error
    errorMessage.textContent = 'Please enter a valid email address.';
    username.focus();
  }
}
