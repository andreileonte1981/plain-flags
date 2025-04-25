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
        const constraintId = constraintCreationResponse.data.id

        const flagIds: string[] = []
        for (let i = 0; i < 5; i++) {
            const flagName = Salt.uniqued("test-edt1")

            const flagCreationResponse: any = await client.post("/api/flags", { name: flagName }, token)

            const flagId = flagCreationResponse.data.id

            flagIds.push(flagId)

            const linkResponse = await client.post(
                "/api/constraints/link",
                { flagId, constraintId },
                token
            )
        }

        const editConstraintResponse = await client.post(
            "/api/constraints/values",
            { id: constraintId, values: "John001, Bob003" },
            token
        )

        const historyResponse: any = await client.post("api/history", { flagId: flagIds[0] }, token)
        assert(historyResponse?.data[0].what === "create")
        assert(historyResponse?.data[1].what === "link")
        assert(historyResponse?.data[2].what === "cvedit")
        assert((historyResponse?.data[2].constraintInfo as string).includes("Steve002"))
        assert((historyResponse?.data[2].constraintInfo as string).includes("Bob003"))

        const historyResponse2: any = await client.post("api/history", { flagId: flagIds[1] }, token)
        assert(historyResponse2?.data[2].what === "cvedit")

        const historyResponse3: any = await client.post("api/history", { flagId: flagIds[2] }, token)
        assert((historyResponse3?.data[2].constraintInfo as string).includes("Bob003"))

        const historyResponse4: any = await client.post("api/history", { flagId: flagIds[3] }, token)
        assert((historyResponse4?.data[2].constraintInfo as string).includes("Steve002"))

        const historyResponse5: any = await client.post("api/history", { flagId: flagIds[4] }, token)
        assert(historyResponse5?.data[2].what === "cvedit")
        assert((historyResponse5?.data[2].constraintInfo as string).includes("Steve002"))
        assert((historyResponse5?.data[2].constraintInfo as string).includes("Bob003"))
    })
})
