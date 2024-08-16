import express from "express";
import isEqual from 'lodash.isequal';
import { ParsedQs } from "qs";


export interface MockRequestOptions {
  path: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  query?: Record<string, any>;
}

export interface MockResponse {
  status: number;
  body?: any;
  headers?: Record<string, string> | null;
}

export class MockRequest {
  //@ts-ignore
  _response: MockResponse;

  constructor(readonly options: MockRequestOptions) {}

  setResponse(statusCode: number, body: any, headers?: Record<string, string>) {
    this._response = {
      status: statusCode,
      body,
      headers: this.buildHeaders(headers),
    };
  }

  buildHeaders(headers?: Record<string, string | string[]>) {
    if (!headers) {
      return null;
    }
    return Object.entries(headers).reduce((accumulator, [key, value]) => {
      return Object.assign(accumulator, { [key.toLowerCase()]: value });
    }, {});
  }

  get response() {
    return this._response;
  }

  isMatch(req: express.Request) {
    //@ts-ignore
    return (this.matchHeaders(req.headers) && this.matchBody(req.body) && this.matchQueries(req.query) )
  }

  matchBody(body: any) {
    if(!this.options.body) {return true ;}
    return isEqual(body, this.options.body);
  }

  matchHeaders(headers: Record<string, string | string[]>) {
     if(!this.options.headers) {return true ;}
     return Object.keys(this.options.headers).every((key) => {
       return headers[key.toLowerCase()] === this.options.headers?.[key];
     })
  }

  matchQueries(query: Record<string, any>) {
    if(!this.options.query) {return true ;}
    return isEqual(query, this.options.query);
  }

  sendResponse(res: express.Response) {
    const { status, body } = this._response;
    res.status(status);
    body ? res.send(body) : res.end();
  }
}
