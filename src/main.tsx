import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Как только этот файл начал выполняться, МГНОВЕННО убиваем лоадер
const loader = document.getElementById('initial-loader');
if (loader) {
  loader.remove();
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);