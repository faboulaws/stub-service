import { StubService } from "../src/stub-service";
import axios from "axios";

describe("StubService", () => {
  let stubService: StubService;
  const baseURL = "http://localhost:3000";
  beforeAll(async () => {
    stubService = new StubService();
    await stubService.start(3000);
  });

  afterEach(() => {
    stubService.reset();
  });

  afterAll(() => {
    stubService.stop();
  });

  it('should throw error if no request is matched', async () => {
    stubService.get("/api/users/1").reply(200, { id: 1, name: "John" });
    const error = await axios.get(`${baseURL}/api/users/2`).catch(err => err);
    expect(error.response.status).toEqual(404);
  });
  describe("GET", () => {
    it("should match the path and method", async () => {
      stubService.get("/api/users/1").reply(200, { id: 1, name: "John" });
      stubService.get("/api/users/2").reply(200, { id: 2, name: "Jane" });
      const { data: res1 } = await axios.get(
        `${baseURL}/api/users/1`
      );
      expect(res1).toEqual({ id: 1, name: "John" });
    });

    it("should match the path and method and headers", async () => {
      stubService
        .get("/api/users/1", { headers: { authorization: `Bearer abc` } })
        .reply(200, { id: 1, name: "John" });
      stubService
        .get("/api/users/1", { headers: { authorization: `Bearer xyz` } })
        .reply(401, { error: "Access denied" });
      const { data: res1 } = await axios.get(
        `${baseURL}/api/users/1`,
        { headers: { authorization: `Bearer abc` } }
      );
      expect(res1).toEqual({ id: 1, name: "John" });

      const error = await axios
        .get(`${baseURL}/api/users/1`, {
          headers: { authorization: "Bearer xyz" },
        })
        .catch((err) => err);

      expect(error.response.status).toEqual(401);
    });

    it("should match query string", async () => {
      stubService.get("/api/users?name=john").reply(200, [{ id: 1, name: "John" }]);
      
      const { data: res1 } = await axios.get(
        `${baseURL}/api/users?name=john`
      );
      expect(res1).toEqual([{ id: 1, name: "John" }]);
    });
  });

  describe("POST", () => {
    it("should match path and method and body(json)", async () => {
      stubService
        .post("/api/users", { name: "John" })
        .reply(200, { id: 1, name: "John" });

      const { data: res1 } = await axios.post(
        `${baseURL}/api/users`,
        { name: "John" }
      );
      expect(res1).toEqual({ id: 1, name: "John" });
    });

    it("should match path and method and body(json nested)", async () => {
      stubService
        .post("/api/users", { name: "John", contact: { email: "tt@tt.com" } })
        .reply(200, { id: 1 });

      const { data: res1 } = await axios.post(
        `${baseURL}/api/users`,
        { name: "John", contact: { email: "tt@tt.com" } }
      );
      expect(res1).toEqual({ id: 1 });
    });

    it.skip("should match path and method and body(text)", async () => {
      stubService
        .post("/api/msg", "hello", {
          headers: {
            "Content-Type": "text/plain",
          },
        })
        .reply(200, "Ok");

      const { data: res1 } = await axios.post(
        `${baseURL}/api/msg`,
        "hello",
        {
          headers: {
            "Content-Type": "text/plain",
          },
          responseType: 'text'
        }
      );
      expect(res1).toEqual('Ok');
    });
  });

  describe("PATCH", () => {
    it("should match path and method and body(json)", async () => {
      stubService
        .patch("/api/users/1", { status: "single" })
        .reply(204);

      const { data: res1 } = await axios.patch(
        `${baseURL}/api/users/1`,
        { status: "single" }
      );
      expect(res1).toEqual("");
    });

    it("should match path and method and body(json nested)", async () => {
      stubService
        .patch("/api/users/1", { name: "John", contact: { email: "tt@tt.com" } })
        .reply(200, { id: 1 });

      const { data: res1 } = await axios.patch(
        `${baseURL}/api/users/1`,
        { name: "John", contact: { email: "tt@tt.com" } }
      );
      expect(res1).toEqual({ id: 1 });
    });
  });
});
