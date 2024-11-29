import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";
import { tokenForLoggedInUser } from "../utils/token";

describe("Flag history", () => {
    test("Flag creation is recorded", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client);

        const name = Salt.uniqued("foo")

        const response: any = await client.post("/api/flags", { name }, token);

        assert(response?.status === 201)

        const flagId = response?.data?.id

        assert(flagId)

        const historyResponse: any = await client.post("api/history/flagid", { flagId }, token)

        assert(historyResponse?.data[0].flagId === flagId)
        assert(historyResponse?.data[0].what === "create")
    })
})
