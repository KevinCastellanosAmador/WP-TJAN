const structureMenu = document.querySelector('.menu-trigger');
const structureNav = document.querySelector('.nav');
structureMenu?.addEventListener('click', () => {
  const open = structureNav.classList.toggle('open');
  structureMenu.setAttribute('aria-expanded', String(open));
  structureMenu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  structureMenu.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
});
structureNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  structureNav.classList.remove('open');
  structureMenu.setAttribute('aria-expanded', 'false');
  structureMenu.setAttribute('aria-label', 'Abrir menú');
  structureMenu.querySelector('use').setAttribute('href', '#i-menu');
}));
document.querySelector('#directory-category')?.addEventListener('change', event => {
  const category = event.target.value;
  document.querySelectorAll('.person-card').forEach(card => { card.hidden = category !== 'all' && card.dataset.area !== category; });
});
