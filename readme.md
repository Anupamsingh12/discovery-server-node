# API Gateway Service

This is an API Gateway service built using Express.js. It provides functionalities for service registration, deregistration, heartbeat updates, and service discovery.

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   ```
2. **Navigate to the project directory:**
   ```sh
   cd api-gateway
   ```
3. **Install the dependencies:**
   ```sh
   npm install
   ```

## Configuration

Ensure you have a `config/config.js` file with the necessary configuration settings for the server, cache, and routes. The configuration file should export an object with the following structure:

```js
module.exports = {
  server: {
    port: <port-number>
  },
  cache: {
    ttl: <time-to-live>
  },
  routes: {
    services: "/services",
    registerService: "/registerService",
    deregisterService: "/deregisterService",
    heartbeat: "/heartbeat",
    healthCheck: "/healthCheck",
    docs: "/docs"
  }
};
```

## Usage

Start the server:

```sh
node app.js
```

## API Endpoints

- **GET /services**: Returns a JSON list of all registered services.
- **GET /**: Renders the services page.
- **POST /registerService**: Registers a new service instance.
- **POST /deregisterService**: Deregisters a service instance.
- **POST /heartbeat**: Updates the heartbeat for a service instance.
- **GET /healthCheck**: Simple health check endpoint.
- **GET /docs**: Renders the documentation page.

### Detailed API Endpoints

#### GET /services

Returns a JSON list of all registered services.

```json
[
  {
    "serviceName": "exampleService",
    "instances": [
      {
        "host": "localhost",
        "port": 3000,
        "instanceId": "1",
        "lastHeartbeat": 1633024800000
      }
    ]
  }
]
```

#### GET /

Renders the services page displaying all registered services.

#### POST /registerService

Registers a new service instance.

- **Request Body:**
  ```json
  {
    "serviceName": "exampleService",
    "host": "localhost",
    "port": 3000,
    "instanceId": "1"
  }
  ```
- **Response:**
  ```json
  {
    "message": "exampleService instance 1 registered successfully"
  }
  ```

#### POST /deregisterService

Deregisters a service instance.

- **Request Body:**
  ```json
  {
    "serviceName": "exampleService",
    "instanceId": "1"
  }
  ```
- **Response:**
  ```json
  {
    "message": "exampleService instance 1 deregistered successfully"
  }
  ```

#### POST /heartbeat

Updates the heartbeat for a service instance.

- **Request Body:**
  ```json
  {
    "serviceName": "exampleService",
    "instanceId": "1"
  }
  ```
- **Response:**
  ```json
  {
    "message": "exampleService instance 1 heartbeat updated"
  }
  ```

#### GET /healthCheck

Simple health check endpoint to verify the service is running.

- **Response:**
  ```text
  Service Registry is up and running
  ```

#### GET /docs

Renders the documentation page.

## Example

To register a new service instance:

```sh
curl -X POST http://localhost:<port>/registerService -d '{"serviceName": "exampleService", "host": "localhost", "port": 3000, "instanceId": "1"}' -H "Content-Type: application/json"
```

To deregister a service instance:

```sh
curl -X POST http://localhost:<port>/deregisterService -d '{"serviceName": "exampleService", "instanceId": "1"}' -H "Content-Type: application/json"
```

To update the heartbeat for a service instance:

```sh
curl -X POST http://localhost:<port>/heartbeat -d '{"serviceName": "exampleService", "instanceId": "1"}' -H "Content-Type: application/json"
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## Contact

For any questions or support, please contact [your-email@example.com](mailto:your-email@example.com).

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [Node-Cache](https://www.npmjs.com/package/node-cache)
- [EJS](https://ejs.co/)

## Changelog

### v1.0.0

- Initial release with service registration, deregistration, heartbeat updates, and service discovery functionalities.

### v1.1.0

- Added health check and documentation endpoints.

### v1.2.0

- Improved error handling and logging.

## Future Work

- Add authentication and authorization for API endpoints.
- Implement rate limiting and request throttling.
- Enhance the UI for the services page.

## Support

If you encounter any issues, please open an issue on the [GitHub repository](repository-url).

## Author

Developed by [Your Name](https://github.com/your-github-profile).

## Disclaimer

This project is provided "as is" without any warranty. Use at your own risk.
