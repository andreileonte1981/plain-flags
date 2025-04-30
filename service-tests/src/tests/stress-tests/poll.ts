import { Client } from "../../client/client"
import { tokenForLoggedInUser } from "../../utils/token"
import Salt from "../../utils/salt"
import * as upath from "upath"
import PlainFlags from "feature-flags-node-sdk"
import Config from "../../utils/config"
import assert from "assert"

const dotenv = require('dotenv');
dotenv.config({ path: upath.resolve(__dirname, '../../../.env') });

async function main() {
    const nFlags = 100
    const nClients = 10000
    const pollInterval = 5000

    const client = new Client()

    const token = await tokenForLoggedInUser(client)

    /**
     * First setup the flags, constraints
     */
    console.log("Creating constraints\n")

    const userConstraint = {
        description: Salt.uniqued("c-stress-u"),
        key: "user",
        commaSeparatedValues: "John, Steve"
    }
    const createUserConstraintResponse: any = await client.post(
        "/api/constraints", userConstraint, token
    )
    const userConstraintId = createUserConstraintResponse.data.id

    const brandConstraint = {
        description: Salt.uniqued("c-stress-b"),
        key: "brand",
        commaSeparatedValues: "Initech, Acme"
    }
    const createBrandConstraintResponse: any = await client.post(
        "/api/constraints", brandConstraint, token
    )
    const brandConstraintId = createBrandConstraintResponse.data.id

    console.log(`Constraints: ${userConstraintId}, ${brandConstraintId}\n`)

    console.log("Creating flags\n")

    const flagNames = []
    const createFlagRequests: Promise<any>[] = []
    for (let i = 0; i < nFlags; i++) {
        const flagName = Salt.uniqued("f-stress")

        flagNames.push(flagName)

        createFlagRequests.push(client.post("/api/flags", { name: flagName }, token))
    }

    const responses: any[] = await Promise.all(createFlagRequests);

    console.log(`Flags: ${responses.map(r => (r.data.id as string).substring(0, 4)).join(", ")}`)

    console.log("Constraining flags\n")

    const constrainFlagRequests: Promise<any>[] = []
    for (let i = 0; i < nFlags; i++) {
        const linkResp1 = await client.post(
            "/api/constraints/link",
            { flagId: responses[i].data.id, constraintId: userConstraintId },
            token
        )
        const linkResp2 = await client.post(
            "/api/constraints/link",
            { flagId: responses[i].data.id, constraintId: brandConstraintId },
            token
        )

        if (linkResp1?.status !== 200 || linkResp2?.status !== 200) {
            console.error(`Failed to constrain the ${i}th flag`)
            return;
        }
    }

    console.log("Turning the first flag on\n")

    const turnOnResponse = await client.post("/api/flags/turnon", { id: responses[0].data.id }, token)

    assert(turnOnResponse?.status === 200)

    /**
     * Now measure how long the stress test lasts
     */
    console.log(`---stress test started: poll updates, ${nClients} clients, ${nFlags} flags ---`)
    const sdks: PlainFlags[] = [];
    for (let i = 0; i < nClients; i++) {
        sdks.push(new PlainFlags({
            policy: "poll",
            apiKey: process.env.APIKEY_SDK || "",
            pollInterval,
            timeout: 120000,
            serviceUrl: Config.stateServiceUrl()
        }, null, null))
    }

    const initRequests: Function[] = []
    for (let i = 0; i < nClients; i++) {
        const initRequest = async () => sdks[i].init(true)

        initRequests.push(initRequest)
    }

    const startTime = performance.now()

    await Promise.all(initRequests.map(f => f())).catch((error) => {
        console.error("Error initializing SDK", error)
    })

    const endTime = performance.now()

    console.log(`---stress tests ended in ${endTime - startTime}---\n\n`)

    console.log("Checking if states are updated")

    let i = 0
    try {
        for (const sdk of sdks) {
            const ison = sdk.isOn(flagNames[0], undefined, { user: "John", brand: "Initech" })
            if (!ison) {
                console.debug(sdk)
                throw (new Error())
            }
            i++
        }
    }
    catch (e) {
        console.error(`Check failed at client no. ${i}`, e)
        return
    }

    console.log("All good")
}

main()