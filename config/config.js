module.exports = {
  server: {
    port: 4439,
  },
  cache: {
    ttl: process.env.CACHE_TTL || 30 * 24 * 3600,
  },

  routes: {
    services: "/services",
    registerService: "/register/:serviceName",
    deregisterService: "/deregister/:serviceName/:instanceId",
    heartbeat: "/heartbeat/:serviceName/:instanceId",
    healthCheck: "/health",
    docs: "/docs",
  },
};
