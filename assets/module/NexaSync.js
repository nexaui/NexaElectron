export class NexaSync {
  #config = {
    key: null,
    secret: null,
    url: null,
    contentType: "application/json", // Default content type
  };

  constructor(config) {
    this.setConfig(config);
  }

  setConfig(config) {
    if (typeof config !== "object") {
      throw new Error("Config harus berupa object");
    }

    // Check if URL contains v1 - secret is not required for v1
    const isV1 = config.url?.includes("/v1");

    const requiredFields = ["key", "url"];
    // Add secret as required field only for v2+
    if (!isV1) {
      requiredFields.push("secret");
    }

    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`${field} harus diisi dalam config`);
      }
    }

    this.#config = { ...this.#config, ...config };
  }

  getConfig() {
    return { ...this.#config }; // Return copy of config
  }

  // Method untuk mengubah content type
  setContentType(contentType) {
    const validTypes = [
      "application/json",
      "application/x-www-form-urlencoded",
      "multipart/form-data",
      "text/plain",
    ];

    if (!validTypes.includes(contentType)) {
      throw new Error("Content type tidak valid");
    }

    this.#config.contentType = contentType;
  }

  async get(endpoint) {
    return this.#request(endpoint, "GET");
  }

  async post(endpoint, data) {
    return this.#request(endpoint, "POST", data);
  }

  async put(endpoint, data) {
    return this.#request(endpoint, "PUT", data);
  }

  async delete(endpoint) {
    return this.#request(endpoint, "DELETE");
  }

  async #request(endpoint, method, data = null) {
    if (!this.#config.key || !this.#config.url) {
      throw new Error(
        "Konfigurasi API belum diatur. Gunakan NexaSync.setConfig()"
      );
    }

    try {
      const options = {
        method,
        headers: {
          API_KEY: this.#config.key,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "same-origin",
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      // Ensure clean URL construction tanpa menambahkan /v1
      const baseUrl = this.#config.url.endsWith("/")
        ? this.#config.url.slice(0, -1)
        : this.#config.url;
      const cleanEndpoint = endpoint.startsWith("/")
        ? endpoint.slice(1)
        : endpoint;

      const fullUrl = `${baseUrl}/${cleanEndpoint}`;

      console.log("Making request to:", fullUrl);
      console.log("With options:", {
        ...options,
        headers: { ...options.headers },
        body: data ? JSON.parse(options.body) : undefined,
      });

      const response = await fetch(fullUrl, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }

      const jsonResponse = await response.json();
      console.log("Success response:", jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error("Request failed:", {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// Factory function now returns a new instance
export const createNexaSync = (config) => {
  return new NexaSync(config);
};
