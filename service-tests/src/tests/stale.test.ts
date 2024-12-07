import test, { describe } from "node:test";
import { Client } from "../client/client";
import { tokenForLoggedInUser } from "../utils/token";
import Salt from "../utils/salt";
import assert from "node:assert";

describe("Stale detection", () => {
    test("A flag unused for days is stale", async () => {
        const client = new Client()

        await client.post("api/settings/daysOffset", { days: -3 })

        const token = await tokenForLoggedInUser(client);

        const name = Salt.uniqued("foo")

        const createResponse: any = await client.post("/api/flags", { name }, token)

        assert(createResponse?.status === 201)

        const allResponse = await client.get("/api/flags", token)

        const flags: { name: string }[] = allResponse.data
        const myFlag = flags.find(f => f.name === name)

        assert(myFlag)

        await client.post("api/settings/daysOffset", { days: -2 })

        const id = createResponse?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)
    })
})
