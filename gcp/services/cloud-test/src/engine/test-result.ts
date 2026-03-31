export interface SuiteResult {
    label: string;
    success: boolean;
    testsRun: number;
    testsPassed: number;
    testsFailed: number;
    testsSkipped: number;
    tests: Array<{
        name: string;
        success: boolean;
        duration: number;
        error?: string;
        skipped?: boolean;
        skipReason?: string;
    }>;
}

export interface TestResult {
    success: boolean;
    output: string;
    error?: string;
    timestamp: string;
    duration: number;
    testsRun: number;
    testsPassed: number;
    testsFailed: number;
    testsSkipped: number;
    suites: SuiteResult[];
}
