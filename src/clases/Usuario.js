// Clase base: todos los tipos de cuenta heredan de aquí.
// Las subclases cambian (sobrescriben) los métodos según lo que puede hacer cada rol.
export class Usuario {
  #id;
  #correo;
  #usuario;

  constructor(id, correo, usuario) {
    this.#id = id;
    this.#correo = correo;
    this.#usuario = usuario;
  }

  get id() { return this.#id; }
  get correo() { return this.#correo; }
  get usuario() { return this.#usuario; }

  // Cada subclase devuelve su propio rol
  get rol() { return 'cliente'; }

  // Secciones del menú que puede ver este usuario
  secciones() {
    return ['inicio', 'catalogo', 'reservas', 'chat'];
  }

  puedeReservar() { return true; }
  puedePublicar() { return false; }
  puedeEliminarAuto(auto) { return false; }
  puedeCambiarRoles() { return false; }

  tituloReservas() { return 'Mis reservas'; }

  // El cliente solo ve las reservas que él hizo
  obtenerReservas(repoReservas) {
    return repoReservas.deCliente(this.id);
  }
}
