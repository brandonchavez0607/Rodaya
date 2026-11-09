import { Usuario } from './Usuario.js';

// El propietario publica autos y ve las reservas que le hacen.
export class Propietario extends Usuario {
  get rol() { return 'propietario'; }

  secciones() {
    return ['inicio', 'catalogo', 'publicar', 'reservas', 'chat'];
  }

  puedePublicar() { return true; }

// Propietario no puede renta rsus autos, solo ver las reservas que le hacen.
  puedeReservar() { return false; }
  
// Propietario solo puede eliminar autos que él publicó.
  puedeEliminarAuto(auto) {
    return auto.propietarioId === this.id;
  }

  tituloReservas() { return 'Reservas de mis autos'; }

  obtenerReservas(repoReservas) {
    return repoReservas.deMisAutos(this.id);
  }
}
