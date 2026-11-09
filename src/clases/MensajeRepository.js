import { BaseRepository } from './BaseRepository.js';

export class MensajeRepository extends BaseRepository {
  constructor(supabase) {
    super(supabase, 'mensajes');
  }

  delUsuario() {
    return this.ejecutar(
      this.supabase.from('mensajes')
        .select('*, autos(marca, modelo)')
        .order('creado', { ascending: true })
    );
  }

  enviar(mensaje) {
    return this.ejecutar(this.supabase.from('mensajes').insert(mensaje));
  }

  eliminarConversacion(autoId, clienteId) {
    return this.ejecutar(
      this.supabase.from('mensajes').delete()
        .eq('auto_id', autoId)
        .eq('cliente_id', clienteId)
    );
  }

  escuchar(funcion) {
    return this.supabase
      .channel('chat-rodaya')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, funcion)
      .subscribe();
  }

  dejarDeEscuchar(canal) {
    if (canal) this.supabase.removeChannel(canal);
  }
}
