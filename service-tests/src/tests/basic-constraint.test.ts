import test, { describe } from "node:test";
import { Client } from "../client/client";
import assert from "assert";
import Salt from "../utils/salt";
import { tokenForLoggedInUser } from "../utils/token";

describe("Basic constraint operations", () => {
    test("Creating a constraint puts it in the all constraints collection", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const description = Salt.uniqued("bar")

        const constraint = {
            description,
            key: "userId",
            commaSeparatedValues: "John001, Steve002"
        }

        const response = await client.post("/api/constraints", constraint, token)

        assert(response?.status === 201)

        const allResponse = await client.get("/api/constraints", token)

        const constraints: { description: string }[] = allResponse.data
        const myConstraint = constraints.find(f => f.description === description)

        assert(myConstraint)
    })

    test("A constraint can be linked to a flag", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const description = Salt.uniqued("bar")

        const constraint = {
            description,
            key: "userId",
            commaSeparatedValues: "John001, Steve002"
        }

        const constraintCreationResponse: any = await client.post("/api/constraints", constraint, token)

        const flagName = Salt.uniqued("foo")

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
        assert(myConstraint.flags[0] === flagId)

        const allFlagsResponse = await client.get("/api/flags", token)

        const flags: any[] = allFlagsResponse.data
        const myFlag = flags.find(f => f.id === flagId)

        assert(myFlag)
        assert(myFlag.constraints[0] === constraintId)
    })
})
