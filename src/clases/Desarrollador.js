import { Administrador } from './Administrador.js';

export class Desarrollador extends Administrador {
  get rol() { return 'desarrollador'; }

  puedeCambiarRoles() { return true; }
}
//solo el desarrollador puede cambiar roles