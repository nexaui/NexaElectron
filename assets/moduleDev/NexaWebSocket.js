// This module uses the global NEXA_CONFIG object from assets/config.js
// Make sure to include config.js before loading this module

export class NexaClient {
  constructor() {
    this.ws = null;
    this.messageCallbacks = new Map();
    this.pendingRequests = [];
    this.subscribers = new Map();
    this.connectWebSocket();
  }

  connectWebSocket() {
    // Try to get WebSocket URL from environment variables, NEXA_CONFIG, or fallback to default
    let wsUrl;

    // First check if window.ENV is available (from preload.js)
    if (typeof window !== "undefined" && window.ENV && window.ENV.WS_HOST) {
      wsUrl = window.ENV.WS_HOST;
    }
    this.ws = new WebSocket(wsUrl||"ws://192.168.1.23:8080");
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.ws.onopen = () => {
      console.log("WebSocket Connected");
      // Process any pending requests
      while (this.pendingRequests.length > 0) {
        const request = this.pendingRequests.shift();
        this.Buckets(request.data).then(request.resolve).catch(request.reject);
      }
      window.nxClient = {
        ws: this.ws,
        Buckets: (data) => this.Buckets(data),
      };
      window.dispatchEvent(new Event("wsready"));
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    this.ws.onclose = (event) => {
      //console.log("WebSocket Connection Closed:", event.code, event.reason);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        // Handle real-time updates
        if (response.type === "update") {
          this.handleRealtimeUpdate(response);
          return;
        }

        // Handle normal responses
        const key = this.getCallbackKey(response);
        if (this.messageCallbacks.has(key)) {
          const callback = this.messageCallbacks.get(key);
          callback(response);
          this.messageCallbacks.delete(key);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };
  }

  getCallbackKey(response) {
    if (response.type && response.action) {
      return `${response.type}_${response.action}`;
    }
    if (response.data?.type && response.data?.action) {
      return `${response.data.type}_${response.data.action}`;
    }
    // Fallback to first available callback
    return this.messageCallbacks.keys().next().value;
  }

  Buckets(data) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        // Queue the request instead of rejecting
        this.pendingRequests.push({ data, resolve, reject });
        return;
      }

      const key = `${data.type}_${data.action}`;
      this.messageCallbacks.set(key, resolve);
      try {
        //console.log("Sending data:", data); // Debug log
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error sending message:", error);
        this.messageCallbacks.delete(key);
        reject(error);
      }
    });
  }

  // Menambah method untuk subscribe
  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
      // Kirim permintaan subscribe ke server
      this.Buckets({
        type: "subscribe",
        action: "listen",
        channel: channel,
      });
    }
    this.subscribers.get(channel).add(callback);
  }

  // Menambah method untuk unsubscribe
  unsubscribe(channel, callback) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).delete(callback);
      if (this.subscribers.get(channel).size === 0) {
        this.subscribers.delete(channel);
        // Kirim permintaan unsubscribe ke server
        this.Buckets({
          type: "unsubscribe",
          action: "stop",
          channel: channel,
        });
      }
    }
  }

  // Method untuk handle update real-time
  handleRealtimeUpdate(response) {
    const { channel, data } = response;
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).forEach((callback) => {
        callback(data);
      });
    }
  }
}
