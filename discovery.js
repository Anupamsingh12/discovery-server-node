const express = require("express");
const config = require("./config/config");
const NodeCache = require("node-cache");
const path = require("path");
const ServiceRegistry = require("./registory");
class DiscoveryServer {
  constructor() {
    this.app = express();
    this.config = config;
    this.serviceRegistry = new NodeCache({ stdTTL: config.cache.ttl });
    this.serviceRegistry.flushAll();

    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "views"));
    this.app.use(express.json());

    this.routes = this.config.routes;
    this.port = this.config.server.port;

    this.setupRoutes();
  }

  setupRoutes() {
    // GET /services - returns a JSON list of all services
    this.app.get(this.routes.services, (req, res) => {
      const allServices = this.serviceRegistry.keys().map((key) => {
        const serviceInstances = this.serviceRegistry.get(key);
        return {
          serviceName: key,
          instances: serviceInstances,
        };
      });
      return res.json(allServices);
    });

    // GET "" - renders the services page
    this.app.get("", (req, res) => {
      const allServices = this.serviceRegistry.keys().map((key) => {
        const serviceInstances = this.serviceRegistry.get(key);
        return {
          serviceName: key,
          instances: serviceInstances,
        };
      });
      res.render("services", { allServices });
    });

    // POST /registerService - register a new service instance
    this.app.post(this.routes.registerService, (req, res) => {
      const { serviceName } = req.params;
      const { host, port, instanceId } = req.body;

      const serviceKey = `${serviceName}-${instanceId}`;
      const serviceInfo = { host, port, instanceId, lastHeartbeat: Date.now() };

      if (!this.serviceRegistry.has(serviceName)) {
        this.serviceRegistry.set(serviceName, []);
      }

      const serviceInstances = this.serviceRegistry.get(serviceName);
      const existingInstance = serviceInstances.find(
        (instance) => instance.instanceId === instanceId
      );

      if (!existingInstance) {
        serviceInstances.push(serviceInfo);
        this.serviceRegistry.set(serviceName, serviceInstances);
        console.log(`Registered ${serviceName} instance:`, serviceInfo);
      } else {
        console.log(
          `Instance with ID ${instanceId} already registered for ${serviceName}`
        );
      }

      res.status(200).send({
        message: `${serviceName} instance ${instanceId} registered successfully`,
      });
    });

    // POST /deregisterService - deregister a service instance
    this.app.post(this.routes.deregisterService, (req, res) => {
      const { serviceName, instanceId } = req.params;
      let removed = false;

      if (this.serviceRegistry.has(serviceName)) {
        const serviceInstances = this.serviceRegistry.get(serviceName);

        serviceInstances.forEach((element) => {
          if (element.instanceId === instanceId) {
            serviceInstances.splice(serviceInstances.indexOf(element), 1);
            removed = true;
            return;
          }
        });

        if (removed) {
          this.serviceRegistry.set(serviceName, serviceInstances);
          res.status(200).send({
            message: `${serviceName} instance ${instanceId} deregistered successfully`,
          });
        } else {
          res.status(404).send({
            message: `${serviceName} instance ${instanceId} not found`,
          });
        }
      } else {
        res.status(404).send({ message: `${serviceName} not found` });
      }
    });

    // POST /heartbeat - update heartbeat for a service instance
    this.app.post(this.routes.heartbeat, (req, res) => {
      const { serviceName, instanceId } = req.params;
      const heartBeat = new Date();
      let foundFlag = false;

      if (this.serviceRegistry.has(serviceName)) {
        const serviceInstances = this.serviceRegistry.get(serviceName);

        serviceInstances.forEach((instance) => {
          if (instance.instanceId === instanceId) {
            instance.lastHeartbeat = heartBeat;
            foundFlag = true;
          }
        });

        this.serviceRegistry.set(serviceName, serviceInstances);

        if (foundFlag) {
          console.log(
            `Heartbeat received for ${serviceName} instance ${instanceId}`
          );
          res.status(200).send({
            message: `${serviceName} instance ${instanceId} heartbeat updated`,
          });
        } else {
          res.status(404).send({
            message: `${serviceName} instance ${instanceId} not found`,
          });
        }
      } else {
        res.status(404).send({ message: `${serviceName} not found` });
      }
    });

    // GET /healthCheck - simple health check endpoint
    this.app.get(this.routes.healthCheck, (req, res) => {
      res.status(200).send("Service Registry is up and running");
    });

    // GET /docs - renders the docs page
    this.app.get(this.routes.docs, (req, res) => {
      res.render("docs", {});
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(
        `Service Registry listening at http://localhost:${this.port}`
      );
    });
  }
}

module.exports = { DiscoveryServer, ServiceRegistry };
