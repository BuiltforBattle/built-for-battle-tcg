
function showMessage(text) {
  const messageDiv = document.getElementById('gameMessage');
  if (messageDiv) {
    messageDiv.innerText = text;
    setTimeout(() => {
      messageDiv.innerText = '';
    }, 4000);
  } else {
    alert(text); // Fallback if gameMessage div is not present yet
  }
}
