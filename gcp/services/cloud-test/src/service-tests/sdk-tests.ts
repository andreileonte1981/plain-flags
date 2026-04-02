import PlainFlags from 'plain-flags-node-sdk';
import { ManagementApiClient } from '../engine/api-client';
import { TestRunner, TestRunResult, TestCase } from '../engine/test-runner';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runSdkTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const statesServiceUrl = process.env.STATES_SERVICE_URL || '';
    const statesApiKey = process.env.STATES_APIKEY || '';

    const skipReason = !statesServiceUrl
        ? 'STATES_SERVICE_URL not configured (cloud-only test)'
        : undefined;

    const client = new ManagementApiClient(managementServiceUrl);
    if (!skipReason) {
        await client.init();
    }

    const runner = new TestRunner();

    const testCases: TestCase[] = [
        {
            name: 'Turning on a flag shows it as on in the SDK after initialization',
            skip: skipReason,
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('sdk-on');
                const flag = await client.createFlag({ name: flagName });
                await client.turnOnFlag(flag.id);

                const sdk = new PlainFlags(
                    { policy: 'manual', serviceUrl: statesServiceUrl, timeout: 20000, apiKey: statesApiKey },
                    null, null
                );

                await sleep(1200);
                await sdk.init();

                if (!sdk.isOn(flagName)) {
                    throw new Error(`Expected flag '${flagName}' to be on after SDK init`);
                }
            },
        },

        {
            name: 'Turning on a flag shows it as on after a manual SDK state update',
            skip: skipReason,
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('sdk-upd');
                const flag = await client.createFlag({ name: flagName });

                const sdk = new PlainFlags(
                    { policy: 'manual', serviceUrl: statesServiceUrl, timeout: 20000, apiKey: statesApiKey },
                    null, null
                );

                await sleep(1200);
                await sdk.init();

                if (sdk.isOn(flagName)) {
                    throw new Error(`Expected flag '${flagName}' to be off before turning on`);
                }

                await client.turnOnFlag(flag.id);

                await sleep(1200);
                await sdk.updateState();

                if (!sdk.isOn(flagName)) {
                    throw new Error(`Expected flag '${flagName}' to be on after updateState`);
                }
            },
        },

        {
            name: 'The SDK polls for updates at the specified interval',
            skip: skipReason,
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('sdk-poll');
                const flag = await client.createFlag({ name: flagName });
                await client.turnOnFlag(flag.id);

                const sdk = new PlainFlags(
                    {
                        policy: 'poll',
                        serviceUrl: statesServiceUrl,
                        apiKey: statesApiKey,
                        pollInterval: 1000,
                        timeout: 950,
                        logStateUpdatesOnPoll: false,
                    },
                    null, null
                );

                await sleep(1200);
                await sdk.init();

                if (!sdk.isOn(flagName)) {
                    throw new Error(`Expected flag '${flagName}' to be on after init`);
                }

                await client.turnOffFlag(flag.id);

                await sleep(2500);

                if (sdk.isOn(flagName)) {
                    throw new Error(`Expected flag '${flagName}' to be off after poll update`);
                }
            },
        },

        {
            name: 'A constrained flag is on only for the matching context',
            skip: skipReason,
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('sdk-cx');
                const flag = await client.createFlag({ name: flagName });
                await client.turnOnFlag(flag.id);

                const userConstraint = await client.createConstraint({
                    description: ManagementApiClient.generateUniqueName('sdk-cu'),
                    key: 'user',
                    commaSeparatedValues: 'John, Steve',
                });
                const brandConstraint = await client.createConstraint({
                    description: ManagementApiClient.generateUniqueName('sdk-cb'),
                    key: 'brand',
                    commaSeparatedValues: 'Initech, Acme',
                });

                await client.linkConstraint(flag.id, userConstraint.id);
                await client.linkConstraint(flag.id, brandConstraint.id);

                const sdk = new PlainFlags(
                    { policy: 'manual', serviceUrl: statesServiceUrl, timeout: 20000, apiKey: statesApiKey },
                    null, null
                );

                await sleep(1200);
                await sdk.init();

                if (!sdk.isOn(flagName, undefined, { user: 'John', brand: 'Initech' })) {
                    throw new Error('Expected flag on for matching user and brand');
                }
                if (sdk.isOn(flagName, undefined, { user: 'Dave', brand: 'Initech' })) {
                    throw new Error('Expected flag off for non-matching user');
                }
                if (sdk.isOn(flagName, undefined, { user: 'John', brand: 'TBC' })) {
                    throw new Error('Expected flag off for non-matching brand');
                }
                if (!sdk.isOn(flagName, undefined, { region: 'Elbonia' })) {
                    throw new Error('Expected flag on when constraint key is not present in context');
                }
            },
        },

        {
            name: 'Users lose and gain access after constraint values are edited',
            skip: skipReason,
            test: async () => {
                const flagName = ManagementApiClient.generateUniqueName('sdk-edit');
                const flag = await client.createFlag({ name: flagName });
                await client.turnOnFlag(flag.id);

                const constraint = await client.createConstraint({
                    description: ManagementApiClient.generateUniqueName('sdk-edit'),
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });
                await client.linkConstraint(flag.id, constraint.id);

                const sdk = new PlainFlags(
                    { policy: 'manual', serviceUrl: statesServiceUrl, timeout: 20000, apiKey: statesApiKey },
                    null, null
                );

                await sleep(1200);
                await sdk.init();

                if (!sdk.isOn(flagName, undefined, { userId: 'Steve002' })) {
                    throw new Error('Expected Steve002 to have access before edit');
                }
                if (sdk.isOn(flagName, undefined, { userId: 'Bob003' })) {
                    throw new Error('Expected Bob003 to not have access before edit');
                }

                await client.updateConstraintValues(constraint.id, 'John001, Bob003');

                await sleep(1200);
                await sdk.updateState();

                if (sdk.isOn(flagName, undefined, { userId: 'Steve002' })) {
                    throw new Error('Expected Steve002 to lose access after edit');
                }
                if (!sdk.isOn(flagName, undefined, { userId: 'Bob003' })) {
                    throw new Error('Expected Bob003 to gain access after edit');
                }
            },
        },
    ];

    return runner.run(testCases, pattern);
}
