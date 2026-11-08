// Funciones sueltas para cosas de pantalla que se usan en varios lados.
export class Interfaz {
  static #temporizador = null;

  // Evita que un texto con HTML (por ejemplo <script>) se ejecute en la página
  static escapar(texto) {
    return String(texto ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  static dinero(numero) {
    return Number(numero).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  // De 2026-11-15 a 15/11/2026
  static fecha(texto) {
    const [anio, mes, dia] = texto.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  // Mensaje pequeño arriba a la derecha. tipo: 'ok' o 'error'
  static aviso(mensaje, tipo = 'ok') {
    const caja = document.getElementById('aviso');
    if (!caja) return;
    caja.textContent = mensaje;
    caja.className = `aviso ${tipo}`;
    clearTimeout(Interfaz.#temporizador);
    Interfaz.#temporizador = setTimeout(() => caja.classList.add('oculto'), 4000);
  }

  // Los errores de Supabase vienen en inglés; aquí traducimos los más comunes
  static traducirError(err) {
    const mensaje = err?.message || String(err);
    if (mensaje.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
    if (mensaje.includes('already registered')) return 'Ese correo ya tiene una cuenta.';
    if (mensaje.includes('at least 6 characters')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (mensaje.includes('row-level security')) return 'No tienes permiso para hacer esto.';
    return mensaje;
  }
}
