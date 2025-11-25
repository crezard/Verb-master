import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Starting app mount...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App mounted successfully');
} catch (err) {
  console.error("Error mounting React app:", err);
  document.body.innerHTML += `<div style="color:red; padding:20px;">Failed to mount app: ${err}</div>`;
}