import { TestRunResult } from './test-runner';
import { runFlagTests } from '../service-tests/flag-tests';
import { runUserTests } from '../service-tests/user-tests';
import { runStaleTests } from '../service-tests/stale-tests';

export interface TestSuite {
    label: string;
    run: (managementUrl: string, pattern?: string) => Promise<TestRunResult>;
}

export const testSuites: TestSuite[] = [
    { label: 'Flags', run: runFlagTests },
    { label: 'Users', run: runUserTests },
    { label: 'Stale Feature', run: runStaleTests },
];
