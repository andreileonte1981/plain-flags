import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";
import { tokenForLoggedInUser } from "../utils/token";

describe("Basic flag operations", () => {
    test("Creating a flag puts it in the all flags collection", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("foo")

        const response = await client.post("/api/flags", { name }, token)

        assert(response?.status === 201)

        const allResponse = await client.get("/api/flags", token)

        const flags: { name: string }[] = allResponse.data
        const myFlag = flags.find(f => f.name === name)

        assert(myFlag)
    })

    test("Creating a flag with a duplicate name fails", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("foo")

        const response = await client.post("/api/flags", { name }, token)

        assert(response?.status === 201);

        const allResponse = await client.get("/api/flags", token)

        const flags: { name: string }[] = allResponse.data
        const myFlag = flags.find(f => f.name === name)

        assert(myFlag);

        let err;
        try {
            const createDuplicateResponse = await client.post("/api/flags", { name }, token)
        }
        catch(error: any) {
            err = error;
        }
        assert(err?.status === 304)
    })

    test("Creating a flag with an archived name fails", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("foo")

        const response: any = await client.post("/api/flags", { name }, token)

        assert(response?.status === 201);

        const archResponse = await client.post("/api/flags/archive", { id: response?.data?.id }, token)

        assert(archResponse?.status === 200)

        let err;
        try {
            const createDuplicateResponse = await client.post("/api/flags", { name }, token)
        }
        catch(error: any) {
            err = error;
        }
        assert(err?.status === 304)
    })

    test("Archiving a flag excludes it from list of flags", async () => {
        const client = new Client()
        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("arc")

        const response: any = await client.post("/api/flags", { name }, token)

        assert(response?.status === 201)

        const id = response?.data?.id

        assert(id)

        const allResponse = await client.get("/api/flags", token)

        const flags: { name: string }[] = allResponse.data
        const myFlag = flags.find(f => f.name === name)

        assert(myFlag)

        const archResponse = await client.post("/api/flags/archive", { id: response?.data?.id }, token)

        assert(archResponse?.status === 200)

        const allResponse2 = await client.get("/api/flags", token)

        const flags2: { name: string }[] = allResponse2.data
        const archivedFlag = flags2.find(f => f.name === name)

        assert(!archivedFlag)
    })
})
