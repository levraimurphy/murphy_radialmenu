import React from 'react';
import { sendNUI, isDevBuild } from '../bridge';

const CLOSE_ACTIONS = ['radial:close'];

// A render crash unmounts the whole tree, taking every Escape listener with
// it — the player would be stuck in NUI focus. Close the menu Lua-side and
// vanish instead. failsafe.js (public/) keys off __murphyUiAlive to keep an
// emergency Escape available afterwards.
export default class CrashGuard extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidMount() {
    if (!this.state.hasError) window.__murphyUiAlive = true;
  }

  componentDidCatch(error) {
    window.__murphyUiAlive = false;
    CLOSE_ACTIONS.forEach((action) => sendNUI(action, {}));
    if (isDevBuild) console.error('[CrashGuard]', error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
