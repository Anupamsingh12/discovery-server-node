const axios = require("axios");

class ServiceRegistory {
  constructor(app, port, serviceRegistryUrl, serviceName) {
    this.app = app; // Accept the existing app here
    this.port = port;
    this.serviceRegistryUrl = serviceRegistryUrl;
    this.instanceId = `${this.port}-${Math.random().toString(36).substring(2)}`;
    this.serviceName = serviceName;

    if (!this.app) {
      throw new Error("An Express app must be provided.");
    }

    this.registerService();
    this.setupRoutes();
    this.startHeartbeat();
    this.setupShutdownHandler();
  }

  // Register the service with the service registry
  async registerService() {
    const serviceInfo = {
      host: "localhost",
      port: this.port,
      instanceId: this.instanceId,
    };
    if (!this.serviceName) {
      throw new Error("Service name not set");
    }
    try {
      const response = await axios.post(
        `${this.serviceRegistryUrl}/register/${this.serviceName}`,
        serviceInfo
      );
      console.log(response.data.message);
    } catch (error) {
      console.error(
        "Error registering service:",
        error.response?.data || error.message
      );
    }
  }

  // Send a heartbeat to the service registry
  async sendHeartbeat() {
    try {
      const response = await axios.post(
        `${this.serviceRegistryUrl}/heartbeat/${this.serviceName}/${this.instanceId}`
      );
      console.log(response.data.message);
    } catch (error) {
      console.error(
        "Error sending heartbeat:",
        error.response?.data || error.message
      );
    }
  }

  // Deregister the service on shutdown
  async deregisterService() {
    try {
      const response = await axios.post(
        `${this.serviceRegistryUrl}/deregister/${this.serviceName}/${this.instanceId}`
      );
      console.log(response.data.message);
    } catch (error) {
      console.error(
        "Error deregistering service:",
        error.response?.data || error.message
      );
    }
  }

  // Setup the /user endpoint
  setupRoutes() {
    this.app.get("/user", (req, res) => {
      res.json({
        id: 1,
        name: "John Doe",
      });
    });
  }

  // Start the heartbeat every 10 seconds
  startHeartbeat() {
    setInterval(() => this.sendHeartbeat(), 10000);
  }

  // Gracefully handle shutdown
  setupShutdownHandler() {
    process.on("SIGINT", async () => {
      await this.deregisterService();
      process.exit();
    });
  }

  // Start the Express server (only needed if you're creating a new app)
  start() {
    this.app.listen(this.port, () => {
      console.log(
        `User service instance ${this.instanceId} listening at http://localhost:${this.port}`
      );
    });
  }
}

module.exports = ServiceRegistory;
