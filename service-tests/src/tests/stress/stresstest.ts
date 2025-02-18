import { Client } from "../../client/client"
import { tokenForLoggedInUser } from "../../utils/token"
import Salt from "../../utils/salt"
import * as upath from "upath"
import PlainFlags from "feature-flags-node-sdk"
import Config from "../../utils/config"

const dotenv = require('dotenv');
dotenv.config({ path: upath.resolve(__dirname, '../../.env') });

async function main() {
    const nFlags = 100
    const nClients = 10000
    const pollInterval = 5000

    const client = new Client()

    const token = await tokenForLoggedInUser(client)

    /**
     * First setup the flags, constraints
     */
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

    const createFlagRequests: Promise<any>[] = []
    for (let i = 0; i < nFlags; i++) {
        const flagName = Salt.uniqued("f-stress")
        createFlagRequests.push(client.post("/api/flags", { name: flagName }, token))
    }

    const responses: any[] = await Promise.all(createFlagRequests);

    const constrainFlagRequests: Promise<any>[] = []
    for (let i = 0; i < nFlags; i++) {
        constrainFlagRequests.push(client.post(
            "/api/constraints/link",
            { flagId: responses[i].data.id, constraintId: userConstraintId },
            token
        ))
        constrainFlagRequests.push(client.post(
            "/api/constraints/link",
            { flagId: responses[i].data.id, constraintId: brandConstraintId },
            token
        ))
    }

    await Promise.all(constrainFlagRequests);

    /**
     * Now measure how long the stress test lasts
     */
    console.log(`---stress test started: ${nClients} clients, ${nFlags} flags ---`)
    const sdks: PlainFlags[] = [];
    for (let i = 0; i < nClients; i++) {
        sdks.push(new PlainFlags({
            policy: "poll",
            apiKey: process.env.APIKEY || "",
            pollInterval,
            serviceUrl: Config.stateServiceUrl()
        }, null, null))
    }

    const initRequests: Function[] = []
    for (let i = 0; i < nClients; i++) {
        const initRequest = async () => sdks[i].init()

        initRequests.push(initRequest)
    }

    const startTime = performance.now()

    await Promise.all(initRequests.map(f => f()))

    const endTime = performance.now()

    console.log(`---stress tests ended in ${endTime - startTime}---`)
}

main()