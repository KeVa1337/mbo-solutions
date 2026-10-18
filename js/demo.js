/* Shared helpers for demo niche sites: fake form submit → toast */
(function () {
  var toast, timer;
  window.demoToast = function (text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'demo-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    requestAnimationFrame(function () { toast.classList.add('is-on'); });
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('is-on'); }, 4200);
  };
  document.querySelectorAll('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      window.demoToast('Це демо. На вашому сайті заявка одразу прийде вам у Telegram — з усіма деталями, які обрав клієнт.');
    });
  });
})();
