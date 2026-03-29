import { ManagementApiClient } from '../engine/api-client';
import { TestRunner, TestRunResult, TestCase } from '../engine/test-runner';

export async function runUserTests(managementServiceUrl: string, pattern?: string): Promise<TestRunResult> {
    const client = new ManagementApiClient(managementServiceUrl);
    await client.init();

    const runner = new TestRunner();

    const testCases: TestCase[] = [
        {
            name: 'An authorized user can obtain their role',
            test: async () => {
                const me = await client.getMe();

                if (!me.id) {
                    throw new Error('Response missing required field: id');
                }
                const expectedEmail = process.env.TEST_USER_EMAIL;
                if (expectedEmail && me.email !== expectedEmail) {
                    throw new Error(`Expected email '${expectedEmail}', got '${me.email}'`);
                }
                if (!me.role) {
                    throw new Error('Response missing required field: role');
                }
                const validRoles = ['user', 'admin', 'superadmin'];
                if (!validRoles.includes(me.role)) {
                    throw new Error(`Unexpected role '${me.role}'; expected one of ${validRoles.join(', ')}`);
                }
            }
        },

        {
            name: 'An unauthorized user cannot request from protected endpoint',
            test: async () => {
                // A syntactically plausible but cryptographically invalid JWT
                const fakeToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9' +
                    '.eyJzdWIiOiJmYWtlLXVzZXIiLCJlbWFpbCI6ImZha2VAZW1haWwuY29tIn0' +
                    '.invalidsignature';
                const status = await client.getMeStatus(fakeToken);
                if (status !== 401) {
                    throw new Error(`Expected 401 for fake token, got ${status}`);
                }
            }
        },
    ];

    return await runner.run(testCases, pattern);
}
