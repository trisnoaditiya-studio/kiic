/* KIIC Design System — perilaku komponen interaktif. Vanilla JS, tanpa dependensi.
   Inisialisasi otomatis via atribut data-k-*. Aman dipanggil ulang: KIIC.init(root). */
(function () {
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // Disclosure umum: mega menu, mobile menu, dropdown. [data-k-toggle] aria-controls="id"
  function initToggles(root) {
    $$('[data-k-toggle]', root).forEach((btn) => {
      if (btn.dataset.kReady) return; btn.dataset.kReady = '1';
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      const group = btn.dataset.kToggle; // tutup panel lain dalam grup yang sama
      const set = (open) => {
        btn.setAttribute('aria-expanded', String(open)); panel.hidden = !open;
        if (open && group === 'dropdown') panel.querySelector('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
      };
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        if (open && group) $$(`[data-k-toggle="${group}"][aria-expanded="true"]`).forEach((o) => o !== btn && o.click());
        set(open);
      });
      panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); btn.focus(); } });
      btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
      document.addEventListener('click', (e) => {
        if (group && btn.getAttribute('aria-expanded') === 'true' && !panel.contains(e.target) && !btn.contains(e.target)) set(false);
      });
      if (group === 'dropdown') {
        panel.addEventListener('keydown', (e) => {
          const items = $$('[role="menuitem"]:not([aria-disabled="true"])', panel);
          const i = items.indexOf(document.activeElement);
          if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
        });
      }
    });
  }

  // Tabs: [role=tablist] dengan [role=tab] aria-controls → [role=tabpanel]
  function initTabs(root) {
    $$('[role="tablist"]', root).forEach((list) => {
      if (list.dataset.kReady) return; list.dataset.kReady = '1';
      const tabs = $$('[role="tab"]', list);
      const select = (tab) => {
        tabs.forEach((t) => {
          const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
          const p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
        });
        tab.focus();
      };
      tabs.forEach((t) => t.addEventListener('click', () => !t.disabled && select(t)));
      list.addEventListener('keydown', (e) => {
        const live = tabs.filter((t) => !t.disabled); const i = live.indexOf(document.activeElement);
        if (e.key === 'ArrowRight') select(live[(i + 1) % live.length]);
        if (e.key === 'ArrowLeft') select(live[(i - 1 + live.length) % live.length]);
        if (e.key === 'Home') select(live[0]);
        if (e.key === 'End') select(live[live.length - 1]);
      });
    });
  }

  // Modal: tombol [data-k-modal-open="id"] membuka <dialog id>. [data-k-modal-close] menutup.
  function initModals(root) {
    $$('[data-k-modal-open]', root).forEach((btn) => {
      if (btn.dataset.kReady) return; btn.dataset.kReady = '1';
      const dlg = document.getElementById(btn.dataset.kModalOpen);
      btn.addEventListener('click', () => dlg?.showModal());
    });
    $$('dialog.k-modal', root).forEach((dlg) => {
      if (dlg.dataset.kReady) return; dlg.dataset.kReady = '1';
      $$('[data-k-modal-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // klik backdrop
    });
  }

  // Toast: KIIC.toast({ variant: 'success'|'error'|'warning'|'info', title, message })
  function toast({ variant = 'info', title = '', message = '', timeout = 6000 } = {}) {
    let region = document.querySelector('.k-toast-region');
    if (!region) {
      region = document.createElement('div'); region.className = 'k-toast-region';
      region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    const el = document.createElement('div'); el.className = `k-toast k-toast-${variant}`;
    if (variant === 'error') el.setAttribute('role', 'alert');
    const body = document.createElement('div'); body.style.flex = '1';
    const t = document.createElement('p'); t.className = 'k-toast-title'; t.textContent = title;
    const m = document.createElement('p'); m.className = 'k-toast-msg'; m.textContent = message;
    const x = document.createElement('button'); x.className = 'k-icon-btn'; x.setAttribute('aria-label', 'Tutup notifikasi'); x.textContent = '×';
    x.addEventListener('click', () => el.remove());
    body.append(t, m); el.append(body, x); region.appendChild(el);
    if (timeout && variant !== 'error') setTimeout(() => el.remove(), timeout);
    return el;
  }
  function initToastTriggers(root) {
    $$('[data-k-toast]', root).forEach((b) => {
      if (b.dataset.kReady) return; b.dataset.kReady = '1';
      b.addEventListener('click', () => toast(JSON.parse(b.dataset.kToast)));
    });
  }

  // Hero video: hormati prefers-reduced-motion, tombol pause/putar.
  function initHero(root) {
    $$('.k-hero', root).forEach((hero) => {
      if (hero.dataset.kReady) return; hero.dataset.kReady = '1';
      const video = hero.querySelector('video.k-hero-media'); const btn = hero.querySelector('.k-hero-pause');
      if (!video || !btn) return;
      const label = btn.querySelector('[data-k-label]');
      const sync = () => {
        const paused = video.paused; btn.setAttribute('aria-pressed', String(paused));
        if (label) label.textContent = paused ? 'Putar video' : 'Jeda video';
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.removeAttribute('autoplay'); video.pause(); }
      btn.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
      video.addEventListener('play', sync); video.addEventListener('pause', sync); sync();
    });
  }

  function init(root) { initToggles(root); initTabs(root); initModals(root); initToastTriggers(root); initHero(root); }
  window.KIIC = { init, toast };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
