import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../infrastructure/.secrets/firebase.env') });
dotenv.config();

import { testSuites } from './test-suites';

const managementUrl = process.env.MANAGEMENT_SERVICE_URL || 'http://localhost:8080';

async function main() {
    let totalRun = 0;
    let totalPassed = 0;
    let totalSkipped = 0;

    for (const suite of testSuites) {
        const result = await suite.run(managementUrl);
        console.log(`\n=== ${suite.label} Tests ===`);
        for (const test of result.tests) {
            if (test.skipped) {
                const reason = test.skipReason ? `: ${test.skipReason}` : '';
                console.log(`  ○ ${test.name} — skipped${reason}`);
            } else {
                const icon = test.success ? '✓' : '✗';
                console.log(`  ${icon} ${test.name} (${test.duration}ms)`);
                if (!test.success && test.error) {
                    console.log(`      ${test.error}`);
                }
            }
        }
        totalRun += result.testsRun;
        totalPassed += result.testsPassed;
        totalSkipped += result.testsSkipped;
    }

    const skippedNote = totalSkipped > 0 ? `, ${totalSkipped} skipped` : '';
    console.log(`\n${totalPassed}/${totalRun} passed${skippedNote}`);
    if (totalPassed < totalRun) process.exit(1);
}

main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});

