import { Usuario } from './Usuario.js';

// El cliente renta autos. No necesita cambiar nada de la clase base.
export class Cliente extends Usuario {
  get rol() { return 'cliente'; }
}
