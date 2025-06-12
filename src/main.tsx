
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx: Starting application');

const container = document.getElementById("root");
if (container) {
  console.log('main.tsx: Root container found, rendering app');
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("main.tsx: Root element not found");
}
