/**
 * Local test runner for flag-tests.ts.
 * Run via "npm run local" or the VS Code launch config.
 *
 * Loads env vars from two files (relative to cwd = gcp/services/cloud-test):
 *   .env                                  — MANAGEMENT_SERVICE_URL, NODE_ENV
 *   ../../infrastructure/.secrets/firebase.env — FIREBASE_API_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../infrastructure/.secrets/firebase.env') });
dotenv.config();

import { runFlagTests } from '../service-tests/flag-tests';
import { runUserTests } from '../service-tests/user-tests';

const managementUrl = process.env.MANAGEMENT_SERVICE_URL || 'http://localhost:8080';

async function main() {
    let totalRun = 0;
    let totalPassed = 0;

    for (const [label, run] of [
        ['Flags', () => runFlagTests(managementUrl)],
        ['Users', () => runUserTests(managementUrl)],
    ] as const) {
        const result = await run();
        console.log(`\n=== ${label} Tests ===`);
        for (const test of result.tests) {
            const icon = test.success ? '✓' : '✗';
            console.log(`  ${icon} ${test.name} (${test.duration}ms)`);
            if (!test.success && test.error) {
                console.log(`      ${test.error}`);
            }
        }
        totalRun += result.testsRun;
        totalPassed += result.testsPassed;
    }

    console.log(`\n${totalPassed}/${totalRun} passed`);
    if (totalPassed < totalRun) process.exit(1);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
