// Panel: si hay token, pide el canal protegido; si no, devuelve al login.
const bienvenida = document.getElementById('bienvenida');
const mensaje = document.getElementById('mensaje');
const token = localStorage.getItem('token');


if (!token) {
  window.location.href = 'login.html';
}

const cargarCanal = async (token) => {
  try {
    const respuesta = await fetch('/canal', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      // Token inválido o vencido: limpiar y volver al login.
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    const datos = await respuesta.json();
    bienvenida.textContent = datos.mensaje + ', ' + datos.nombre;
  } catch (error) {
    mensaje.textContent = 'Error de conexión con el servidor';
    mensaje.className = 'mensaje error';
  }
};

if (token) {
  cargarCanal(token);
}
