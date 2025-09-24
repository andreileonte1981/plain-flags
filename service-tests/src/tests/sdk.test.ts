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
    test("Turning on a flag will show it as on in the SDK after initialization", async () => {
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
                timeout: 20000,
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sleep(1200)

        await sdk.init();

        assert(sdk.isOn(name))
    })

    test("Turning on a flag will show it as on in the SDK after a manual state update", async () => {
        const client = new Client()

        const token = await tokenForLoggedInUser(client)

        const name = Salt.uniqued("test-sd-p")

        const response: any = await client.post("/api/flags", { name }, token)

        const id = response?.data.id

        const sdk = new PlainFlags(
            {
                policy: "manual",
                serviceUrl: Config.stateServiceUrl(),
                timeout: 20000,
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sleep(1200)

        await sdk.init();

        assert(!sdk.isOn(name))

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id }, token)

        assert(turnOnResponse?.status === 200)

        await sleep(1200)

        await sdk.updateState()

        assert(sdk.isOn(name))
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
                pollInterval: 1000,
                timeout: 950,
                logStateUpdatesOnPoll: false
            },
            null, null
        )

        await sleep(1200)

        await sdk.init();

        assert(sdk.isOn(name))

        const turnOffResponse: any = await client.post("/api/flags/turnoff", { id }, token)

        /**
         * Polls at one second, see sdk.init above.
         * Assumes cache invalidates at 1 second (see CACHE_TTL in state service config)
         */
        await sleep(2500)

        assert(!sdk.isOn(name))
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
            description: Salt.uniqued("test-s-cu"),
            key: "user",
            commaSeparatedValues: "John, Steve"
        }

        const createUserConstraintResponse: any = await client.post(
            "/api/constraints", userConstraint, token
        )

        assert(createUserConstraintResponse?.status === 201)
        const userConstraintId = createUserConstraintResponse.data.id

        const brandConstraint = {
            description: Salt.uniqued("test-s-cb"),
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
                timeout: 20000,
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sleep(1200)

        await sdk.init();

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
    })

    test("Users lose and gain access to features after constraint details are edited to add and remove the users", async () => {
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

        const turnOnResponse: any = await client.post("/api/flags/turnon", { id: flagId }, token)

        assert(turnOnResponse?.status === 200)

        const sdk = new PlainFlags(
            {
                policy: "manual",
                serviceUrl: Config.stateServiceUrl(),
                timeout: 20000,
                apiKey: process.env.APIKEY_SDK || ""
            },
            null, null
        )

        await sleep(1200)

        await sdk.init()

        assert(sdk.isOn(flagName, undefined, { userId: "Steve002" }))
        assert(!sdk.isOn(flagName, undefined, { userId: "Bob003" }))

        const editConstraintResponse = await client.post(
            "/api/constraints/values",
            { id: constraintId, values: "John001, Bob003" },
            token
        )

        await sleep(1200)

        await sdk.updateState()

        assert(!sdk.isOn(flagName, undefined, { userId: "Steve002" }))
        assert(sdk.isOn(flagName, undefined, { userId: "Bob003" }))
    })
})