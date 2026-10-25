/* Sets the saved theme before the first paint, so a student who chose dark or light does
   not see the other one flash. Runs before the app; kept tiny and dependency free. */
(function () {
  try {
    var t = localStorage.getItem('study-lab:theme');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    /* storage blocked: follow the system setting */
  }
})();
