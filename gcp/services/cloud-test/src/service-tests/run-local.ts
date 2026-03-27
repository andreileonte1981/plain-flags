/**
 * Local test runner for flag-tests.ts.
 * Run via "npm run test:local" or the VS Code launch config.
 *
 * Loads env vars from two files (relative to cwd = gcp/services/cloud-test):
 *   .env                                  — MANAGEMENT_SERVICE_URL, NODE_ENV
 *   ../../infrastructure/.secrets/firebase.env — FIREBASE_API_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../infrastructure/.secrets/firebase.env') });
dotenv.config();

import { runFlagTests } from './flag-tests';

const managementUrl = process.env.MANAGEMENT_SERVICE_URL || 'http://localhost:8080';

runFlagTests(managementUrl)
    .then(result => {
        console.log('\n=== Test Results ===');
        for (const test of result.tests) {
            const icon = test.success ? '✓' : '✗';
            console.log(`  ${icon} ${test.name} (${test.duration}ms)`);
            if (!test.success && test.error) {
                console.log(`      ${test.error}`);
            }
        }
        console.log(`\n${result.testsPassed}/${result.testsRun} passed`);
        if (!result.success) process.exit(1);
    })
    .catch(err => {
        console.error('Fatal:', err);
        process.exit(1);
    });
