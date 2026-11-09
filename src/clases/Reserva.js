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

  get dias() {
    const inicio = new Date(this.#inicio + 'T00:00:00');
    const fin = new Date(this.#fin + 'T00:00:00');
    const dias = Math.round((fin - inicio) / (1000 * 60 * 60 * 24));
    return Math.max(1, dias);
  }

  get renta() { return this.#auto.precioDia * this.dias; }
  get seguro() { return this.#auto.seguro; }
  get total() { return this.renta + this.seguro; }

  get anticipo() {
    return Math.round(this.total * Reserva.PORCENTAJE_ANTICIPO * 100) / 100;
  }

  montoAPagar(tipoPago) {
    return tipoPago === 'completo' ? this.total : this.anticipo;
  }

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
