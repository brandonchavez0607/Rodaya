import { BaseRepository } from './BaseRepository.js';
import { Auto } from './Auto.js';

export class AutoRepository extends BaseRepository {
  constructor(supabase) {
    super(supabase, 'autos');
  }

  // Devuelve objetos Auto, los más nuevos primero
  async listar() {
    const filas = await this.ejecutar(
      this.supabase.from('autos').select('*').order('creado', { ascending: false })
    );
    return filas.map(fila => new Auto(fila));
  }

  crear(datos) {
    return this.ejecutar(this.supabase.from('autos').insert(datos));
  }

  // Sube la foto al bucket "autos" y devuelve su URL pública
  async subirImagen(archivo, usuarioId) {
    const extension = archivo.name.split('.').pop();
    const ruta = `${usuarioId}/${Date.now()}.${extension}`;

    const { error } = await this.supabase.storage.from('autos').upload(ruta, archivo);
    if (error) throw error;

    const { data } = this.supabase.storage.from('autos').getPublicUrl(ruta);
    return data.publicUrl;
  }
}
