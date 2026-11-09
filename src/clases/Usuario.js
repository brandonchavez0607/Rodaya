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

  get rol() { return 'cliente'; }

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
