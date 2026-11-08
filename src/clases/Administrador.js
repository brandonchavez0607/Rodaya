import { Propietario } from './Propietario.js';

// El administrador puede hacer todo lo del propietario, y además
// ve todas las reservas, elimina cualquier auto y entra al panel de usuarios.
export class Administrador extends Propietario {
  get rol() { return 'administrador'; }

  secciones() {
    return ['inicio', 'catalogo', 'publicar', 'reservas', 'chat', 'panel'];
  }

  puedeEliminarAuto(auto) { return true; }

  // El administrador sí puede reservar (sirve para probar el sistema)
  puedeReservar() { return true; }

  tituloReservas() { return 'Todas las reservas'; }

  obtenerReservas(repoReservas) {
    return repoReservas.todas();
  }
}
