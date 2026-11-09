export class BaseRepository {
  constructor(supabase, tabla) {
    this.supabase = supabase;
    this.tabla = tabla;
  }

  async ejecutar(consulta) {
    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  listar() {
    return this.ejecutar(this.supabase.from(this.tabla).select('*'));
  }

  eliminar(id) {
    return this.ejecutar(this.supabase.from(this.tabla).delete().eq('id', id));
  }
}
//BaseRepository es una clase base que proporciona métodos comunes para interactuar con 
// una tabla específica en la base de datos Supabase. 
// Se utiliza como clase padre para repositorios específicos, como MensajeRepository, 
// PerfilRepository y ReservaRepository, que heredan de ella 
// y agregan métodos adicionales según sea necesario.