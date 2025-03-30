import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";
import { tokenForLoggedInUser } from "../utils/token";

describe("Edit constraint", () => {
    test("Editing a constraint's details is recorded", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const description = Salt.uniqued("test-link")

        const constraint = {
            description,
            key: "userId",
            commaSeparatedValues: "John001, Steve002"
        }

        const constraintCreationResponse: any = await client.post("/api/constraints", constraint, token)

        const flagName = Salt.uniqued("test-link")

        const flagCreationResponse: any = await client.post("/api/flags", { name: flagName }, token)

        const flagId = flagCreationResponse.data.id
        const constraintId = constraintCreationResponse.data.id

        const linkResponse = await client.post(
            "/api/constraints/link",
            { flagId, constraintId },
            token
        )

        const allConstraintsResponse = await client.get("/api/constraints", token)

        const constraints: any[] = allConstraintsResponse.data

        const myConstraint = constraints.find(f => f.id === constraintId)

        assert(myConstraint)
        assert(myConstraint.flags[0].id === flagId)

        const allFlagsResponse = await client.get("/api/flags", token)

        const flags: any[] = allFlagsResponse.data
        const myFlag = flags.find(f => f.id === flagId)

        assert(myFlag)
        assert(myFlag.constraints[0].description === description)

        const editConstraintResponse = await client.post(
            "/api/constraints/values",
            { id: constraintId, values: "John001, Bob003" },
            token
        )

        const historyResponse: any = await client.post("api/history", { flagId }, token)
        assert(historyResponse?.data[0].what === "create")
        assert(historyResponse?.data[1].what === "link")
        assert(historyResponse?.data[2].what === "cvedit")
        assert((historyResponse?.data[2].constraintInfo as string).includes("Steve002"))
        assert((historyResponse?.data[2].constraintInfo as string).includes("Bob003"))
    })
})
