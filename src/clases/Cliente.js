import { Usuario } from './Usuario.js';

export class Cliente extends Usuario {
  get rol() { return 'cliente'; }
}
// El cliente solo puede reservar autos y ver sus reservas.