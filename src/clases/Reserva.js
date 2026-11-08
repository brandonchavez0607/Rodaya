// Calcula todo lo de una reserva: días, renta, seguro, total y anticipo.
// Las fechas son textos con formato AAAA-MM-DD (como las da un input date).
export class Reserva {
  static PORCENTAJE_ANTICIPO = 0.2;

  #auto;
  #inicio;
  #fin;

  constructor(auto, inicio, fin) {
    this.#auto = auto;
    this.#inicio = inicio;
    this.#fin = fin;
  }

  // Fecha de hoy como AAAA-MM-DD (en la hora local)
  static hoy() {
    return new Date().toLocaleDateString('en-CA');
  }

  get auto() { return this.#auto; }
  get inicio() { return this.#inicio; }
  get fin() { return this.#fin; }

  esValida() {
    if (!this.#inicio || !this.#fin) return false;
    return this.#fin >= this.#inicio && this.#inicio >= Reserva.hoy();
  }

  // Si recoge y devuelve el mismo día cuenta como 1 día
  get dias() {
    const inicio = new Date(this.#inicio + 'T00:00:00');
    const fin = new Date(this.#fin + 'T00:00:00');
    const dias = Math.round((fin - inicio) / (1000 * 60 * 60 * 24));
    return Math.max(1, dias);
  }

  get renta() { return this.#auto.precioDia * this.dias; }
  get seguro() { return this.#auto.seguro; }
  get total() { return this.renta + this.seguro; }

  // El anticipo es el 20% de (renta + seguro)
  get anticipo() {
    return Math.round(this.total * Reserva.PORCENTAJE_ANTICIPO * 100) / 100;
  }

  // tipoPago puede ser 'anticipo' o 'completo'
  montoAPagar(tipoPago) {
    return tipoPago === 'completo' ? this.total : this.anticipo;
  }

  // Objeto listo para guardar en la tabla reservas
  aFila(clienteId, tipoPago) {
    return {
      auto_id: this.#auto.id,
      cliente_id: clienteId,
      fecha_inicio: this.#inicio,
      fecha_fin: this.#fin,
      dias: this.dias,
      renta: this.renta,
      seguro: this.seguro,
      total: this.total,
      tipo_pago: tipoPago,
      monto_pagado: this.montoAPagar(tipoPago),
    };
  }
}
