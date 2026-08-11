import React from 'react';
import { initCallbackListener, sendNUI, isDevBuild } from './bridge';
import { useTranslation } from './i18n';
import RadialMenu from './components/templates/RadialMenu';
import {
  sendTestRadial8,
  sendTestRadial6,
  sendTestRadial4,
  sendTestRadial2,
  sendTestRadialSubmenu,
  sendTestRadialDisabled,
  sendTestRadialClose,
} from './data/devTestMessages';

const SUPPORTED_LOCALES = ['en', 'fr', 'ar', 'cs', 'de', 'es', 'hu', 'it', 'ja', 'ko', 'nl', 'pl', 'pt-BR', 'ro', 'ru', 'sv', 'tr', 'uk', 'zh-CN', 'zh-TW'];

const dev = {
  panel: { position: 'fixed', top: 10, right: 10, width: 280, maxHeight: '90vh', overflow: 'auto', background: '#111', color: '#eee', border: '1px solid #333', borderRadius: 8, padding: 12, zIndex: 10000, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', fontFamily: 'system-ui, sans-serif' },
  btn: { display: 'block', width: '100%', padding: '7px 10px', margin: '0 0 6px 0', background: '#1f1f1f', color: '#eee', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', textAlign: 'left' },
  floating: { position: 'fixed', right: 12, bottom: 12, zIndex: 9999, background: '#7c4dff', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 16px', boxShadow: '0 6px 16px rgba(0,0,0,0.4)', cursor: 'pointer' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  select: { padding: '4px 8px', background: '#1f1f1f', color: '#eee', border: '1px solid #333', borderRadius: 4 },
  small: { fontSize: 11, opacity: 0.6, margin: '8px 0 4px' },
};

export default function App() {
  const [menu, setMenu] = React.useState(null); // { menuId, title?, slots }
  const [devOpen, setDevOpen] = React.useState(false);
  const { setLocale, setCustomTranslations, locale } = useTranslation();

  // Receive Lua -> NUI messages
  React.useEffect(() => {
    initCallbackListener();
    function handler(e) {
      const { action, payload } = e.data || {};
      if (!action) return;
      if (action === 'nui:locale:set') {
        if (payload?.locale) setLocale(payload.locale);
        if (payload?.translations) setCustomTranslations(payload.locale || locale, payload.translations);
        return;
      }
      if (action === 'nui:radial:open') { setMenu(payload); return; }
      if (action === 'nui:radial:update') { setMenu((prev) => (prev ? { ...prev, slots: payload?.slots ?? prev.slots } : payload)); return; }
      if (action === 'nui:radial:close') { setMenu(null); return; }
      if (isDevBuild) console.log('[NUI] unhandled:', action, payload);
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [setLocale, setCustomTranslations, locale]);

  // Esc = close ; Alt+M = dev menu
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && menu) {
        e.preventDefault();
        sendNUI('radial:close', { menuId: menu?.menuId });
        setMenu(null);
      } else if (isDevBuild && (e.altKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setDevOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  // Middle-click = close. The Lua keybind opens the wheel and immediately
  // SetNuiFocus(true, true)s — the mouse goes to the NUI, and the game-side
  // poll can't see further presses reliably. So the second click of the
  // toggle is detected here. 200ms debounce guards against the opening
  // mousedown also reaching this listener in the same frame (would close
  // instantly otherwise).
  React.useEffect(() => {
    if (!menu) return;
    const openedAt = Date.now();
    const onMouseDown = (e) => {
      if (e.button !== 1) return;
      if (Date.now() - openedAt < 200) return;
      e.preventDefault();
      sendNUI('radial:close', { menuId: menu?.menuId });
      setMenu(null);
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [menu]);

  const handleSelect = (slotId, path, stayOpen) => {
    sendNUI('radial:select', { menuId: menu?.menuId, slotId, path });
    if (!stayOpen) setMenu(null);
  };
  const handleClose = () => {
    sendNUI('radial:close', { menuId: menu?.menuId });
    setMenu(null);
  };

  return (
    <>
      {menu && <RadialMenu menu={menu} onSelect={handleSelect} onClose={handleClose} />}

      {isDevBuild && (!devOpen ? (
        <button style={dev.floating} onClick={() => setDevOpen(true)}>Dev</button>
      ) : (
        <div style={dev.panel}>
          <div style={dev.row}>
            <strong>Dev - Radial</strong>
            <button style={{ ...dev.btn, width: 'auto', margin: 0 }} onClick={() => setDevOpen(false)}>Close (Alt+M)</button>
          </div>
          <div style={dev.small}>Open a wheel</div>
          <button style={dev.btn} onClick={sendTestRadial8}>8 slots (wardrobe)</button>
          <button style={dev.btn} onClick={sendTestRadial6}>6 slots</button>
          <button style={dev.btn} onClick={sendTestRadial4}>4 slots (actions)</button>
          <button style={dev.btn} onClick={sendTestRadial2}>2 slots</button>
          <button style={dev.btn} onClick={sendTestRadialSubmenu}>With sub-menus</button>
          <button style={dev.btn} onClick={sendTestRadialDisabled}>With a disabled slot</button>
          <button style={dev.btn} onClick={sendTestRadialClose}>Close (nui:radial:close)</button>
          <div style={dev.small}>Language</div>
          <select style={dev.select} value={locale} onChange={(e) => setLocale(e.target.value)}>
            {SUPPORTED_LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
      ))}
    </>
  );
}
