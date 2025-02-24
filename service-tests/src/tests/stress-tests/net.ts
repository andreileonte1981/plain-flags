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
    const client = new Client()

    const token = await tokenForLoggedInUser(client)

    const flagName = Salt.uniqued("f-stress-net")

    const createFlagResponse: any = await client.post("/api/flags", { name: flagName }, token)

    const id = createFlagResponse.data.id

    console.log(`---stress test started: socket stability. Stop the process manually.---`)

    const sdk = new PlainFlags({
        policy: "ws",
        serviceUrl: Config.stateServiceWs(),
        apiKey: process.env.APIKEY_SDK || ""
    },
        // null, null
    )

    await sdk.init();

    /**
     * Must be stopped manually, this test tests network interruptions.
     * I expect to see continuous updates.
     */
    while (true) {
        console.log(`state for ${flagName}: ${sdk.isOn(flagName)}`)

        await sleep(1000)
    }
}

main()
