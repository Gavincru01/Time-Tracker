window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = mustGet('toggleTimer');
  const resetBtn = mustGet('resetTimer');
  const display = mustGet('timerDisplay');

  let h = 0,
    m = 0,
    s = 0;
  let intervalId = null;
  let lastClickTime = 0;

  function render() {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    display.textContent = `${hh}:${mm}:${ss}`;
    resetBtn.disabled = h === 0 && m === 0 && s === 0;
  }

  function tick() {
    s++;
    if (s === 60) {
      s = 0;
      m++;
    }
    if (m === 60) {
      m = 0;
      h++;
    }
    render();
  }

  function toggleTimer() {
    const now = Date.now();
    if (now - lastClickTime < 300) return; // correct early return
    lastClickTime = now;

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      toggleBtn.textContent = 'Start';
    } else {
      intervalId = setInterval(tick, 1000);
      toggleBtn.textContent = 'Pause';
    }
  }

  function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    h = m = s = 0;
    toggleBtn.textContent = 'Start';
    render(); // update display
  }

  toggleBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetTimer);

  function mustGet(id) {
    const el = document.getElementById(id);
    if (!el) console.error(`Element #${id} not found`);
    return el;
  }

  render(); // initial render
});
