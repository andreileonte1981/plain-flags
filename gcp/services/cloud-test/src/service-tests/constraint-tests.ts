import { ManagementApiClient } from '../engine/api-client';
import { TestRunner, TestRunResult, TestCase } from '../engine/test-runner';

export async function runConstraintTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const client = new ManagementApiClient(managementServiceUrl);
    await client.init();

    const runner = new TestRunner();

    const testCases: TestCase[] = [
        {
            name: 'Creating a constraint puts it in the all constraints collection',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('crea');
                const created = await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                if (created.id === undefined) {
                    throw new Error('Created constraint should have an id');
                }

                const all = await client.listConstraints();
                const found = all.find((c) => c.description === description);

                if (!found) {
                    throw new Error('Newly created constraint not found in list');
                }
            },
        },

        {
            name: 'A constraint can be linked to a flag',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('link');
                const constraint = await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('link') });

                await client.linkConstraint(flag.id, constraint.id);

                const allConstraints = await client.listConstraints();
                const myConstraint = allConstraints.find((c) => c.id === constraint.id);

                if (!myConstraint) {
                    throw new Error('Constraint not found after linking');
                }
                if (!myConstraint.flags[0] || myConstraint.flags[0].id !== flag.id) {
                    throw new Error('Constraint flags should contain the linked flag');
                }

                const allFlags = await client.listFlags();
                const myFlag = allFlags.find((f) => f.id === flag.id);

                if (!myFlag) {
                    throw new Error('Flag not found after linking');
                }
                if (!myFlag.constraints || !myFlag.constraints[0] || myFlag.constraints[0].description !== description) {
                    throw new Error('Flag constraints should contain the linked constraint');
                }
            },
        },

        {
            name: 'A constraint can be unlinked from a flag',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('ulnk');
                const constraint = await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('ulnk') });

                await client.linkConstraint(flag.id, constraint.id);
                await client.unlinkConstraint(flag.id, constraint.id);

                const allConstraints = await client.listConstraints();
                const myConstraint = allConstraints.find((c) => c.id === constraint.id);

                if (!myConstraint) {
                    throw new Error('Constraint not found after unlinking');
                }
                if (myConstraint.flags[0]) {
                    throw new Error('Constraint flags should be empty after unlinking');
                }

                const allFlags = await client.listFlags();
                const myFlag = allFlags.find((f) => f.id === flag.id);

                if (!myFlag) {
                    throw new Error('Flag not found after unlinking');
                }
                if (myFlag.constraints && myFlag.constraints[0]) {
                    throw new Error('Flag constraints should be empty after unlinking');
                }
            },
        },

        {
            name: 'A constraint with no flags linked can be removed',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('remv');
                await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const allBefore = await client.listConstraints();
                const myConstraint = allBefore.find((c) => c.description === description);

                if (!myConstraint) {
                    throw new Error('Constraint not found before delete');
                }

                await client.deleteConstraint(myConstraint.id);

                const allAfter = await client.listConstraints();
                const deletedConstraint = allAfter.find((c) => c.description === description);

                if (deletedConstraint) {
                    throw new Error('Constraint should not appear in list after deletion');
                }
            },
        },

        {
            name: 'Deleting a linked constraint unlinks it from the linked flag',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('d-ul');
                const constraint = await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('d-ul') });

                await client.linkConstraint(flag.id, constraint.id);
                await client.deleteConstraint(constraint.id);

                const allFlags = await client.listFlags();
                const myFlag = allFlags.find((f) => f.id === flag.id);

                if (!myFlag) {
                    throw new Error('Flag not found after deleting linked constraint');
                }
                if (myFlag.constraints && myFlag.constraints[0]) {
                    throw new Error('Flag constraints should be empty after the linked constraint was deleted');
                }
            },
        },

        {
            name: 'Deleting a constraint linked to an activated flag fails',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('l-ac');
                const constraint = await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('l-ac') });

                await client.linkConstraint(flag.id, constraint.id);
                await client.turnOnFlag(flag.id);

                let err: unknown;
                try {
                    await client.deleteConstraint(constraint.id);
                } catch (error) {
                    err = error;
                }

                if (!err) {
                    throw new Error('Deleting a constraint linked to an active flag should have failed');
                }
            },
        },

        {
            name: 'Archiving a flag unlinks all its constraints',
            test: async () => {
                const description = ManagementApiClient.generateUniqueName('c-ar');
                const constraint = await client.createConstraint({
                    description,
                    key: 'userId',
                    commaSeparatedValues: 'John001, Steve002',
                });

                const flag = await client.createFlag({ name: ManagementApiClient.generateUniqueName('c-ar') });

                await client.linkConstraint(flag.id, constraint.id);
                await client.archiveFlag(flag.id);

                const allConstraints = await client.listConstraints();
                const myConstraint = allConstraints.find((c) => c.id === constraint.id);

                if (!myConstraint) {
                    throw new Error('Constraint not found after archiving linked flag');
                }
                if (myConstraint.flags[0]) {
                    throw new Error('Constraint flags should be empty after linked flag was archived');
                }
            },
        },
    ];

    return await runner.run(testCases, pattern);
}
