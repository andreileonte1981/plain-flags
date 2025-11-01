import test, { describe } from "node:test";
import { Client } from "../client/client";
import Salt from "../utils/salt";
import assert from "assert";
import { sleep } from "../utils/sleep";

describe
    .skip
    ("Demo tests", () => {
        test("Demo users are deleted past the force count threshold", async () => {
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
    });
