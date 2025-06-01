// src/index.js

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const mensaje = document.createElement('div');
  mensaje.className = 'alert alert-success';
  mensaje.textContent = 'Webpack y la app están funcionando correctamente 🎉';
  app.appendChild(mensaje);
});
