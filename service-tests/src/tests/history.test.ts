import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";
import { tokenForLoggedInUser } from "../utils/token";

describe("Flag history", () => {
    test("Flag creation, activation, deactivation and archiving are recorded", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client);

        const name = Salt.uniqued("test-h-ba")

        const creationResponse: any = await client.post("/api/flags", { name }, token);

        assert(creationResponse?.status === 201)

        const id = creationResponse?.data?.id

        assert(id)

        await client.post("/api/flags/turnon", { id }, token)
        await client.post("/api/flags/turnoff", { id }, token)
        await client.post("/api/flags/archive", { id }, token)

        const historyResponse: any = await client.post("api/history/flagid", { flagId: id }, token)

        assert(historyResponse?.data.length === 4)
        assert(historyResponse?.data[0].flagId === id)
        assert(historyResponse?.data[0].what === "create")
        assert(historyResponse?.data[1].what === "turnon")
        assert(historyResponse?.data[2].what === "turnoff")
        assert(historyResponse?.data[3].what === "archive")
    })

    test("Flag constraining, unconstraining are recorded", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client);

        const name = Salt.uniqued("test-h-co")

        const flagCreationResponse: any = await client.post("/api/flags", { name }, token);

        const flagId = flagCreationResponse?.data?.id

        const description = Salt.uniqued("test-h-co")

        const constraint = {
            description,
            key: "userId",
            commaSeparatedValues: "John001, Steve002"
        }

        const constraintCreationResponse: any = await client.post("/api/constraints", constraint, token)
        const constraintId = constraintCreationResponse.data.id

        await client.post(
            "/api/constraints/link",
            { flagId, constraintId },
            token
        )
        await client.post(
            "/api/constraints/unlink",
            { flagId, constraintId },
            token
        )

        const historyResponse: any = await client.post("api/history/flagid", { flagId: flagId }, token)

        assert(historyResponse?.data.length === 3)
        assert(historyResponse?.data[0].flagId === flagId)
        assert(historyResponse?.data[0].what === "create")
        assert(historyResponse?.data[1].what === "link")
        assert(historyResponse?.data[1].constraintId === constraintId)
        assert(historyResponse?.data[1].constraintInfo)
        assert(historyResponse?.data[2].what === "unlink")
        assert(historyResponse?.data[2].constraintId === constraintId)
        assert(!historyResponse?.data[2].constraintInfo)
    })
})
