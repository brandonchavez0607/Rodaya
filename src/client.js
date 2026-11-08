import { RentaManager } from './clases/RentaManager.js';
import { Interfaz } from './clases/Interfaz.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // El servidor nos da la URL y la llave pública de Supabase (viene del .env)
    const respuesta = await fetch('/api/config');
    const config = await respuesta.json();
    if (!respuesta.ok) throw new Error(config.error);

    const supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
    const app = new RentaManager(supabase);
    await app.iniciar();
  } catch (err) {
    console.error(err);
    Interfaz.aviso(`No se pudo iniciar Rodaya: ${err.message}`, 'error');
  }
});
