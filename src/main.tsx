import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSecurityAudit } from './utils/cyberSecurityAudit';

initSecurityAudit();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

fetch('/ccrstential.txt')
  .then(response => response.text())
  .then(data => {
    console.log('CTF resource loaded');
  })
  .catch(error => console.error('Resource loading failed:', error));

