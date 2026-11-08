import { MensajeRepository } from './MensajeRepository.js';
import { Interfaz } from './Interfaz.js';

// Maneja la pantalla del chat. Cada conversación es entre un cliente y el
// propietario de un auto, y se identifica con "idAuto:idCliente".
export class ChatManager {
  #conversaciones = new Map();
  #actual = null;
  #canal = null;
  #reservaDe = null;

  constructor(supabase, app) {
    this.app = app;
    this.repo = new MensajeRepository(supabase);
  }

  conectarEventos() {
    document.getElementById('form-chat').addEventListener('submit', e => this.enviar(e));

    document.getElementById('lista-chats').addEventListener('click', e => {
      const elemento = e.target.closest('[data-clave]');
      if (!elemento) return;
      if (e.target.dataset.accion === 'borrar') {
        this.eliminar(elemento.dataset.clave);
      } else {
        this.#actual = elemento.dataset.clave;
        this.#reservaDe = null;
        this.dibujarLista();
        this.dibujarMensajes();
      }
    });

    document.getElementById('chat-reserva').addEventListener('click', e => {
      if (e.target.dataset.accion === 'ver-reservas') this.app.mostrarSeccion('reservas');
    });
  }

  // Se llama cada vez que se entra a la sección Chat
  async abrir() {
    if (!this.#canal) {
      this.#canal = this.repo.escuchar(() => {
        const visible = document.getElementById('seccion-chat').classList.contains('activa');
        if (visible) this.refrescar();
      });
    }
    await this.refrescar();
  }

  // Al darle "Preguntar" a un auto del catálogo
  abrirConAuto(auto) {
    const clave = `${auto.id}:${this.app.usuario.id}`;
    if (!this.#conversaciones.has(clave)) {
      this.#conversaciones.set(clave, {
        clave,
        autoId: auto.id,
        clienteId: this.app.usuario.id,
        autoNombre: auto.nombre,
        mensajes: [],
      });
    }
    this.#actual = clave;
    this.#reservaDe = null;
    this.app.mostrarSeccion('chat');
  }

  // Al cerrar sesión
  cerrar() {
    this.repo.dejarDeEscuchar(this.#canal);
    this.#canal = null;
    this.#conversaciones = new Map();
    this.#actual = null;
    this.#reservaDe = null;
  }

  async refrescar() {
    if (!this.app.usuario) return;
    try {
      const mensajes = await this.repo.delUsuario();
      const previa = this.#conversaciones.get(this.#actual);
      const nuevas = new Map();

      for (const m of mensajes) {
        const clave = `${m.auto_id}:${m.cliente_id}`;
        if (!nuevas.has(clave)) {
          nuevas.set(clave, {
            clave,
            autoId: m.auto_id,
            clienteId: m.cliente_id,
            autoNombre: m.autos ? `${m.autos.marca} ${m.autos.modelo}` : 'Auto',
            mensajes: [],
          });
        }
        nuevas.get(clave).mensajes.push(m);
      }

      // Si el chat abierto todavía no tiene mensajes, lo conservamos en la lista
      if (previa && !nuevas.has(previa.clave)) nuevas.set(previa.clave, previa);

      this.#conversaciones = nuevas;
      this.dibujarLista();
      this.dibujarMensajes();
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  // Nombre de la otra persona, si ya escribió algo
  otroNombre(conv) {
    const otro = conv.mensajes.find(m => m.autor_id !== this.app.usuario.id);
    return otro ? otro.autor_nombre : null;
  }

  subtitulo(conv) {
    const otro = this.otroNombre(conv);
    if (conv.clienteId === this.app.usuario.id) {
      return otro ? `Propietario: ${otro}` : 'Escríbele al propietario';
    }
    return `Cliente: ${otro || '—'}`;
  }

  dibujarLista() {
    const lista = document.getElementById('lista-chats');
    if (this.#conversaciones.size === 0) {
      lista.innerHTML = '<p class="vacio">No tienes chats todavía. Entra al catálogo y toca "Preguntar" en un auto.</p>';
      return;
    }

    lista.innerHTML = [...this.#conversaciones.values()].map(conv => `
      <div class="chat-item ${conv.clave === this.#actual ? 'actual' : ''}" data-clave="${Interfaz.escapar(conv.clave)}">
        <div class="chat-item-texto">
          <strong>${Interfaz.escapar(conv.autoNombre)}</strong>
          <span>${Interfaz.escapar(this.subtitulo(conv))}</span>
        </div>
        <button type="button" class="btn-link" data-accion="borrar" title="Eliminar chat">Eliminar</button>
      </div>
    `).join('');
  }

  dibujarMensajes() {
    const cabecera = document.getElementById('chat-cabecera');
    const caja = document.getElementById('chat-box');
    const formulario = document.getElementById('form-chat');
    const reserva = document.getElementById('chat-reserva');
    const conv = this.#conversaciones.get(this.#actual);

    if (!conv) {
      cabecera.textContent = 'Elige una conversación';
      caja.innerHTML = '';
      formulario.classList.add('oculto');
      reserva.classList.add('oculto');
      return;
    }

    formulario.classList.remove('oculto');
    cabecera.innerHTML = `<strong>${Interfaz.escapar(conv.autoNombre)}</strong>
      <span>${Interfaz.escapar(this.subtitulo(conv))}</span>`;

    if (conv.mensajes.length === 0) {
      caja.innerHTML = '<p class="vacio">Escribe el primer mensaje.</p>';
    } else {
      caja.innerHTML = conv.mensajes.map(m => {
        const propio = m.autor_id === this.app.usuario.id;
        const hora = new Date(m.creado).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        return `<div class="msg ${propio ? 'propio' : ''}">
          <span class="autor">${Interfaz.escapar(m.autor_nombre)} · ${hora}</span>
          ${Interfaz.escapar(m.texto)}
        </div>`;
      }).join('');
    }
    caja.scrollTop = caja.scrollHeight;

    if (this.#reservaDe !== conv.clave) {
      this.#reservaDe = conv.clave;
      this.mostrarReserva(conv);
    }
  }

  // Si el cliente ya reservó este auto, se muestran los datos arriba del chat
  async mostrarReserva(conv) {
    const caja = document.getElementById('chat-reserva');
    caja.classList.add('oculto');
    try {
      const r = await this.app.reservas.ultimaDe(conv.autoId, conv.clienteId);
      if (!r || this.#actual !== conv.clave) return;
      caja.innerHTML = `Reserva del ${Interfaz.fecha(r.fecha_inicio)} al ${Interfaz.fecha(r.fecha_fin)}
        · Total ${Interfaz.dinero(r.total)}
        <button type="button" class="btn-link" data-accion="ver-reservas">Ver en Reservas</button>`;
      caja.classList.remove('oculto');
    } catch (err) {
      // si no se puede leer la reserva, el chat sigue funcionando
    }
  }

  async enviar(e) {
    e.preventDefault();
    const conv = this.#conversaciones.get(this.#actual);
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    if (!conv || !texto) return;

    try {
      await this.repo.enviar({
        auto_id: conv.autoId,
        cliente_id: conv.clienteId,
        autor_id: this.app.usuario.id,
        autor_nombre: this.app.usuario.usuario,
        texto,
      });
      input.value = '';
      await this.refrescar();
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }

  async eliminar(clave) {
    const conv = this.#conversaciones.get(clave);
    if (!conv) return;
    if (!confirm('¿Eliminar este chat? Se borran los mensajes para las dos personas.')) return;

    try {
      await this.repo.eliminarConversacion(conv.autoId, conv.clienteId);
      this.#conversaciones.delete(clave);
      if (this.#actual === clave) this.#actual = null;
      await this.refrescar();
    } catch (err) {
      Interfaz.aviso(Interfaz.traducirError(err), 'error');
    }
  }
}
