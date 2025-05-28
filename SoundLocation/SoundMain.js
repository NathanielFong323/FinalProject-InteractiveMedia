document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('#soundBtn');
  const keySoundMap = {
    'w': 'PhoneCall',
    'a': 'Notification',
    's': 'Alarm',
    'd': 'Switch',
    'r': 'Water',
    'v': 'Game',
    'g': 'Mall',
    'y': 'Road',
    'n': 'Tram',
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const soundId = button.getAttribute('data-sound');
      console.log(soundId);
      playSound(soundId);
    });
  });

//keyboard handler from https://stackoverflow.com/questions/1846599/how-to-find-out-what-character-key-is-pressed
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keySoundMap[key]) {
      playSound(keySoundMap[key]);
    }
  });

  function playSound(soundId) {
    const audio = document.getElementById(soundId);
    audio.currentTime = 0;
    audio.play();
  }
});
