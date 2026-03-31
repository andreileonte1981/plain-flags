import { ManagementApiClient, Flag } from '../engine/api-client';
import { TestRunner, TestRunResult, TestCase } from '../engine/test-runner';

export async function runFlagTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const client = new ManagementApiClient(managementServiceUrl);

    // Fetch OIDC token for authenticated requests
    await client.init();

    const runner = new TestRunner();

    // Define test cases
    const testCases: TestCase[] = [
        {
            name: 'Management service health check',
            test: async () => {
                const health = await client.health();
                if (!health.status || health.status !== 'ok') {
                    throw new Error(`Expected health status 'ok', got '${health.status}'`);
                }
            }
        },

        {
            name: 'Create a new flag',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('create-test');
                const flag = await client.createFlag({ name: flagName });

                if (!flag.id) {
                    throw new Error('Created flag should have an ID');
                }
                if (flag.name !== flagName) {
                    throw new Error(`Expected flag name '${flagName}', got '${flag.name}'`);
                }
                if (flag.isOn !== false) {
                    throw new Error('New flag should be off by default');
                }
                if (flag.isArchived !== false) {
                    throw new Error('New flag should not be archived by default');
                }
            }
        },

        {
            name: 'List flags includes newly created flag',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('list-test');

                // Create a flag
                const createdFlag = await client.createFlag({ name: flagName });

                // List flags and verify it's included
                const flags = await client.listFlags();

                if (!Array.isArray(flags)) {
                    throw new Error('List flags should return an array');
                }

                const foundFlag = flags.find(f => f.id === createdFlag.id);
                if (!foundFlag) {
                    throw new Error(`Created flag with ID ${createdFlag.id} not found in list`);
                }

                if (foundFlag.name !== flagName) {
                    throw new Error(`Flag name mismatch: expected '${flagName}', got '${foundFlag.name}'`);
                }
            }
        },

        {
            name: 'Cannot create flag with duplicate name',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('duplicate-test');

                // Create first flag
                await client.createFlag({ name: flagName });

                // Try to create duplicate - should fail
                try {
                    await client.createFlag({ name: flagName });
                    throw new Error('Creating duplicate flag should have failed');
                } catch (error: any) {
                    // Check if it's a 409 Conflict error
                    if (error.response && error.response.status === 409) {
                        // Expected behavior - duplicate creation should fail with 409
                        return;
                    }
                    throw new Error(`Expected 409 Conflict error, got: ${error.message}`);
                }
            }
        },

        {
            name: 'List flags returns valid flag objects',
            test: async () => {
                const flags = await client.listFlags();

                if (!Array.isArray(flags)) {
                    throw new Error('List flags should return an array');
                }

                // Check each flag has required properties
                for (const flag of flags) {
                    if (!flag.id) {
                        throw new Error('Flag missing required property: id');
                    }
                    if (!flag.name) {
                        throw new Error('Flag missing required property: name');
                    }
                    if (typeof flag.isOn !== 'boolean') {
                        throw new Error('Flag.isOn should be a boolean');
                    }
                    if (typeof flag.isArchived !== 'boolean') {
                        throw new Error('Flag.isArchived should be a boolean');
                    }
                    if (!flag.createdAt) {
                        throw new Error('Flag missing required property: createdAt');
                    }
                    if (!flag.updatedAt) {
                        throw new Error('Flag missing required property: updatedAt');
                    }
                }
            }
        },

        {
            name: 'Create flag with minimum name length',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('a'); // Minimum length base with unique suffix
                const flag = await client.createFlag({ name: flagName });

                if (flag.name !== flagName) {
                    throw new Error(`Expected flag name '${flagName}', got '${flag.name}'`);
                }
            }
        },

        {
            name: 'Create flag rejects empty name',
            test: async () => {
                try {
                    await client.createFlag({ name: '' });
                    throw new Error('Creating flag with empty name should have failed');
                } catch (error: any) {
                    // Should fail with validation error (400 Bad Request)
                    if (error.response && (error.response.status === 400 || error.response.status === 422)) {
                        // Expected behavior
                        return;
                    }
                    throw new Error(`Expected validation error (400/422), got: ${error.message}`);
                }
            }
        },

        {
            name: 'Unauthenticated request to protected endpoint returns 401',
            test: async () => {
                const status = await client.unauthenticatedListFlags();
                if (status !== 401 && status !== 403) {
                    throw new Error(
                        `Expected 401 or 403 for unauthenticated request, got ${status}`
                    );
                }
            }
        },

        {
            name: 'Turning a flag on sets isOn=true in the flags list',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('turnon-test');
                const created = await client.createFlag({ name: flagName });

                if (created.isOn !== false) {
                    throw new Error('Flag should start off');
                }

                await client.turnOnFlag(created.id);

                const flags = await client.listFlags();
                const found = flags.find(f => f.id === created.id);
                if (!found) {
                    throw new Error('Flag not found in list after turning on');
                }
                if (found.isOn !== true) {
                    throw new Error(`Expected isOn=true after turning on, got isOn=${found.isOn}`);
                }
            }
        },

        {
            name: 'Turning a flag off sets isOn=false in the flags list',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('turnoff-test');
                const created = await client.createFlag({ name: flagName });

                // Turn it on first
                await client.turnOnFlag(created.id);

                // Then turn it off
                await client.turnOffFlag(created.id);

                const flags = await client.listFlags();
                const found = flags.find(f => f.id === created.id);
                if (!found) {
                    throw new Error('Flag not found in list after turning off');
                }
                if (found.isOn !== false) {
                    throw new Error(`Expected isOn=false after turning off, got isOn=${found.isOn}`);
                }
            }
        },

        {
            name: 'Archived flag is omitted from the flags list',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('archive-omit-test');
                const created = await client.createFlag({ name: flagName });

                await client.archiveFlag(created.id);

                const flags = await client.listFlags();
                const found = flags.find(f => f.id === created.id);
                if (found) {
                    throw new Error(`Archived flag with ID ${created.id} should not appear in the flags list`);
                }
            }
        },

        {
            name: 'Creating a flag with an archived name fails with 409',
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('archive-name-test');
                const created = await client.createFlag({ name: flagName });

                await client.archiveFlag(created.id);

                try {
                    await client.createFlag({ name: flagName });
                    throw new Error('Creating a flag with an archived name should have failed');
                } catch (error: any) {
                    if (error.response && error.response.status === 409) {
                        return;
                    }
                    throw new Error(`Expected 409 Conflict error, got: ${error.message}`);
                }
            }
        },

        {
            name: 'A flag unchanged for more than STALE_FLAG_DAYS days is stale',
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

    // Run the tests
    return await runner.run(testCases, pattern);
}