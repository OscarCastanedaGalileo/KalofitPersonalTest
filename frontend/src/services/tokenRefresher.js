// src/api/TokenRefresher.js

import { EventEmitter } from './eventEmitterBase';

const REFRESH_STATUS = Object.freeze({
  REFRESH_SUCCESS: 'refreshSuccess',
  REFRESH_FAILURE: 'refreshFailure',
});
export class TokenRefresher extends EventEmitter {
  #isRefreshing = false;
  static quantityTryRefresh = 0;

  #refreshTokenFn = null;
  #clearTokenFn = null;

  constructor(refreshTokenFn, clearTokenFn) {
    super();
    this.#refreshTokenFn = refreshTokenFn;
    this.#clearTokenFn = clearTokenFn;
  }

  get isRefreshing() {
    return this.#isRefreshing;
  }

  isRefreshingPath(path) {
    return path.includes('auth/refresh');
  }

  /**
   * 1. Crea y devuelve la Promesa que el ApiClient esperará.
   * 2. Suscribe la función de reintento (requestCallback) a los eventos de éxito y fallo.
   * @param {Function} requestCallback - Función que re-ejecuta la solicitud del ApiClient.
   * @returns {Promise} Promesa que resuelve con el resultado del reintento de la petición original.
   */
  queueRequestPendingRefresh(requestCallback) {
    return new Promise((resolve, reject) => {
        // El payload contiene la función de reintento y los controladores de la Promesa de espera
        const payload = { requestCallback, resolve, reject };

        // Se suscribe al evento de ÉXITO
        this.on(REFRESH_STATUS.REFRESH_SUCCESS, payload);

        // Se suscribe al evento de FALLO
        this.on(REFRESH_STATUS.REFRESH_FAILURE, payload);
    });
  }

  // -----------------------------------------------------------------
  // Métodos de Resolución (Llamados SOLO por refreshToken())
  // -----------------------------------------------------------------

  /**
   * 🟢 Resuelve todas las Promesas pendientes, ejecutando los reintentos.
   * Limpia ambas colas.
   */
  async resolvePendingRequests() {
    const pendingRequests = this.listeners[REFRESH_STATUS.REFRESH_SUCCESS] || [];
    this.listeners[REFRESH_STATUS.REFRESH_SUCCESS] = [];
    this.listeners[REFRESH_STATUS.REFRESH_FAILURE] = [];

    if (pendingRequests.length === 0) return;

    for (const { requestCallback, resolve, reject } of pendingRequests) {
        try {
            // 1. Ejecuta la petición reintentada (retorna una Promesa)
            const result = await requestCallback();
            // 2. Resuelve la Promesa del ApiClient
            resolve(result);
        } catch (retryError) {
            // Si el reintento falla por otra razón (ej: 404), rechaza la Promesa
            reject(retryError);
        }
    }
  }

  /**
   * 🔴 Rechaza todas las Promesas pendientes sin reintentar (Error Crítico).
   * Limpia ambas colas.
   * @param {Error} error - El error de fallo del refreshToken.
   */
  async rejectPendingRequests(error) {
    const pendingRequests = this.listeners[REFRESH_STATUS.REFRESH_FAILURE] || [];
    this.listeners[REFRESH_STATUS.REFRESH_SUCCESS] = [];
    this.listeners[REFRESH_STATUS.REFRESH_FAILURE] = [];

    if (pendingRequests.length === 0) return;

    // Rechaza la Promesa del ApiClient de forma inmediata con el error
    for (const { reject } of pendingRequests) {
        reject(error);
    }
  }

  // -----------------------------------------------------------------
  // Lógica principal de ejecución
  // -----------------------------------------------------------------

  async refreshToken() {
    if (this.#isRefreshing || TokenRefresher.quantityTryRefresh > 1) {
      return;
    }

    this.#isRefreshing = true;

    try {
      TokenRefresher.quantityTryRefresh++;
      const newToken = await this.#refreshTokenFn();
      await this.resolvePendingRequests();
      return newToken;

    } catch (err) {
      this.#clearTokenFn();
      await this.rejectPendingRequests(err);
      throw err;
    } finally{
      this.#isRefreshing = false;
    }
  }
}
