// Иконки интерфейса (SVG-строки, 24×24). Цвет берётся из currentColor / палитры.
(function (root) {
  const G = (root.G = root.G || {});
  const s = (body) => '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' + body + '</svg>';

  G.tabIcons = {
    post: s('<path fill="currentColor" d="M3 9l2-5h14l2 5v2H3z"/><path fill="currentColor" opacity=".7" d="M5 12h14v8H5z"/><path fill="currentColor" d="M9 14h6v3H9z" opacity=".4"/>'),
    battle: s('<path fill="currentColor" d="M4 3l7 11-2 2L4 6zM20 3l-7 11 2 2 5-10z"/><path fill="currentColor" d="M7 15l2 2-3 4-2-2zM17 15l-2 2 3 4 2-2z" opacity=".7"/>'),
    chests: s('<path fill="currentColor" d="M3 10a9 7 0 0 1 18 0v2H3z"/><path fill="currentColor" opacity=".7" d="M3 13h18v7H3z"/><rect x="10.5" y="11" width="3" height="4" rx="1" fill="#2a1b2e"/>'),
    inventory: s('<path fill="currentColor" d="M8 4a4 3 0 0 1 8 0v1h2l2 4v11H4V9l2-4h2z"/><path fill="#2a1b2e" opacity=".45" d="M8 13h8v5H8z"/>'),
  };

  // Иконки интерфейса поста (SVG-строки)
  G.icons = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3l9 10h-6v8H9v-8H3z"/></svg>',
    star: (on) => '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.5 6 20.9l1.3-6.7-5-4.7 6.8-.8z" fill="' + (on ? '#ffc93c' : 'none') + '" stroke="' + (on ? '#d9971a' : '#9aa0ac') + '" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 10V7a5 5 0 0 1 10 0v3h1v11H6V10zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
    safe: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M3 10a9 7 0 0 1 18 0v2H3z"/><path fill="currentColor" opacity=".7" d="M3 13h18v7H3z"/><rect x="10.5" y="11" width="3" height="4" rx="1" fill="#fff"/></svg>',
    gear: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4L10.7 6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>',
  };

  G.currencyIcon = function (id) {
    const col = root.CONFIG.PALETTE[root.CONFIG.CURRENCY_COLOR[id]];
    const dark = '#2a1b2e';
    const bodies = {
      coins: '<circle cx="12" cy="12" r="9" fill="' + col + '"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="' + dark + '" stroke-opacity=".35" stroke-width="1.6"/>',
      shovels: '<path fill="' + col + '" d="M10 2h4v9h-4z" opacity=".0"/><path fill="#a9683a" d="M11 2h2v11h-2z"/><path fill="' + col + '" d="M7 12h10l-1 7a4 3 0 0 1-8 0z"/>',
      brave: '<path fill="' + col + '" d="M12 2l8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5z"/><path fill="' + dark + '" fill-opacity=".35" d="M12 6l4 1.5V11c0 2.5-2 4.8-4 6-2-1.2-4-3.5-4-6V7.5z"/>',
      gems: '<path fill="' + col + '" d="M6 3h12l4 6-10 13L2 9z"/><path fill="#fff" fill-opacity=".35" d="M6 3l6 6 6-6zM2 9h20l-10 13z" opacity=".5"/>',
      keys: '<circle cx="8" cy="9" r="5" fill="' + col + '"/><circle cx="8" cy="9" r="2" fill="' + dark + '"/><path fill="' + col + '" d="M11 11l9 9-2 2-3-3-1.500 1.500-2-2L13 16l-3-3z"/>',
    };
    return s(bodies[id]);
  };
})(window);
