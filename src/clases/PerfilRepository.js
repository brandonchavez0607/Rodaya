import { BaseRepository } from './BaseRepository.js';

export class PerfilRepository extends BaseRepository {
  constructor(supabase) {
    super(supabase, 'perfiles');
  }

  todos() {
    return this.ejecutar(
      this.supabase.from('perfiles').select('*').order('usuario', { ascending: true })
    );
  }

  // Cambiar rol de un usuario solo puede hacerlo un administrador
  cambiarRol(id, rol) {
    return this.ejecutar(
      this.supabase.from('perfiles').update({ rol }).eq('id', id).select()
    );
  }
}
