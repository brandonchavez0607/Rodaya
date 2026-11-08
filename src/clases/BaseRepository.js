// Clase base para hablar con una tabla de Supabase.
// Los repositorios (AutoRepository, etc.) heredan de aquí.
export class BaseRepository {
  constructor(supabase, tabla) {
    this.supabase = supabase;
    this.tabla = tabla;
  }

  // Espera la consulta y lanza el error si Supabase lo devuelve
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
