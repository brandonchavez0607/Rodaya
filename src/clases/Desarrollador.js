import { Administrador } from './Administrador.js';

// Cuenta de desarrollador: control total. Es la única que puede cambiar roles.
export class Desarrollador extends Administrador {
  get rol() { return 'desarrollador'; }

  puedeCambiarRoles() { return true; }
}
