import { ManagementApiClient } from '../engine/api-client';
import { TestRunner, TestRunResult, TestCase } from '../engine/test-runner';

const SKIP_REASON = 'Time offset manipulation is not available in production (NODE_ENV=production). Run tests locally to check.';

export async function runStaleTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const client = new ManagementApiClient(managementServiceUrl);
    await client.init();

    const runner = new TestRunner();
    const isProduction = process.env.NODE_ENV === 'production';

    const testCases: TestCase[] = [
        {
            name: 'A flag unchanged for more than STALE_FLAG_DAYS days is stale',
            skip: isProduction ? SKIP_REASON : undefined,
            test: async () => {
                try {
                    // Set clock to 4 days ago so the flag is created in the past
                    await client.setDaysOffset(-4);

                    const flagName = ManagementApiClient.generateUniqueName('stale-test');
                    const created = await client.createFlag({ name: flagName });

                    // Advance clock to 3 days ago and turn the flag on
                    await client.setDaysOffset(-3);
                    await client.turnOnFlag(created.id);

                    // Reset clock to now
                    await client.setDaysOffset(0);

                    const flags = await client.listFlags();
                    const found = flags.find(f => f.id === created.id);
                    if (!found) {
                        throw new Error('Flag not found in list after time manipulation');
                    }
                    if (!found.stale) {
                        throw new Error('Flag should be stale (last updated 3 days ago, threshold is 2)');
                    }
                } finally {
                    await client.setDaysOffset(0);
                }
            }
        },

        {
            name: 'A recently updated flag is not stale',
            skip: isProduction ? SKIP_REASON : undefined,
            test: async () => {
                try {
                    // Set clock to 4 days ago so the flag is created in the past
                    await client.setDaysOffset(-4);

                    const flagName = ManagementApiClient.generateUniqueName('not-stale-test');
                    const created = await client.createFlag({ name: flagName });

                    // Reset clock to now, then turn the flag on (recently updated)
                    await client.setDaysOffset(0);
                    await client.turnOnFlag(created.id);

                    const flags = await client.listFlags();
                    const found = flags.find(f => f.id === created.id);
                    if (!found) {
                        throw new Error('Flag not found in list after time manipulation');
                    }
                    if (found.stale) {
                        throw new Error('Flag should not be stale (just updated now)');
                    }
                } finally {
                    await client.setDaysOffset(0);
                }
            }
        }
    ];

    return await runner.run(testCases, pattern);
}
