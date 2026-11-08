// Representa un auto del catálogo. Recibe la fila tal como viene de Supabase.
export class Auto {
  #precioDia = 0;

  constructor(fila) {
    this.id = fila.id;
    this.propietarioId = fila.propietario_id;
    this.marca = fila.marca;
    this.modelo = fila.modelo;
    this.descripcion = fila.descripcion || '';
    this.pasajeros = fila.pasajeros;
    this.imagenUrl = fila.imagen_url;
    this.precioDia = fila.precio_dia; // pasa por el setter para validar
  }

  get precioDia() { return this.#precioDia; }

  set precioDia(valor) {
    if (!(Number(valor) > 0)) {
      throw new Error('El precio por día debe ser mayor a 0');
    }
    this.#precioDia = Number(valor);
  }

  get nombre() {
    return `${this.marca} ${this.modelo}`;
  }

  // Seguro fijo por reserva: $700 hasta 5 pasajeros, $1,100 si son más
  get seguro() {
    return this.pasajeros > 5 ? 1100 : 700;
  }
}
