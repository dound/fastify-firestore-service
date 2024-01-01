# Todea App Library <!-- omit in toc -->
Todea App library is a backend framework designed to streamline Node.js
development workflow for your side project, then seamlessly transition to
enterprise scale applications supporting millions of users.

## Topics <!-- omit in toc -->
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Creating An API](#creating-an-api)
  - [Creating An App](#creating-an-app)
  - [Starting Server](#starting-server)
- [Components](#components)
  - [Customizing Component Registration](#customizing-component-registration)
- [Unit testing](#unit-testing)
  - [Setup](#setup)
- [Generating SDKs](#generating-sdks)
  - [Swagger UI](#swagger-ui)
  - [OpenAPI SDKs](#openapi-sdks)

# Key Features
- High level [API library](docs/api.md)
  - Routing
  - Input, output schema
  - Exceptions
  - CORS
  - Authentication
  - Compression
  - Health check API
  - Advanced error handling
  - Works with the [FirestoreDB library](https://github.com/dound/firestoredb)
- SDK Generation
  - Swagger UI
  - OpenAPI SDK

# Getting Started
The Todea App library provides a way to define APIs, including managing data.

## Creating An API
You can create an API to look up order details like this:
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

You can read more about API interface [here](docs/api.md).

## Creating An App
To create a Todea app, you have to call `makeApp` like this:
```js
import { makeApp } from 'dound/fastify-app'

const components = {
  Order,
  GetOrderAPI
}
```
```javascript <!-- embed:src/app.js:section:example start:example end -->
export default async () => makeApp({
  service: 'unittest',
  components: {
    ...basicExamples,
    ...corsExamples,
    ...dbExamples,
    ...docsExamples,
    notAPI: {}
  },
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
    authHeaders: ['x-app', 'x-uid', 'x-admin', 'x-token'],
    servers: ['http://localhost:8080'],
    routePrefix: '/app/docs'
  }
})
```

## Starting Server
The `makeApp()` helper method creates a fastify instance with a few plugins
loaded already. You may customize the fastify instance further using fastify's
customization features. To start the app, you have to call `.listen()` according
to
[Fastify's documentation](https://www.fastify.io/docs/latest/Reference/Server/#listen).
For example, `makeApp()` is called in a `app.js` file, and the returned promise
is exported, then you write the following code to create a server:
```javascript <!-- embed:examples/server.js:section:example start:example end -->
const app = await makeApp()
app.listen({ port: 8090, host: '0.0.0.0' })
```

# Components
Todea app is composed of components. A Todea app component can be an API, DB
Collection, etc. These components are passed to `makeApp()` in an object as `components`.
For example, `components` may be initialized like this:

```js
const components = {
  Order,
  GetOrderAPI
}

makeApp({
  components,
  ...
})
```

Internally, each of these components get registered to a corresponding system.
For example, API is registered with fastify as a route. Other components may
use Terraform if Infrastructure-As-Code is required.

## Customizing Component Registration
The component system uses a visitor pattern to allow extending the registration
workflow with custom components. For example, to add a new type of component
`ExampleComponent`, you need to do the following:
1. Subclass `ComponentRegistrator`, and add a
   `registerExampleComponent (exampleComponent)` method
   ```js
   import { ComponentRegistrator } from 'dound/fastify-app'

   class CustomComponentRegistrator extends ComponentRegistrator {
       registerExampleComponent (exampleComponent) {
           // do what needs to be done
       }
   }
   ```
1. You can pass the new `CustomComponentRegistrator` class to
   [makeApp()](./make-app.md) like this
   ```js
   makeApp({
       RegistratorCls: CustomComponentRegistrator
   })
   ```
1. Implement `static register (registrator)` in the new `ExampleComponent` class
   ```js
   class ExampleComponent {
       static register (registrator) {
           registrator.registerExampleComponent(this)
       }
   }
   ```
1. Pass the new type of component as part of `components` like this
   `makeApp({ components: { ExampleComponent } })`

# Unit testing
## Setup
Apps store data in Firestore. You must setup the database before running tests.
You can run `yarn start-local-db` to start a local emulator. And use
`test/environment.js` to setup Jest environments.

# Generating SDKs
## Swagger UI
This library generates an interactive Swagger UI for all APIs at /[service]/docs.

## OpenAPI SDKs
You can export APIs in an OpenAPI schema from /[service]/docs/json, and use that
with OpenAPI / Swagger SDK to generate SDKs in any supported languages.

CAUTION: Swagger SDKs use positional arguments in all SDKs, maintaining backward
compatibility will be challenging with vanilla SDK generators. You may customize
the generators to pass keyword arguments instead for languages that support it.
