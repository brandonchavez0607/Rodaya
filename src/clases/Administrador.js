import { Propietario } from './Propietario.js';

export class Administrador extends Propietario {
  get rol() { return 'administrador'; }

  secciones() {
    return ['inicio', 'catalogo', 'publicar', 'reservas', 'chat', 'panel'];
  }

  puedeEliminarAuto(auto) { return true; }

  puedeReservar() { return true; }

  tituloReservas() { return 'Todas las reservas'; }

  obtenerReservas(repoReservas) {
    return repoReservas.todas();
  }
}
// El administrador puede eliminar cualquier auto, ver todas las reservas y reservar autos.