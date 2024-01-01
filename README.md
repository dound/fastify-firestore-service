# Fastify Firestore Service <!-- omit in toc -->
This is a backend web framework built on Fastify and our Firestore ORM. It
provides a way to define APIs, including managing data.

## Topics <!-- omit in toc -->
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Creating An API](#creating-an-api)
  - [Creating a Service](#creating-a-service)
  - [Running a Server](#running-a-server)
- [Components](#components)
  - [Customizing Component Registration](#customizing-component-registration)
- [Unit testing](#unit-testing)
  - [Setup](#setup)
- [Generating SDKs](#generating-sdks)
  - [Swagger UI](#swagger-ui)
  - [OpenAPI SDKs](#openapi-sdks)

# Key Features
- [API library](docs/api.md)
  - Routing
  - Schemas for API inputs and responses
  - CORS
  - Compression
  - Health check API
  - Advanced error handling
  - Works with the [Firestore ORM library](https://github.com/dound/firestore-orm)

# Getting Started

## Creating An API
You can create an API to fetch information from Firestore like this:
```js
import { DatabaseAPI, EXCEPTIONS } from 'dound/fastify-app'

class GetOrderAPI extends DatabaseAPI {
  static PATH = '/getOrder'
  static DESC = `Get an order by ID, if order doesn't exists a 404 Not found
    error is returned`

  static INPUT = Order.KEY
  static OUTPUT = {
    order: Order.Schema
  }
  static EXCEPTIONS = {
    EXCEPTIONS.NotFoundException
  }

  async computeResponse ({ tx, body }) {
    const order = await tx.get(Order, body.id)
    if (!order) {
      throw new NotFoundException()
    }
    return { order: order.toJSON() }
  }
}
```

You can read more about the API interface [here](docs/api.md).

## Creating a Service
A service is just a server which hosts some HTTP APIs. To create a service, you
call `makeService` like this:
```js
import { makeService } from 'dound/fastify-app'

const components = {
  Order,
  GetOrderAPI
}
```
```javascript <!-- embed:src/app.js:section:example start:example end -->
export default async () => makeService({
  service: 'unittest',
  components,
  cookie: {
    secret: 'unit-test'
  },
  logging: {
    reportErrorDetail: true, // process.env.NODE_ENV === 'localhost',
    unittesting: true, // process.env.NODE_ENV === 'localhost',
    reportAllErrors: true // process.env.NODE_ENV !== 'prod'
  },
  swagger: {
    disabled: false,
    authHeaders: ['x-app', 'x-uid'],
    servers: ['http://localhost:8080'],
    routePrefix: '/app/docs'
  }
})
```

## Running a Server
The `makeService()` helper method creates a fastify instance with a few plugins
loaded already. You may customize the fastify instance further using fastify's
customization features. To start the app, you have to call `.listen()` according
to
[Fastify's documentation](https://www.fastify.io/docs/latest/Reference/Server/#listen).
For example, `makeService()` is called in a `app.js` file, and the returned promise
is exported, then you write the following code to start a server:
```javascript <!-- embed:examples/server.js:section:example start:example end -->
const app = await makeService()
app.listen({ port: 8090, host: '0.0.0.0' })
```

# Components
A service is composed of components. A component can be an API, a DB Model,
etc. These components are passed to `makeService()` which calls the
`register()` method on each component so that it can do any setup it requires:

```js
const components = {
  Order,
  GetOrderAPI
}

makeService({
  components,
  ...
})
```

For example, API's register with fastify as a route.

## Customizing Component Registration
The component system uses a visitor pattern to allow extending the registration
workflow with custom components. For example, to add a new type of component
`ExampleComponent`, you need to do the following:
1. Subclass `ComponentRegistrar`, and add a
   `registerExampleComponent (exampleComponent)` method
   ```js
   import { ComponentRegistrar } from 'dound/fastify-app'

   class CustomComponentRegistrar extends ComponentRegistrar {
       registerExampleComponent (exampleComponent) {
           // do what needs to be done
       }
   }
   ```
1. You can pass the new `CustomComponentRegistrar` class to
   [makeService()](./make-app.md) like this
   ```js
   makeService({
       RegistrarCls: CustomComponentRegistrar
   })
   ```
1. Implement `static register (registrar)` in the new `ExampleComponent` class
   ```js
   class ExampleComponent {
       static register (registrar) {
           registrar.registerExampleComponent(this)
       }
   }
   ```
1. Pass the new type of component as part of `components` like this
   `makeService({ components: { ExampleComponent } })`

# Unit testing
## Setup
Apps store data in Firestore. You must start the Firestore emulator before
running tests. You can run `yarn start-local-db` to start the local emulator.

# Generating SDKs
## Swagger UI
This library generates an interactive Swagger UI for all APIs at /[service]/docs.

## OpenAPI SDKs
You can export APIs in an OpenAPI schema from /[service]/docs/json, and use that
with OpenAPI / Swagger SDK to generate SDKs in any supported languages.

CAUTION: Swagger SDKs use positional arguments in all SDKs, maintaining backward
compatibility will be challenging with vanilla SDK generators. You may customize
the generators to pass keyword arguments instead for languages that support it.
