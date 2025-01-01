import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";
import { tokenForLoggedInUser } from "../utils/token";

describe("Flag state", () => {
    test("A newly created flag can be turned on", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-s-on")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const allResponse = await client.get("/api/flags", token)

        const flags: any[] = allResponse.data

        const myFlag = flags.find(f => f.id === id)

        assert(myFlag.isOn)
    })

    test("A flag that is on can be turned off", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-s-of")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const allResponse = await client.get("/api/flags", token)

        const flags: any[] = allResponse.data

        const myFlag = flags.find(f => f.id === id)

        assert(myFlag.isOn)

        const turnOffResponse: any = await client.post("/api/flags/turnoff", { id }, token)

        assert(turnOffResponse?.status === 200)

        const allResponse2 = await client.get("/api/flags", token)

        const flags2: any[] = allResponse2.data

        const myFlag2 = flags2.find(f => f.id === id)

        assert(!myFlag2.isOn)
    })

    test("A flag that is on cannot be archived", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-ar-o")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        let err
        try {
            await client.post("/api/flags/archive", { id: response?.data?.id }, token)
        }
        catch (error: any) {
            err = error
        }

        assert(err?.status === 500)
    })
})
