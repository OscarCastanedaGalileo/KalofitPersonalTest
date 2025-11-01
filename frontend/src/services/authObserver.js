import {EventEmitter} from './eventEmitterBase'

export const AUTH_EVENTS = {
  TOKEN_REFRESHED: 'tokenRefreshed',
  SESSION_EXPIRED: 'sessionExpired',
};

class AuthObserver extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Agrega un listener para el evento de token refrescado.
   *
   * @param {function} listener
   * @returns
   */
  onTokenRefreshed(listener) {
    return this.on(AUTH_EVENTS.TOKEN_REFRESHED, listener);
  }

  notifyRefreshToken() {
    this.emit(AUTH_EVENTS.TOKEN_REFRESHED);
  }
  /**
   * Notifica a los listeners que el token ha expirado.
   */
  notifySessionExpired() {
    this.emit(AUTH_EVENTS.SESSION_EXPIRED);
  }
}

export default new AuthObserver();
