// Registro: envía datos a /registro y, en éxito, redirige al login.
const formRegistro = document.getElementById('formRegistro');
const mensaje = document.getElementById('mensaje');

formRegistro.addEventListener('submit', async (event) => {
  event.preventDefault();

  const cuerpo = {
    nombre: document.getElementById('nombre').value,
    correo: document.getElementById('correo').value,
    clave: document.getElementById('clave').value,
    categoria: document.getElementById('categoria').value,
  };

  try {
    const respuesta = await fetch('/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.mensaje || 'Error al registrar';
      mensaje.className = 'mensaje error';
      return;
    }

    mensaje.textContent = datos.mensaje;
    mensaje.className = 'mensaje exito';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  } catch (error) {
    mensaje.textContent = 'Error de conexión con el servidor';
    mensaje.className = 'mensaje error';
  }
});
