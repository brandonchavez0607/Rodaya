import { AuthService } from './AuthService.js';
import { AutoRepository } from './AutoRepository.js';
import { ReservaRepository } from './ReservaRepository.js';
import { PerfilRepository } from './PerfilRepository.js';
import { Reserva } from './Reserva.js';
import { ChatManager } from './ChatManager.js';
import { Interfaz } from './Interfaz.js';

const ROLES = ['cliente', 'propietario', 'administrador', 'desarrollador'];

export class RentaManager {
  #usuario = null;
  #autos = [];
  #autoElegido = null;

  constructor(supabase) {
    this.auth = new AuthService(supabase);
    this.autos = new AutoRepository(supabase);
    this.reservas = new ReservaRepository(supabase);
    this.perfiles = new PerfilRepository(supabase);
    this.chat = new ChatManager(supabase, this);
  }

  get usuario() { return this.#usuario; }

  async iniciar() {
    this.conectarEventos();
    this.#usuario = await this.auth.sesionActual();
    this.actualizarMenu();
    this.mostrarSeccion('inicio');
  }

  seccionesPermitidas() {
    if (!this.#usuario) return ['inicio', 'catalogo', 'auth'];
    return this.#usuario.secciones();
  }

  mostrarSeccion(id) {
    if (!this.seccionesPermitidas().includes(id)) id = 'inicio';

    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
    document.getElementById(`seccion-${id}`).classList.add('activa');
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('actual', btn.dataset.target === id);
    });

    if (id === 'catalogo') this.cargarCatalogo();
    if (id === 'reservas') this.cargarReservas();
    if (id === 'chat') this.chat.abrir();
    if (id === 'panel') this.cargarPanel();
  }

