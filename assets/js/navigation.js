(function () {
  function initializeNavigation(navToggle) {
    const navBar = navToggle.closest('nav');
    if (!navBar) return;
    const navLinks = navBar.querySelector('.nav-links');
    if (!navLinks) return;

    function closeNav() {
      navLinks.setAttribute('data-visible', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.getAttribute('data-visible') === 'true';
      const nextState = String(!isOpen);
      navLinks.setAttribute('data-visible', nextState);
      navToggle.setAttribute('aria-expanded', nextState);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        closeNav();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.nav-toggle').forEach(initializeNavigation);
    });
  } else {
    document.querySelectorAll('.nav-toggle').forEach(initializeNavigation);
  }
})();
