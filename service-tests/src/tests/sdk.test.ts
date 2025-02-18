import test, { describe } from "node:test"
import { Client } from "../client/client"
import { tokenForLoggedInUser } from "../utils/token"
import Salt from "../utils/salt"
import assert from "node:assert"
import PlainFlags from "feature-flags-node-sdk"
import { sleep } from "../utils/sleep"
import * as upath from "upath"
import Config from "../utils/config"

const dotenv = require('dotenv');
dotenv.config({ path: upath.resolve(__dirname, '../../.env') });

describe("SDK operation", () => {
    test("Turning on a flag will show it as on in the SDK ", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-sd-o")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const sdk = new PlainFlags(
            {
                policy: "manual",
                serviceUrl: Config.stateServiceUrl(),
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sdk.init();

        try {
            assert(sdk.isOn(name))
        }
        catch (error) {
            sdk.stopUpdates()
            throw (error)
        }

        sdk.stopUpdates()
    })

    test("Turning on a flag will show it as on in the SDK after a manual state update", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-sd-o")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const sdk = new PlainFlags(
            {
                policy: "manual",
                serviceUrl: Config.stateServiceUrl(),
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sdk.init();

        try {
            assert(!sdk.isOn(name))
        }
        catch (error) {
            sdk.stopUpdates()
            throw (error)
        }

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        await sdk.updateState()

        try {
            assert(sdk.isOn(name))
        }
        catch (error) {
            sdk.stopUpdates()
            throw (error)
        }

        sdk.stopUpdates()
    })

    test("The SDK polls for updates at the specified interval", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-s-po")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        const sdk = new PlainFlags(
            {
                policy: "poll",
                serviceUrl: Config.stateServiceUrl(),
                apiKey: process.env.APIKEY_SDK || "",
                pollInterval: 1000
            },
            null, null
        )

        await sdk.init();

        try {
            assert(sdk.isOn(name))

            const turnOffResponse: any = await client.post("/api/flags/turnoff", { id }, token)

            await sleep(1500)   // Polls at one second, see sdk.init above

            assert(!sdk.isOn(name))
        }
        catch (error) {
            sdk.stopUpdates()
            throw (error)
        }
        sdk.stopUpdates()
    })

    test("A constrained activated flag will be on only for the constrained context", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const flagName = Salt.uniqued("test-s-cx")

        const createFlagResponse: any = await client.post("/api/flags", { name: flagName }, token)

        const flagId = createFlagResponse?.data.id

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id: flagId }, token)

        assert(turnOnResponse?.status === 200)

        const userConstraint = {
            description: Salt.uniqued("test-s-cx"),
            key: "user",
            commaSeparatedValues: "John, Steve"
        }

        const createUserConstraintResponse: any = await client.post(
            "/api/constraints", userConstraint, token
        )

        assert(createUserConstraintResponse?.status === 201)
        const userConstraintId = createUserConstraintResponse.data.id

        const brandConstraint = {
            description: Salt.uniqued("test-s-cx"),
            key: "brand",
            commaSeparatedValues: "Initech, Acme"
        }

        const createBrandConstraintResponse: any = await client.post(
            "/api/constraints", brandConstraint, token
        )

        assert(createBrandConstraintResponse?.status === 201)
        const brandConstraintId = createBrandConstraintResponse.data.id

        await client.post(
            "/api/constraints/link",
            { flagId, constraintId: userConstraintId },
            token
        )
        await client.post(
            "/api/constraints/link",
            { flagId, constraintId: brandConstraintId },
            token
        )

        const sdk = new PlainFlags(
            {
                policy: "manual",
                serviceUrl: Config.stateServiceUrl(),
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sdk.init();

        try {
            assert(sdk.isOn(flagName, undefined, {
                user: "John", brand: "Initech"
            }))

            // Constrained to John and Steve users only
            assert(!sdk.isOn(flagName, undefined, {
                user: "Dave", brand: "Initech"
            }))

            // Constrained to Acme and Initech brands only
            assert(!sdk.isOn(flagName, undefined, {
                user: "John", brand: "TBC"
            }))

            // The flag is not constrained in any region
            assert(sdk.isOn(flagName, undefined, {
                region: "Elbonia"
            }))
        }
        catch (error) {
            sdk.stopUpdates()
            throw (error)
        }

        sdk.stopUpdates()
    })
})