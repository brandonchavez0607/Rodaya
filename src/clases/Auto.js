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
    this.precioDia = fila.precio_dia; 
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

  // Seguro fijo $700 5 pasajeros y $1,100 si son más
  get seguro() {
    return this.pasajeros > 5 ? 1100 : 700;
  }
}
// La clase Auto representa un auto publicado por un propietario, con información como marca, modelo, precio por día y seguro.