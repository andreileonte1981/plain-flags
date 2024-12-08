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

    test("A constraint can be unlinked from a flag", async () => {
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

        const unlinkResponse = await client.post(
            "/api/constraints/unlink",
            { flagId, constraintId },
            token
        )

        const allConstraintsResponse2 = await client.get("/api/constraints", token)

        const constraintsAfterUnlink: any[] = allConstraintsResponse2.data

        const myConstraint2 = constraintsAfterUnlink.find(f => f.id === constraintId)

        assert(myConstraint2)
        assert(!myConstraint2.flags[0])

        const allFlagsResponse2 = await client.get("/api/flags", token)

        const flagsAfterUnlink: any[] = allFlagsResponse2.data
        const myFlag2 = flagsAfterUnlink.find(f => f.id === flagId)

        assert(myFlag2)
        assert(!myFlag2.constraints[0])
    })

    test("A constraint with no flags linked can be removed", async () => {
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

        const constraints: any[] = allResponse.data
        const myConstraint = constraints.find(f => f.description === description)

        assert(myConstraint)

        const deleteResponse = await client.post("/api/constraints/delete", { id: myConstraint.id }, token)

        assert(deleteResponse?.status === 200)

        const allResponseAfterDelete = await client.get("/api/constraints", token)

        const constraintsAfterDelete: any[] = allResponseAfterDelete.data
        const deletedConstraint = constraintsAfterDelete.find(f => f.description === description)

        assert(!deletedConstraint)
    })

    test("Deleting a linked constraint unlinks it from the linked flag", async () => {
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

        const deleteResponse = await client.post("/api/constraints/delete", { id: constraintId }, token)

        assert(deleteResponse?.status === 200)

        const allFlagsResponse = await client.get("/api/flags", token)

        const flags: any[] = allFlagsResponse.data
        const myFlag = flags.find(f => f.id === flagId)

        assert(myFlag)
        assert(!myFlag.constraints[0])
    })

    test("Deleting a constraint linked to an activated flag fails", async () => {
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

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id: flagId }, token)

        assert(turnOnResponse?.status === 200)

        let err;
        try {
            const deleteResponse = await client.post("/api/constraints/delete", { id: constraintId }, token)
        }
        catch (error) {
            err = error
        }

        assert(err)
    })

    test("Archiving a flag unlinks all its constraints", async () => {
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

        const archResponse = await client.post("/api/flags/archive", { id: flagId }, token)

        assert(archResponse?.status === 200)

        const allConstraintsResponse = await client.get("/api/constraints", token)

        const constraints: any[] = allConstraintsResponse.data

        const myConstraint = constraints.find(c => c.id === constraintId)

        assert(myConstraint)
        assert(!myConstraint.flags[0])
    })
})
