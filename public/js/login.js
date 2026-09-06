// Login: valida credenciales y guarda el token para las próximas peticiones.
const formLogin = document.getElementById('formLogin');
const mensaje = document.getElementById('mensaje');

formLogin.addEventListener('submit', async (event) => {
  event.preventDefault();

  const cuerpo = {
    correo: document.getElementById('correo').value,
    clave: document.getElementById('clave').value,
  };

  try {
    const respuesta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.mensaje || 'Error al iniciar sesión';
      mensaje.className = 'mensaje error';
      return;
    }

    // Guardamos el token en localStorage para usarlo en el panel protegido.
    localStorage.setItem('token', datos.token);

    window.location.href = 'canal.html';
  } catch (error) {
    mensaje.textContent = 'Error de conexión con el servidor';
    mensaje.className = 'mensaje error';
  }
});
