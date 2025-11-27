import test, { describe } from "node:test";
import { Client } from "../client/client";
import Salt from "../utils/salt";
import assert from "assert";
import { sleep } from "../utils/sleep";
import { tokenForLoggedInUser } from "../utils/token";

describe
    // .skip
    ("Demo tests", () => {
        test("A demo user cannot archive a flag", async () => {
            const client = new Client()

            const demoUserRequest: any = await client.post("/api/dashauth/demo", {
                name: Salt.uniqued("DemoUser")
            })

            const demoUserEmail = demoUserRequest.data.user.email
            const demoUserPassword = demoUserRequest.data.user.tempPassword

            const loginResponse: any = await client.post("/api/users/login", {
                email: demoUserEmail,
                password: demoUserPassword
            })

            assert(loginResponse.status === 200)

            const token = loginResponse.data.token

            const flagCreationResponse: any = await client.post(
                "/api/flags",
                { name: Salt.uniqued("NoArchive") },
                token
            )

            assert(flagCreationResponse.status === 201)

            const flagId = flagCreationResponse.data.id

            let error: any
            try {
                await client.post(
                    "/api/flags/archive",
                    { id: flagId },
                    token
                )
            } catch (e) { error = e }

            assert(error)
            assert(error.response.data.message.includes("Demo users cannot archive flags"))
        });

        test
            .skip
            ("Demo users are deleted past the force count threshold", async () => {
                const client = new Client()

                const firstUserRequest: any = await client.post("/api/dashauth/demo", {
                    name: Salt.uniqued("DemoPrimus")
                })

                const firstUserEmail = firstUserRequest.data.user.email
                const firstUserPassword = firstUserRequest.data.user.tempPassword

                const loginResponse: any = await client.post("/api/users/login", {
                    email: firstUserEmail,
                    password: firstUserPassword
                })

                assert(loginResponse.status === 200)

                await sleep(1000)

                for (let i = 0; i < 65; i++) {
                    await client.post("/api/dashauth/demo", {
                        name: Salt.uniqued("DemoJoe" + i)
                    })
                }

                // Expect the first user to be deleted now
                let error: any
                try {
                    await client.post("/api/users/login", {
                        email: firstUserEmail,
                        password: firstUserPassword
                    })
                }
                catch (e) { error = e }

                assert(error)
                assert(error.response.data.message.includes("Wrong email and/or password"))
            });

        test
            .skip
            ("Excess flags are deleted", async () => {
                const client = new Client()

                const token = await tokenForLoggedInUser(client)

                const firstConstraintDescription = Salt.uniqued("test-link")

                const firstConstraint = {
                    description: firstConstraintDescription,
                    key: "userId",
                    commaSeparatedValues: "John001, Steve002"
                }

                const constraintCreationResponse: any = await client.post("/api/constraints", firstConstraint, token)

                const flagName = Salt.uniqued("test-link")

                const flagCreationResponse: any = await client.post("/api/flags", { name: flagName }, token)

                const firstFlagId = flagCreationResponse.data.id
                const firstConstraintId = constraintCreationResponse.data.id

                const linkResponse: any = await client.post(
                    "/api/constraints/link",
                    { flagId: firstFlagId, constraintId: firstConstraintId },
                    token
                )

                assert(linkResponse.status === 200)

                const turnOnResponse: any = await client.post("/api/flags/turnon", { id: firstFlagId }, token)

                assert(turnOnResponse?.status === 200)

                for (let i = 0; i < 35; i++) {
                    const extraFlagName = Salt.uniqued("extra-flag-" + i)

                    const extraFlagCreationResponse: any = await client.post("/api/flags", { name: extraFlagName }, token)
                }

                // The first flag should be deleted now
                let error: any
                try {
                    await client.post("/api/flags/turnoff", { id: firstFlagId }, token)
                }
                catch (e) { error = e }

                assert(error)
                assert(error.response.data.message.includes("not found"))
            })

        test
            .skip
            ("Excess constraints are deleted", async () => {
                const client = new Client()

                const token = await tokenForLoggedInUser(client)

                const firstConstraintDescription = Salt.uniqued("test-link")

                const firstConstraint = {
                    description: firstConstraintDescription,
                    key: "userId",
                    commaSeparatedValues: "John001, Steve002"
                }

                const constraintCreationResponse: any = await client.post("/api/constraints", firstConstraint, token)

                const flagName = Salt.uniqued("test-link")

                const flagCreationResponse: any = await client.post("/api/flags", { name: flagName }, token)

                const firstFlagId = flagCreationResponse.data.id
                const firstConstraintId = constraintCreationResponse.data.id

                const linkResponse: any = await client.post(
                    "/api/constraints/link",
                    { flagId: firstFlagId, constraintId: firstConstraintId },
                    token
                )

                assert(linkResponse.status === 200)

                const turnOnResponse: any = await client.post("/api/flags/turnon", { id: firstFlagId }, token)

                assert(turnOnResponse?.status === 200)

                for (let i = 0; i < 35; i++) {
                    const extraConstraintName = Salt.uniqued("extra-constraint-" + i)
                    const extraConstraintCreationResponse: any = await client.post(
                        "/api/constraints",
                        {
                            description: extraConstraintName,
                            key: "userId",
                            commaSeparatedValues: "John001, Steve002"
                        }, token
                    )
                }

                // The first constraint should be deleted now
                let error: any
                try {
                    await client.post("/api/constraints/delete", { id: firstConstraintId }, token)
                }
                catch (e) { error = e }

                assert(error)
                assert(error.response.data.message.includes("not found"))
            })
    });
