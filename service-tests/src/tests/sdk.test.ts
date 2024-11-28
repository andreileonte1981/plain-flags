import test, { describe } from "node:test"
import { Client } from "../client/client"
import { tokenForLoggedInUser } from "../utils/token"
import Salt from "../utils/salt"
import assert from "node:assert"
import PlainFlags from "feature-flags-node-sdk"
import { sleep } from "../utils/sleep"
import * as upath from "upath"

const dotenv = require('dotenv');
dotenv.config({ path: upath.resolve(__dirname, '../../.env') });

describe("SDK operation", () => {
    test("Turning on a flag will show it as on in the SDK ", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("stateflag")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const sdk = new PlainFlags("http:/127.0.0.1:5000", null, null)  // TODO: configure this, use the same url as the client.

        await sdk.init(process.env.APIKEY || "");

        assert(sdk.isOn(name))

        sdk.stopUpdates();
    })

    test("The SDK polls for updates at the specified interval", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("stateflag")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const sdk = new PlainFlags("http:/127.0.0.1:5000", null, null)  // TODO: configure this, use the same url as the client.
        await sdk.init(process.env.APIKEY || "", 1000);

        assert(sdk.isOn(name))

        const turnOffResponse: any = await client.post("/api/flags/turnoff", { id }, token)

        await sleep(1500)

        assert(!sdk.isOn(name))

        sdk.stopUpdates();
    })
})