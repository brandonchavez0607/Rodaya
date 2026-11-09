import { Cliente } from './Cliente.js';
import { Propietario } from './Propietario.js';
import { Administrador } from './Administrador.js';
import { Desarrollador } from './Desarrollador.js';

const CLASES_POR_ROL = {
  cliente: Cliente,
  propietario: Propietario,
  administrador: Administrador,
  desarrollador: Desarrollador,
};

export class AuthService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async #armarUsuario(user) {
    const { data: perfil, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;

    const Clase = CLASES_POR_ROL[perfil.rol] || Cliente;
    return new Clase(user.id, user.email, perfil.usuario);
  }

  async sesionActual() {
    const { data } = await this.supabase.auth.getSession();
    if (!data.session) return null;
    try {
      return await this.#armarUsuario(data.session.user);
    } catch (err) {
      return null;
    }
  }

  async iniciarSesion(correo, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: correo,
      password,
    });
    if (error) throw error;
    return this.#armarUsuario(data.user);
  }

  async registrar(correo, password, usuario, rol) {
    const { data, error } = await this.supabase.auth.signUp({
      email: correo,
      password,
      options: { data: { usuario, rol } },
    });
    if (error) throw error;
    if (!data.session) return null;
    return this.#armarUsuario(data.user);
  }

  async cerrarSesion() {
    await this.supabase.auth.signOut();
  }
}
// AuthService es una clase que maneja la autenticación de usuarios en la aplicación.