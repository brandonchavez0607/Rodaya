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

  // Solo funciona si quien lo pide es desarrollador (lo controla Supabase)
  cambiarRol(id, rol) {
    return this.ejecutar(
      this.supabase.from('perfiles').update({ rol }).eq('id', id).select()
    );
  }
}
