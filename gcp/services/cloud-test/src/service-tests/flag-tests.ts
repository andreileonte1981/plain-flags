import { ManagementApiClient, Flag } from './api-client';
import { TestRunner, TestRunResult, TestCase } from './test-runner';

export async function runFlagTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const client = new ManagementApiClient(managementServiceUrl);
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
        }
    ];

    // Run the tests
    return await runner.run(testCases, pattern);
}