import express, { query, request } from "express";
import { MockRequest } from "./mock-request";
import { Server } from "http";

export interface ServerConfig {
  port: number;
  baseURL: string;
}

export interface RequestConfig {
  headers?: Record<string, string>;
}

export class StubService {
  //@ts-ignore
  private app: express.Express;
  //@ts-ignore
  private server: Server;
  private requestsByMethod: Record<string, MockRequest[]> = {};
  private nextRequest: MockRequest | null = null;

  public start(port: number) {
    this.app = express();
    this.app.use(express.json());
    this.app.all(`*`, (req, res) => {
      this.handleRequest(req, res);
    });
    return new Promise((res) => {
      this.server = this.app.listen(port, () => {
        console.log(`Server started on port ${port}`);
        res(null);
      });
    });
  }

  reset() {
    this.requestsByMethod = {};
  }

  public stop() {
    this.server.close();
  }


  reply(statusCode: number, body?: any, { headers }: RequestConfig = {}) {
    if (!this.nextRequest) {
      throw new Error(
        "Must call StubServer.[METHOD] before calling StubServer.reply"
      );
    }
    const requestKey = this.getKey(
      this.nextRequest.options.method,
      this.nextRequest.options.path
    );
    this.requestsByMethod[requestKey] = this.requestsByMethod[requestKey] || [];
    this.nextRequest.setResponse(statusCode, body, headers);
    this.requestsByMethod[requestKey].push(this.nextRequest);
    this.nextRequest = null;
    return this;
  }

  handleRequest(req: express.Request, res: express.Response) {
    const requestKey = this.getKey(req.method, req.path);
    if (!this.requestsByMethod[requestKey]) {
      res.status(404).send("No match found for request");
      return;
    }
    const matchingRequest = this.requestsByMethod[requestKey].find((request) =>
      request.isMatch(req)
    );

    if (!matchingRequest) {
      res.status(404).send("No match found for request");
      return;
    }

    matchingRequest.sendResponse(res);
  }

  private getUrlConfig(path: string) {
    const url = new URL(`http://localhost${path}`);
    return {
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
    };
  }

  public get(path: string, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      method: "GET",
      headers,
      ...this.getUrlConfig(path),
    });
    return this;
  }

  public post(path: string, body: any, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "POST",
      headers,
      body,
    });
    return this;
  }

  public patch(path: string, body: any, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "PATCH",
      body,
      headers,
    });
    return this;
  }

  public put(path: string, body: any, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "PUT",
      body,
      headers,
    });
    return this;
  }

  public delete(path: string, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "DELETE",
      headers,
    });
    return this;
  }

  public options(path: string, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "OPTIONS",
      headers,
    });
    return this;
  }

  public head(path: string, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "HEAD",
      headers,
    });
    return this;
  }

  public connect(path: string, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "CONNECT",
      headers,
    });
    return this;
  }

  public trace(path: string, { headers }: RequestConfig = {}) {
    this.nextRequest = new MockRequest({
      ...this.getUrlConfig(path),
      method: "TRACE",
      headers,
    });
    return this;
  }

  private getKey(method: string, path: string) {
    return `${method.toUpperCase()}:${path}`;
  }
}
