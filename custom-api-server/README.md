# Custom Quotes API Server

Example of an API server that provides custom quotes to the BOMIST app.

This server is implemented with NodeJS. To run it, make sure you have [NodeJS installed](https://nodejs.org/en) and then on this folder run:

```
npm run install
npm run start
```

### Endpoints

The app expects these endpoints to be implemented:

```
POST /test
POST /search_quotes
```

An example of implementation can be found on this file: [src/routes.ts](./src/routes.ts)

### Data formats

Data formats, including data to be sent to the API and retrieved by it, can be found in this file: [src/types.ts](./src/types.ts)

### Authentication

Authentication is based on an _API Key_ which should be set on the app under `Settings > Workspace > Quotes > Custom Quotes API`. The app will then send this API key on the `x-api-key` HTTP header. The server should then validate the value passed on this header.

An example of authentication can be found on this file: [src/auth.ts](./src/auth.ts)
