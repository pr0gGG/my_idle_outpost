// Настройки: экспорт и импорт сохранения текстом.
(function (root) {
  const G = (root.G = root.G || {});
  const S = root.STR.settings;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  G.initSettings = function (state) {
    const gear = document.getElementById('btn-settings');
    const modal = el('div', 'modal'); modal.id = 'modal'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    const box = el('div', 'modal-box');
    const ta = el('textarea', 'save-text'); ta.rows = 5; ta.spellcheck = false; ta.setAttribute('aria-label', S.title);
    const bExport = el('button', 'btn small', S.export), bImport = el('button', 'btn small', S.import), bClose = el('button', 'btn small ghost', S.close);
    const row = el('div', 'modal-row'); row.append(bExport, bImport, bClose);
    box.append(el('h2', null, S.title), el('p', 'hint', S.hint), ta, row);
    modal.appendChild(box);
    document.getElementById('game').appendChild(modal);

    const close = () => { modal.hidden = true; };
    gear.addEventListener('click', () => { ta.value = ''; modal.hidden = false; });
    bClose.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    bExport.addEventListener('click', async () => {
      G.save(state);
      ta.value = G.exportSave(state);
      ta.select();
      try { await navigator.clipboard.writeText(ta.value); G.toast(S.copied); } catch (e) { G.toast(S.exported); }
    });

    bImport.addEventListener('click', () => {
      const text = ta.value.trim();
      if (!text) { G.toast(S.importEmpty); return; }
      let parsed;
      try { parsed = G.importSave(text); } catch (e) { G.toast(S.importBad); return; }
      if (!confirm(S.importConfirm)) return;
      G.save(parsed);            // записываем и перезагружаем: состояние инициализируется с нуля
      G.suppressSave = true;     // чтобы pagehide не затёр импортированное старым состоянием
      location.reload();
    });
  };
})(window);
