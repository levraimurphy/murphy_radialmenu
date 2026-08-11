import React from 'react';
import ReactDOM from 'react-dom/client';
import { TranslationProvider } from './i18n';
import App from './App';
import CrashGuard from './components/CrashGuard';
import './styles/index.css';
import './styles/fonts.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TranslationProvider>
      <CrashGuard>
        <App />
      </CrashGuard>
    </TranslationProvider>
  </React.StrictMode>
);
