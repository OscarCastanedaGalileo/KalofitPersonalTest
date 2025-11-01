export class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  // Permite suscribirse a un evento (ej: 'tokenRefreshed')
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Retornar una función para desuscribirse
    return () => this.off(event, callback);
  }

  // Permite desuscribirse de un evento
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback
      );
    }
  }

  // Permite disparar un evento
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => {
        listener(...args);
      });
    }
  }
}
