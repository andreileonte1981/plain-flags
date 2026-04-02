import { TestRunResult } from './test-runner';
import { runFlagTests } from '../service-tests/flag-tests';
import { runUserTests } from '../service-tests/user-tests';
import { runStaleTests } from '../service-tests/stale-tests';
import { runConstraintTests } from '../service-tests/constraint-tests';
import { runHistoryTests } from '../service-tests/history-tests';
import { runSdkTests } from '../service-tests/sdk-tests';

export interface TestSuite {
    label: string;
    run: (managementUrl: string, pattern?: string) => Promise<TestRunResult>;
}

export const testSuites: TestSuite[] = [
    { label: 'Flags', run: runFlagTests },
    { label: 'Users', run: runUserTests },
    { label: 'Stale Feature', run: runStaleTests },
    { label: 'Constraints', run: runConstraintTests },
    { label: 'History', run: runHistoryTests },
    { label: 'SDK', run: runSdkTests },
];
