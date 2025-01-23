import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";

describe("Basic user operations", () => {
    test("A user may register", async () => {
        const client = new Client()

        const email = `${Salt.uniqued("mruser")}@mail.com`

        const response = await client.post("/api/users", { email, password: "pass01" });

        assert(response?.status === 201);
    })

    test("A registered user who logs in receives a token", async () => {
        const client = new Client()

        const email = `${Salt.uniqued("mruser")}@mail.com"`
        const password = "pass01";

        const registerResponse = await client.post("/api/users", { email, password });

        assert(registerResponse?.status === 201);

        const loginResponse: any = await client.post("api/users/login", { email, password })

        const token = loginResponse?.data?.token;

        assert(token)
    })

    test("Empty user name or password on registration is invalid", async () => {
        const client = new Client()

        const email = ``

        let error: any

        try {
            const response = await client.post("/api/users", { email, password: "" })
        }
        catch (e) { error = e }

        assert(error)
        assert(error.response.data.message.includes("invalid username"))
    })
})
