import { BaseRepository } from './BaseRepository.js';

export class MensajeRepository extends BaseRepository {
  constructor(supabase) {
    super(supabase, 'mensajes');
  }

  // Supabase solo devuelve los mensajes en los que participa el usuario
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

  // Una conversación es el chat entre un cliente y el propietario sobre un auto
  eliminarConversacion(autoId, clienteId) {
    return this.ejecutar(
      this.supabase.from('mensajes').delete()
        .eq('auto_id', autoId)
        .eq('cliente_id', clienteId)
    );
  }

  // Avisa cada vez que cambia la tabla de mensajes (tiempo real)
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
