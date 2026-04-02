import { ManagementApiClient } from '../engine/api-client';
import { TestRunner, TestRunResult, TestCase } from '../engine/test-runner';

export async function runHistoryTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const client = new ManagementApiClient(managementServiceUrl);
    await client.init();

    const runner = new TestRunner();

    const testCases: TestCase[] = [
        {
            name: 'Flag creation, activation, deactivation and archiving are recorded',
            test: async () => {
                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('hist-flag') });

                await client.turnOnFlag(flag.id);
                await client.turnOffFlag(flag.id);
                await client.archiveFlag(flag.id);

                const history = await client.getHistory(flag.id);

                if (history.length !== 4) {
                    throw new Error(`Expected 4 history entries, got ${history.length}`);
                }
                if (history[0].what !== 'create') {
                    throw new Error(`Expected history[0].what to be 'create', got '${history[0].what}'`);
                }
                if (history[1].what !== 'turnon') {
                    throw new Error(`Expected history[1].what to be 'turnon', got '${history[1].what}'`);
                }
                if (history[2].what !== 'turnoff') {
                    throw new Error(`Expected history[2].what to be 'turnoff', got '${history[2].what}'`);
                }
                if (history[3].what !== 'archive') {
                    throw new Error(`Expected history[3].what to be 'archive', got '${history[3].what}'`);
                }
            },
        },

        {
            name: 'Flag constraining and unconstraining are recorded',
            test: async () => {
                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('hist-link') });
                const constraint = await client.createConstraint({
                    description: ManagementApiClient.generateUniqueName('hist-link'),
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                await client.linkConstraint(flag.id, constraint.id);
                await client.unlinkConstraint(flag.id, constraint.id);

                const history = await client.getHistory(flag.id);

                if (history.length !== 3) {
                    throw new Error(`Expected 3 history entries, got ${history.length}`);
                }
                if (history[0].what !== 'create') {
                    throw new Error(`Expected history[0].what to be 'create', got '${history[0].what}'`);
                }
                if (history[1].what !== 'link') {
                    throw new Error(`Expected history[1].what to be 'link', got '${history[1].what}'`);
                }
                if (!history[1].constraintInfo) {
                    throw new Error('Expected constraintInfo on link history entry');
                }
                if (history[2].what !== 'unlink') {
                    throw new Error(`Expected history[2].what to be 'unlink', got '${history[2].what}'`);
                }
                if (!history[2].constraintInfo) {
                    throw new Error('Expected constraintInfo on unlink history entry');
                }
            },
        },

        {
            name: 'Editing constraint values is recorded for all linked flags',
            test: async () => {
                const constraint = await client.createConstraint({
                    description: ManagementApiClient.generateUniqueName('hist-edit'),
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const flagIds: string[] = [];
                for (let i = 0; i < 3; i++) {
                    const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('hist-edit') });
                    flagIds.push(flag.id);
                    await client.linkConstraint(flag.id, constraint.id);
                }

                await client.updateConstraintValues(constraint.id, 'John001, Bob003');

                for (const flagId of flagIds) {
                    const history = await client.getHistory(flagId);
                    const cveditEntry = history.find((e) => e.what === 'cvedit');

                    if (!cveditEntry) {
                        throw new Error(`Expected a cvedit history entry for flag ${flagId}`);
                    }
                    if (!cveditEntry.constraintInfo?.includes('Steve002')) {
                        throw new Error(`Expected constraintInfo to contain old value 'Steve002'`);
                    }
                    if (!cveditEntry.constraintInfo?.includes('Bob003')) {
                        throw new Error(`Expected constraintInfo to contain new value 'Bob003'`);
                    }
                }
            },
        },
    ];

    return await runner.run(testCases, pattern);
}
