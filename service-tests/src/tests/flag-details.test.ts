import test, { describe } from "node:test"
import { Client } from "../client/client"
import { tokenForLoggedInUser } from "../utils/token"
import Salt from "../utils/salt"
import assert from "assert"

describe("Flag details", () => {
    test("A flag details contains its constraint data", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const description = Salt.uniqued("test-deta")

        const constraint = {
            description,
            key: "userId",
            commaSeparatedValues: "John001, Steve002"
        }

        const constraintResponse: any = await client.post("/api/constraints", constraint, token)

        const flagName = Salt.uniqued("test-deta")

        const flagCreationResponse: any = await client.post("/api/flags", { name: flagName }, token)

        const flagId = flagCreationResponse.data.id
        const constraintId = constraintResponse.data.id

        const linkResponse = await client.post(
            "/api/constraints/link",
            { flagId, constraintId },
            token
        )

        const detailsResponse = await client.get(`/api/flags/${flagId}`, token)

        assert(detailsResponse.data.constraints[0].values[0] === "John001")
    })
})
