(() => {
  const storageKey = 'tjan-accessibility-v1';
  const defaults = { scale: 100, contrast: false, calm: false, readable: false, links: false };
  let settings = { ...defaults };
  try { settings = { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; } catch {}

  const utilityActions = document.querySelector('.utility-inner > div');
  if (!utilityActions) return;
  const trigger = document.createElement('button');
  trigger.className = 'access-trigger';
  trigger.type = 'button';
  trigger.id = 'access-trigger';
  trigger.setAttribute('aria-controls', 'access-panel');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'Abrir opciones de accesibilidad');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M3 9h18M12 6v15m-5-2 5-6 5 6"/></svg><span>Accesibilidad</span>';
  utilityActions.prepend(trigger);

  const panel = document.createElement('section');
  panel.id = 'access-panel';
  panel.className = 'access-panel';
  panel.setAttribute('aria-label', 'Opciones de accesibilidad');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="access-panel-head"><div><strong>Accesibilidad</strong><span>Ajusta la lectura a tus necesidades.</span></div><button class="access-close" type="button" aria-label="Cerrar opciones de accesibilidad">×</button></div>
    <div class="access-size"><span>Tamaño del contenido</span><div><button type="button" data-size="-10" aria-label="Reducir tamaño del contenido">A−</button><output id="access-scale" aria-live="polite">100%</output><button type="button" data-size="10" aria-label="Aumentar tamaño del contenido">A+</button></div></div>
    <div class="access-options">
      <button type="button" data-access="contrast" aria-pressed="false"><span class="access-option-icon">◐</span><span>Alto contraste</span></button>
      <button type="button" data-access="calm" aria-pressed="false"><span class="access-option-icon">◌</span><span>Reducir movimiento</span></button>
      <button type="button" data-access="readable" aria-pressed="false"><span class="access-option-icon">≡</span><span>Lectura espaciada</span></button>
      <button type="button" data-access="links" aria-pressed="false"><span class="access-option-icon">⌁</span><span>Resaltar enlaces</span></button>
      <button type="button" id="access-read" aria-pressed="false"><span class="access-option-icon">♫</span><span>Leer texto</span></button>
    </div>
    <p class="access-note">«Leer texto» reproduce la selección o los primeros párrafos. También puedes navegar con teclado y lectores de pantalla.</p>
    <button class="access-reset" type="button">Restablecer ajustes</button>
    <span class="sr-only" id="access-status" role="status"></span>`;
  document.body.append(panel);

  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch {} };
  function apply() {
    const root = document.documentElement;
    settings.scale = Math.max(100, Math.min(140, Number(settings.scale) || 100));
    root.style.zoom = settings.scale === 100 ? '' : `${settings.scale}%`;
    const factor = settings.scale / 100;
    panel.style.width = `${Math.min(350, (window.innerWidth - 24) / factor)}px`;
    panel.style.maxHeight = `${Math.max(200, (window.innerHeight - 60) / factor)}px`;
    root.classList.toggle('access-high-contrast', settings.contrast);
    root.classList.toggle('access-reduce-motion', settings.calm);
    root.classList.toggle('access-readable', settings.readable);
    root.classList.toggle('access-links', settings.links);
    panel.querySelector('#access-scale').textContent = `${settings.scale}%`;
    panel.querySelectorAll('[data-access]').forEach(button => button.setAttribute('aria-pressed', String(Boolean(settings[button.dataset.access]))));
    save();
  }
  apply();
  window.addEventListener('resize', apply, { passive: true });

  function setOpen(open) {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Cerrar opciones de accesibilidad' : 'Abrir opciones de accesibilidad');
    if (open) panel.querySelector('.access-close').focus(); else trigger.focus();
  }
  trigger.addEventListener('click', () => setOpen(panel.hidden));
  panel.querySelector('.access-close').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) setOpen(false); });
  document.addEventListener('pointerdown', event => { if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) setOpen(false); });
  panel.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => { settings.scale += Number(button.dataset.size); apply(); }));
  panel.querySelectorAll('[data-access]').forEach(button => button.addEventListener('click', () => { settings[button.dataset.access] = !settings[button.dataset.access]; apply(); }));
  panel.querySelector('.access-reset').addEventListener('click', () => { settings = { ...defaults }; apply(); panel.querySelector('#access-status').textContent = 'Ajustes restablecidos'; });

  const readButton = panel.querySelector('#access-read');
  if (!('speechSynthesis' in window)) { readButton.disabled = true; readButton.title = 'La lectura en voz alta no está disponible en este navegador'; }
  else {
    readButton.addEventListener('click', () => {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); readButton.setAttribute('aria-pressed', 'false'); return; }
      const selected = String(window.getSelection()).trim();
      const paragraphs = [...document.querySelectorAll('main h1, main h2, main h3, main p')].map(node => node.textContent.trim()).filter(Boolean).join('. ');
      const utterance = new SpeechSynthesisUtterance((selected || paragraphs).slice(0, 2800));
      utterance.lang = 'es-MX';
      utterance.rate = 0.92;
      utterance.onend = utterance.onerror = () => readButton.setAttribute('aria-pressed', 'false');
      speechSynthesis.speak(utterance);
      readButton.setAttribute('aria-pressed', 'true');
    });
  }
})();
