import { Usuario } from './Usuario.js';

// El propietario publica autos y ve las reservas que le hacen.
export class Propietario extends Usuario {
  get rol() { return 'propietario'; }

  secciones() {
    return ['inicio', 'catalogo', 'publicar', 'reservas', 'chat'];
  }

  puedePublicar() { return true; }

  // Con cuenta de propietario no se renta; para eso está la cuenta de cliente
  puedeReservar() { return false; }

  // Solo puede eliminar sus propios autos
  puedeEliminarAuto(auto) {
    return auto.propietarioId === this.id;
  }

  tituloReservas() { return 'Reservas de mis autos'; }

  obtenerReservas(repoReservas) {
    return repoReservas.deMisAutos(this.id);
  }
}
