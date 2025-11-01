// ApiClient.js

/** Si ya tienes estos tipos, elimina esto y usa tus importaciones */
// import { HttpMethod, ApiError } from '@/types';
export const HttpMethod = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
});

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? null;
    this.data = data ?? null;
  }
}
/** fin de sustitutos */

/**
 * Headers: Record<string, string>
 * Params:  Record<string, string|number|boolean>
 * data:    Object|FormData|null
 */
export class ApiClient {
  #baseUrl = "";
  #defaultHeaders = {};
  #tokenRefresher = null;

  constructor(baseUrl = "", globalHeaders = {}, tokenRefresher = null) {
    this.setBaseUrl(baseUrl);
    this.#defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...globalHeaders,
    };
    this.#tokenRefresher = tokenRefresher;
  }

  setBaseUrl(baseUrl) {
    if (typeof baseUrl !== "string") {
      throw new Error("baseUrl must be a string");
    }
    if (String(baseUrl).trim().length === 0) {
      throw new Error("baseUrl cannot be empty");
    }
    if (!String(baseUrl).endsWith("/")) {
      baseUrl += "/";
    }
    this.#baseUrl = baseUrl;
  }

  setGlobalHeader(key, value) {
    this.#defaultHeaders[key] = value;
  }

  removeGlobalHeader(key) {
    delete this.#defaultHeaders[key];
  }

  async #request(
    method,
    path,
    data = null,
    params = {},
    headers = {},
    customOptions = {}
  ) {
    // normaliza path como en tu versión original
    if (String(path ?? "").startsWith("/")) {
      path = path.replace("/", "");
    }

    // construir URL con query params
    const url = new URL(path, this.#baseUrl);
    Object.entries(params || {}).forEach(([k, v]) => {
      url.searchParams.append(k, String(v));
    });

    // merge de headers y limpieza de null/undefined
    const mergedHeaders = { ...this.#defaultHeaders, ...headers };
    Object.keys(mergedHeaders).forEach((k) => {
      if (mergedHeaders[k] == null) delete mergedHeaders[k];
    });

    // preparar opciones fetch
    const options = {
      method,
      credentials: 'include',
      headers: mergedHeaders,
      ...customOptions, // puedes pasar signal, mode, credentials, etc.
    };

    // cuerpo: FormData => sin Content-Type, JSON => stringify
    if (data != null) {
      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;
      if (isFormData) {
        options.body = data;
        delete options.headers["Content-Type"];
      } else {
        options.body = JSON.stringify(data);
        if (!options.headers["Content-Type"]) {
          options.headers["Content-Type"] = "application/json";
        }
      }
    }
    const originalRequestCallback = () => fetch(url.toString(), options);
    let response = await originalRequestCallback();
    console.log("Response status:", {status: response.status, url: url.toString(), path});
    if(response.status === 401 && this.#tokenRefresher
      && !this.#tokenRefresher.isRefreshingPath(path)) {
      const retryRequest = () => this.#request(
        method,
        path,
        data,
        params,
        headers,
        customOptions
      );
      if(!this.#tokenRefresher.isRefreshing) {
        return this.#tokenRefresher.queueRequestPendingRefresh(retryRequest);
      }
      try {
        // await this.#tokenRefresher.refreshToken();

        response = await originalRequestCallback();
      } catch {
        console.log("Redirigiendo a login por fallo en refresh token");
        throw new ApiError("Unauthorized", 401);
      }
    }

    // parseo de respuesta (JSON si aplica, sino texto)
    const contentType = response.headers.get("content-type") || "";
    let responseData;
    try {
      responseData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      responseData = null;
    }
    console.log({
      message: "ApiClient response data",
      response
    })
    // Solo respuestas exitosas (2xx)
    if (typeof response.status !== 'number' || response.status < 200 || response.status >= 300) {
      console.log("ApiClient detected error response:", {status: response.status, data: responseData});
      const statusText = response.statusText || "HTTP Error";
      throw new ApiError(
        `Request error: ${statusText}`,
        response.status,
        responseData
      );
    }

    return responseData;
  }

  get(path, params = {}, headers = {}, options = {}) {
    return this.#request(HttpMethod.GET, path, null, params, headers, options);
  }

  post(path, data, params = {}, headers = {}, options = {}) {
    return this.#request(
      HttpMethod.POST,
      path,
      data,
      params,
      headers,
      options
    );
  }

  put(path, data, params = {}, headers = {}, options = {}) {
    return this.#request(HttpMethod.PUT, path, data, params, headers, options);
  }

  patch(path, data, params = {}, headers = {}, options = {}) {
    return this.#request(
      HttpMethod.PATCH,
      path,
      data,
      params,
      headers,
      options
    );
  }

  delete(path, params = {}, headers = {}, options = {}) {
    return this.#request(
      HttpMethod.DELETE,
      path,
      null,
      params,
      headers,
      options
    );
  }
}
