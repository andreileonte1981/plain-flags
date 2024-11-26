import test, { describe } from "node:test"
import { Client } from "../client/client"
import { tokenForLoggedInUser } from "../utils/token"
import Salt from "../utils/salt"
import assert from "node:assert"
import PlainFlags from "feature-flags-node-sdk"

describe("SDK operation", () => {
    test("Turning on a flag will show it as on in the SDK ", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("stateflag")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const sdk = new PlainFlags("http:/127.0.0.1:5000")  // TODO: configure this, use the same url as the client.
        await sdk.init();

        assert(sdk.isOn(name))
    })
})