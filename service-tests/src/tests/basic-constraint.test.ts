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
})
