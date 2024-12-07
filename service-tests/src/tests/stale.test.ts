import test, { describe } from "node:test";
import { Client } from "../client/client";

describe("Stale detection", () => {
    test("A flag unused for days is stale", async () => {
        const client = new Client()

        const settingsResponse = await client.post("api/settings/daysOffset", { days: -3 })

        console.log(settingsResponse)
    })
})
