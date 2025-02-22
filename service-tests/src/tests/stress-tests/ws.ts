import { Client } from "../../client/client"
import { tokenForLoggedInUser } from "../../utils/token"
import Salt from "../../utils/salt"
import * as upath from "upath"
import PlainFlags from "feature-flags-node-sdk"
import Config from "../../utils/config"
import { sleep } from "../../utils/sleep"

const dotenv = require('dotenv');
dotenv.config({ path: upath.resolve(__dirname, '../../../.env') });

async function main() {
    const nFlags = 100
    const nClients = 10000

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
    console.log(`---stress test started: socket updates, ${nClients} clients, ${nFlags} flags ---`)
    const sdks: PlainFlags[] = [];
    for (let i = 0; i < nClients; i++) {
        sdks.push(new PlainFlags({
            policy: "ws",
            serviceUrl: Config.stateServiceWs()
        },
            null, null
        ))
    }

    const initRequests: Function[] = []
    for (let i = 0; i < nClients; i++) {
        const initRequest = async () => sdks[i].init()

        initRequests.push(initRequest)
    }

    const startTime = performance.now()

    await Promise.all(initRequests.map(f => f()))

    const id = responses[0].data.id
    console.log(`---clients created in ${performance.now() - startTime}---`)

    await client.post("/api/flags/turnon", { id }, token)

    let updated = false;
    while (!updated) {
        updated = true;
        for (let i = 0; i < nClients; i++) {
            if (!sdks[i].isOn(
                responses[0].data.name,
                false,
                { user: "John", brand: "Initech" }
            )) {
                updated = false
                break
            }
        }

        if (!updated) {
            console.log("Not all updated, waiting...")
            await sleep(1000)
        }
    }

    const endTime = performance.now()

    console.log(`---stress tests ended in ${endTime - startTime}, cleaning up...---`)
    for (let i = 0; i < nClients; i++) {
        sdks[i].stopUpdates()
    }
}

main()