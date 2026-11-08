import { BaseRepository } from './BaseRepository.js';

// Trae también el auto y el nombre del cliente para mostrarlos en pantalla
const CAMPOS = '*, autos(marca, modelo), perfiles(usuario)';

export class ReservaRepository extends BaseRepository {
  constructor(supabase) {
    super(supabase, 'reservas');
  }

  crear(fila) {
    return this.ejecutar(this.supabase.from('reservas').insert(fila));
  }

  deCliente(clienteId) {
    return this.ejecutar(
      this.supabase.from('reservas').select(CAMPOS)
        .eq('cliente_id', clienteId)
        .order('creado', { ascending: false })
    );
  }

  // Reservas hechas sobre los autos de este propietario
  deMisAutos(propietarioId) {
    return this.ejecutar(
      this.supabase.from('reservas')
        .select('*, autos!inner(marca, modelo, propietario_id), perfiles(usuario)')
        .eq('autos.propietario_id', propietarioId)
        .order('creado', { ascending: false })
    );
  }

  todas() {
    return this.ejecutar(
      this.supabase.from('reservas').select(CAMPOS).order('creado', { ascending: false })
    );
  }

  // Última reserva de un cliente sobre un auto (para mostrarla en el chat)
  async ultimaDe(autoId, clienteId) {
    const filas = await this.ejecutar(
      this.supabase.from('reservas').select('*')
        .eq('auto_id', autoId)
        .eq('cliente_id', clienteId)
        .order('creado', { ascending: false })
        .limit(1)
    );
    return filas[0] || null;
  }

  // Revisa si ya hay una reserva que se cruza con esas fechas
  async hayTraslape(autoId, inicio, fin) {
    const { data, error } = await this.supabase.rpc('hay_traslape', {
      p_auto: autoId,
      p_inicio: inicio,
      p_fin: fin,
    });
    if (error) throw error;
    return data;
  }
}
