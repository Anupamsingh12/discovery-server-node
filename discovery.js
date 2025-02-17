const express = require("express");
const config = require("./config/config");
const NodeCache = require("node-cache");

const { server, cache, routes } = config;
const path = require("path");

const app = express();
const port = server.port;

const serviceRegistry = new NodeCache({ stdTTL: cache.ttl });
serviceRegistry.flushAll();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());

// GET /services - returns a JSON list of all services
app.get(routes.services, (req, res) => {
  const allServices = serviceRegistry.keys().map((key) => {
    const serviceInstances = serviceRegistry.get(key);
    return {
      serviceName: key,
      instances: serviceInstances,
    };
  });
  return res.json(allServices);
});

// GET "" - renders the services page
app.get("", (req, res) => {
  const allServices = serviceRegistry.keys().map((key) => {
    const serviceInstances = serviceRegistry.get(key);
    return {
      serviceName: key,
      instances: serviceInstances,
    };
  });

  res.render("services", { allServices });
});

// POST /registerService - register a new service instance
app.post(routes.registerService, (req, res) => {
  const { serviceName } = req.params;
  const { host, port, instanceId } = req.body;

  const serviceKey = `${serviceName}-${instanceId}`;
  const serviceInfo = { host, port, instanceId, lastHeartbeat: Date.now() };
  console.log(serviceInfo);

  if (!serviceRegistry.has(serviceName)) {
    serviceRegistry.set(serviceName, []);
  }

  const serviceInstances = serviceRegistry.get(serviceName);

  const existingInstance = serviceInstances.find(
    (instance) => instance.instanceId === instanceId
  );

  if (!existingInstance) {
    serviceInstances.push(serviceInfo);
    serviceRegistry.set(serviceName, serviceInstances);
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
app.post(routes.deregisterService, (req, res) => {
  const { serviceName, instanceId } = req.params;
  let removed = false;

  if (serviceRegistry.has(serviceName)) {
    const serviceInstances = serviceRegistry.get(serviceName);

    serviceInstances.forEach((element) => {
      console.log(instanceId, element);
      if (element.instanceId === instanceId) {
        serviceInstances.splice(serviceInstances.indexOf(element), 1);
        removed = true;
        return;
      }
    });

    if (removed) {
      serviceRegistry.set(serviceName, serviceInstances);
      console.log(`Deregistered ${serviceName} instance ${instanceId}`);
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
app.post(routes.heartbeat, (req, res) => {
  const { serviceName, instanceId } = req.params;
  let heartBeat = new Date();
  let foundFlag = false;

  if (serviceRegistry.has(serviceName)) {
    const serviceInstances = serviceRegistry.get(serviceName);

    const instance = serviceInstances.map((instance) => {
      if (instance.instanceId === instanceId) {
        instance.lastHeartbeat = heartBeat;
        foundFlag = true;
      }
      return instance;
    });
    serviceRegistry.set(serviceName, serviceInstances);

    if (foundFlag) {
      instance.lastHeartbeat = heartBeat;
      console.log(
        `Heartbeat received for ${serviceName} instance ${instanceId}`
      );
      res.status(200).send({
        message: `${serviceName} instance ${instanceId} heartbeat updated`,
      });
    } else {
      console.log(
        `Instance with ID ${instanceId} not found for ${serviceName}`
      );
      res.status(404).send({
        message: `${serviceName} instance ${instanceId} not found`,
      });
    }
  } else {
    res.status(404).send({ message: `${serviceName} not found` });
  }
});

// GET /healthCheck - simple health check endpoint
app.get(routes.healthCheck, (req, res) => {
  res.status(200).send("Service Registry is up and running");
});

// GET /docs - renders the docs page
app.get(routes.docs, (req, res) => {
  res.render("docs", {});
});

// Start the express server
app.listen(port, () => {
  console.log(`Service Registry listening at http://localhost:${port}`);
});
