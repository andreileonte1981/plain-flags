import * as upath from "upath"
import { Client } from "../client/client";
import { tokenForLoggedInUser } from "../utils/token";

const dotenv = require('dotenv');
dotenv.config({ path: upath.resolve(__dirname, '../../.env') });

async function main() {
    try {
        const client = new Client()

        const token = await tokenForLoggedInUser(client);

        await makeCircleFlags(client, token);

        await makeMouthFlags(client, token);

        await makeEyesFlags(client, token);
    } catch (err) {
        console.error("Error creating data for demo:", err);
    }
}

async function makeEyesFlags(client: Client, token: string) {
    const eyeCoordinates = [
        [9, 5], [14, 5]
    ];

    for (const [x, y] of eyeCoordinates) {
        const name = `pixel-${x}-${y}`;
        try {
            const createResponse: any = await client.post("/api/flags", { name }, token);

            const turnOnResponse = await client.post(`/api/flags/turnon`, { id: createResponse?.data.id }, token);
        } catch (err) {
            console.error(`Error creating flag ${name}:`, err);
        }
    }
}

async function makeMouthFlags(client: Client, token: string) {
    const mouthCoordinates = [
        [6, 16], [7, 16], [8, 16], [9, 16], [10, 16], [11, 16], [12, 16], [13, 16], [14, 16], [15, 16], [16, 16], [17, 16],
        [6, 17], [7, 17], [8, 17], [9, 17], [10, 17], [11, 17], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [17, 17],
        [7, 18], [8, 18], [9, 18], [10, 18], [11, 18], [12, 18], [13, 18], [14, 18], [15, 18], [16, 18],
        [8, 19], [9, 19], [10, 19], [11, 19], [12, 19], [13, 19], [14, 19], [15, 19],
        [10, 20], [11, 20], [12, 20], [13, 20]
    ];

    for (const [x, y] of mouthCoordinates) {
        const name = `pixel-${x}-${y}`;
        try {
            const createResponse: any = await client.post("/api/flags", { name }, token);

            const turnOnResponse = await client.post(`/api/flags/turnon`, { id: createResponse?.data.id }, token);
        } catch (err) {
            console.error(`Error creating flag ${name}:`, err);
        }
    }
}

async function makeCircleFlags(client: Client, token: string) {
    const centerX = 11.5;
    const centerY = 11.5;
    const radius = 11;

    for (let y = 0; y < 24; y++) {
        for (let x = 0; x < 24; x++) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (Math.abs(dist - radius) < 0.5) {
                const name = `pixel-${x}-${y}`;
                try {
                    const createResponse: any = await client.post("/api/flags", { name }, token);

                    const turnOnResponse = await client.post(`/api/flags/turnon`, { id: createResponse?.data.id }, token);
                } catch (err) {
                    console.error(`Error creating flag ${name}:`, err);
                }
            }
        }
    }
}

main();
