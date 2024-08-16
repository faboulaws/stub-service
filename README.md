# Stub Service
A simple and flexible npm package for creating stub servers to mock HTTP endpoints. This package allows you to define custom routes, methods, headers, and responses for testing your applications.


# Usage

To start the stub server, create an instance of StubService and call the start method with the desired port number. Call `StubService.[HTTP Method]` to mock requests.
```typescript
//import package
import { StubService } from "stub-service";
// create server instance
const stubService = new StubService();
// start server
await stubService.start(3000);
// configure 
stubService.get("/api/users/1").reply(200, { id: 1, name: "John" });
stubService.get("/api/users/2").reply(200, { id: 2, name: "Jane" });
// sample tests
const { data } = await axios.get("http://localhost:3000/api/users/1");
expect(data).toEqual({ id: 1, name: "John" });
```

##  Stub service host
Host is localhost. The stub service will run on port provided to the `.start()` method.

## Headers
```typescript
stubService
  .get("/api/users/1", { headers: { authorization: `Bearer abc` } })
  .reply(200, { id: 1, name: "John" });
stubService
  .get("/api/users/1", { headers: { authorization: `Bearer xyz` } })
  .reply(401, { error: "Access denied" });
```

## Request payload
```typescript
stubService
  .post("/api/users", { name: "John" })
  .reply(200, { id: 1, name: "John" });
```

## Stopping the Server
To stop the stub server, call the stop method.
```typescript
stubService.stop();
```

# Resetting the Server
To reset the stub server between tests, use the reset method. This clears all the defined routes and responses.
```typescript
stubService.reset();
```

# License
This project is licensed under the MIT License.