  actualizarMenu() {
    const permitidas = this.seccionesPermitidas();
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('oculto', !permitidas.includes(btn.dataset.target));
    });

    document.getElementById('zona-usuario').classList.toggle('oculto', !this.#usuario);
    if (this.#usuario) {
      document.getElementById('saludo').textContent = `${this.#usuario.usuario} · ${this.#usuario.rol}`;
    }
  }

  conectarEventos() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.mostrarSeccion(btn.dataset.target));
    });
    document.getElementById('btn-inicio-catalogo').addEventListener('click', () => this.mostrarSeccion('catalogo'));
    document.getElementById('btn-salir').addEventListener('click', () => this.cerrarSesion());

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.cambiarTab(tab.dataset.form));
    });
    document.getElementById('form-login').addEventListener('submit', e => this.iniciarSesion(e));
    document.getElementById('form-registro').addEventListener('submit', e => this.registrarUsuario(e));

    document.getElementById('form-publicar').addEventListener('submit', e => this.publicarAuto(e));
    document.getElementById('grid-autos').addEventListener('click', e => this.clicEnTarjeta(e));
    document.getElementById('tabla-usuarios').addEventListener('change', e => this.cambiarRol(e));

    const formReserva = document.getElementById('form-reserva');
    formReserva.addEventListener('input', () => this.actualizarResumen());
    formReserva.addEventListener('submit', e => this.confirmarReserva(e));
    document.getElementById('res-cancelar').addEventListener('click', () => {
      document.getElementById('dialogo-reserva').close();
    });

    this.chat.conectarEventos();
  }

  cambiarTab(idFormulario) {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('actual', tab.dataset.form === idFormulario);
    });
    document.getElementById('form-login').classList.toggle('oculto', idFormulario !== 'form-login');
    document.getElementById('form-registro').classList.toggle('oculto', idFormulario !== 'form-registro');
  }

  async iniciarSesion(e) {
    e.preventDefault();
    const correo = document.getElementById('login-correo').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      this.#usuario = await this.auth.iniciarSesion(correo, password);
      e.target.reset();
      this.actualizarMenu();
      Interfaz.aviso(`Bienvenido, ${this.#usuario.usuario}`);
      this.mostrarSeccion('catalogo');
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  async registrarUsuario(e) {
    e.preventDefault();
    const usuario = document.getElementById('reg-usuario').value.trim();
    const correo = document.getElementById('reg-correo').value.trim();
    const password = document.getElementById('reg-password').value;
    const rol = document.getElementById('reg-rol').value;

    if (usuario.length < 3) {
      Interfaz.aviso('El nombre de usuario debe tener al menos 3 caracteres.', 'error');
      return;
    }

    try {
      const nuevo = await this.auth.registrar(correo, password, usuario, rol);
      e.target.reset();

      if (!nuevo) {
        // Supabase pide confirmar el correo antes de dejar entrar
        Interfaz.aviso('Cuenta creada. Confirma tu correo y luego inicia sesión.');
        this.cambiarTab('form-login');
        return;
      }

      this.#usuario = nuevo;
      this.actualizarMenu();
      Interfaz.aviso(`Cuenta creada. Bienvenido, ${nuevo.usuario}`);
      this.mostrarSeccion('catalogo');
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  async cerrarSesion() {
    await this.auth.cerrarSesion();
    this.chat.cerrar();
    this.#usuario = null;
    this.actualizarMenu();
    this.mostrarSeccion('inicio');
  }

  async cargarCatalogo() {
    const grid = document.getElementById('grid-autos');
    grid.innerHTML = '<p class="vacio">Cargando autos...</p>';

    try {
      this.#autos = await this.autos.listar();
      if (this.#autos.length === 0) {
        grid.innerHTML = '<p class="vacio">Todavía no hay autos publicados.</p>';
        return;
      }
      grid.innerHTML = this.#autos.map(auto => this.tarjetaAuto(auto)).join('');
    } catch (err) {
      grid.innerHTML = '';
      Interfaz.aviso(`No se pudo cargar el catálogo: ${Interfaz.traducirError(err)}`, 'error');
    }
  }

  tarjetaAuto(auto) {
    const foto = auto.imagenUrl
      ? `<img class="card-img" src="${Interfaz.escapar(auto.imagenUrl)}" alt="${Interfaz.escapar(auto.nombre)}">`
      : '<div class="card-img sin-foto">Sin foto</div>';

    const botonEliminar = this.#usuario?.puedeEliminarAuto(auto)
      ? `<button type="button" class="btn-link peligro" data-accion="eliminar" data-id="${auto.id}">Eliminar</button>`
      : '';

    return `
      <article class="card">
        ${foto}
        <div class="card-cuerpo">
          <h3>${Interfaz.escapar(auto.nombre)}</h3>
          <p class="descripcion">${Interfaz.escapar(auto.descripcion)}</p>
          <p class="datos">${auto.pasajeros} pasajeros</p>
          <p class="precio">${Interfaz.dinero(auto.precioDia)} <span>/ día</span></p>
          <div class="acciones">
            <button type="button" class="btn-primary" data-accion="reservar" data-id="${auto.id}">Reservar</button>
            <button type="button" class="btn-secondary" data-accion="preguntar" data-id="${auto.id}">Preguntar</button>
            ${botonEliminar}
          </div>
        </div>
      </article>`;
  }

  clicEnTarjeta(e) {
    const boton = e.target.closest('button[data-accion]');
    if (!boton) return;

    const auto = this.#autos.find(a => a.id === Number(boton.dataset.id));
    if (!auto) return;
    const accion = boton.dataset.accion;

    if (accion === 'eliminar') {
      this.eliminarAuto(auto);
      return;
    }

    if (!this.#usuario) {
      Interfaz.aviso('Inicia sesión para continuar.', 'error');
      this.mostrarSeccion('auth');
      return;
    }
    if (auto.propietarioId === this.#usuario.id) {
      Interfaz.aviso('Este auto es tuyo.', 'error');
      return;
    }

    if (accion === 'reservar') {
      if (!this.#usuario.puedeReservar()) {
        Interfaz.aviso('Con cuenta de propietario no se puede reservar. Usa una cuenta de cliente.', 'error');
        return;
      }
      this.abrirReserva(auto);
    }
    if (accion === 'preguntar') this.chat.abrirConAuto(auto);
  }

  async eliminarAuto(auto) {
    if (!confirm(`¿Eliminar ${auto.nombre}? También se borran sus reservas y chats.`)) return;
    try {
      await this.autos.eliminar(auto.id);
      Interfaz.aviso('Auto eliminado.');
      this.cargarCatalogo();
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  async publicarAuto(e) {
    e.preventDefault();
    const marca = document.getElementById('pub-marca').value.trim();
    const modelo = document.getElementById('pub-modelo').value.trim();
    const descripcion = document.getElementById('pub-descripcion').value.trim();
    const precio = parseFloat(document.getElementById('pub-precio').value);
    const pasajeros = parseInt(document.getElementById('pub-pasajeros').value, 10);
    const archivo = document.getElementById('pub-imagen').files[0];

    if (!marca || !modelo || !(precio > 0) || !(pasajeros > 0)) {
      Interfaz.aviso('Completa marca, modelo, precio y pasajeros.', 'error');
      return;
    }

    const boton = document.getElementById('btn-publicar');
    boton.disabled = true;
    try {
      let imagenUrl = null;
      if (archivo) imagenUrl = await this.autos.subirImagen(archivo, this.#usuario.id);

      await this.autos.crear({
        propietario_id: this.#usuario.id,
        marca,
        modelo,
        descripcion,
        precio_dia: precio,
        pasajeros,
        imagen_url: imagenUrl,
      });

      e.target.reset();
      Interfaz.aviso('Auto publicado.');
      this.mostrarSeccion('catalogo');
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    } finally {
      boton.disabled = false;
    }
  }

  abrirReserva(auto) {
    this.#autoElegido = auto;
    document.getElementById('res-titulo').textContent = auto.nombre;

    const hoy = Reserva.hoy();
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const inicio = document.getElementById('res-inicio');
    const fin = document.getElementById('res-fin');
    inicio.min = hoy;
    fin.min = hoy;
    inicio.value = hoy;
    fin.value = manana.toLocaleDateString('en-CA');

    this.actualizarResumen();
    document.getElementById('dialogo-reserva').showModal();
  }

  reservaDelFormulario() {
    const inicio = document.getElementById('res-inicio').value;
    const fin = document.getElementById('res-fin').value;
    return new Reserva(this.#autoElegido, inicio, fin);
  }

  actualizarResumen() {
    const reserva = this.reservaDelFormulario();
    const error = document.getElementById('res-error');
    const boton = document.getElementById('res-confirmar');

    if (!reserva.esValida()) {
      error.textContent = 'Elige fechas válidas: desde hoy, y el regreso no puede ser antes de la salida.';
      error.classList.remove('oculto');
      boton.disabled = true;
      return;
    }

    error.classList.add('oculto');
    boton.disabled = false;
    document.getElementById('res-dias').textContent = reserva.dias;
    document.getElementById('res-renta').textContent = Interfaz.dinero(reserva.renta);
    document.getElementById('res-seguro').textContent = Interfaz.dinero(reserva.seguro);
    document.getElementById('res-total').textContent = Interfaz.dinero(reserva.total);
    document.getElementById('res-pago-anticipo').textContent = Interfaz.dinero(reserva.anticipo);
    document.getElementById('res-pago-completo').textContent = Interfaz.dinero(reserva.total);
  }

  async confirmarReserva(e) {
    e.preventDefault();
    const reserva = this.reservaDelFormulario();
    if (!reserva.esValida()) return;

    const tipoPago = document.querySelector('input[name="tipo-pago"]:checked').value;
    const boton = document.getElementById('res-confirmar');
    boton.disabled = true;

    try {
      const ocupado = await this.reservas.hayTraslape(reserva.auto.id, reserva.inicio, reserva.fin);
      if (ocupado) {
        Interfaz.aviso('Ese auto ya está reservado en esas fechas.', 'error');
        return;
      }

      await this.reservas.crear(reserva.aFila(this.#usuario.id, tipoPago));
      document.getElementById('dialogo-reserva').close();
      Interfaz.aviso('¡Reserva confirmada!');
      this.mostrarSeccion('reservas');
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    } finally {
      boton.disabled = false;
    }
  }

  async cargarReservas() {
    const lista = document.getElementById('lista-reservas');
    document.getElementById('titulo-reservas').textContent = this.#usuario.tituloReservas();
    lista.innerHTML = '<p class="vacio">Cargando reservas...</p>';

    try {
      // Cada usuario tiene sus propias reservas 
      const filas = await this.#usuario.obtenerReservas(this.reservas);
      if (filas.length === 0) {
        lista.innerHTML = '<p class="vacio">Todavía no hay reservas.</p>';
        return;
      }
      lista.innerHTML = filas.map(fila => this.tarjetaReserva(fila)).join('');
    } catch (err) {
      lista.innerHTML = '';
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  tarjetaReserva(r) {
    const auto = r.autos ? `${r.autos.marca} ${r.autos.modelo}` : 'Auto';
    const pendiente = r.total - r.monto_pagado;
    const cliente = this.#usuario.rol !== 'cliente' && r.perfiles
      ? `<p>Cliente: <strong>${Interfaz.escapar(r.perfiles.usuario)}</strong></p>`
      : '';
    const estado = pendiente > 0
      ? `Anticipo pagado · falta ${Interfaz.dinero(pendiente)}`
      : 'Pagada completa';

    return `
      <article class="reserva">
        <h3>${Interfaz.escapar(auto)}</h3>
        ${cliente}
        <p>${Interfaz.fecha(r.fecha_inicio)} al ${Interfaz.fecha(r.fecha_fin)} (${r.dias} ${r.dias === 1 ? 'día' : 'días'})</p>
        <p>Renta ${Interfaz.dinero(r.renta)} + seguro ${Interfaz.dinero(r.seguro)} = <strong>${Interfaz.dinero(r.total)}</strong></p>
        <p class="estado">${estado}</p>
      </article>`;
  }

  // ---------- Panel (administrador y desarrollador) ----------

  async cargarPanel() {
    const cuerpo = document.getElementById('tabla-usuarios');
    cuerpo.innerHTML = '<tr><td colspan="2">Cargando...</td></tr>';

    try {
      const perfiles = await this.perfiles.todos();
      const puedeCambiar = this.#usuario.puedeCambiarRoles();

      cuerpo.innerHTML = perfiles.map(p => {
        let celdaRol = Interfaz.escapar(p.rol);
        if (puedeCambiar && p.id !== this.#usuario.id) {
          const opciones = ROLES.map(r => `<option value="${r}" ${r === p.rol ? 'selected' : ''}>${r}</option>`).join('');
          celdaRol = `<select data-id="${p.id}">${opciones}</select>`;
        }
        return `<tr><td>${Interfaz.escapar(p.usuario)}</td><td>${celdaRol}</td></tr>`;
      }).join('');
    } catch (err) {
      cuerpo.innerHTML = '';
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  async cambiarRol(e) {
    const select = e.target;
    if (!select.dataset.id) return;

    try {
      const cambiados = await this.perfiles.cambiarRol(select.dataset.id, select.value);
      if (cambiados.length === 0) throw new Error('No tienes permiso para cambiar roles.');
      Interfaz.aviso('Rol actualizado.');
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
      this.cargarPanel();
    }
  }
}
