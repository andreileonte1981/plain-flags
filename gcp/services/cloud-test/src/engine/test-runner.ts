export interface TestRunResult {
    success: boolean;
    output: string;
    error?: string;
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

export interface TestCase {
    name: string;
    /** If set, the test is skipped and this string is shown as the reason. */
    skip?: string;
    test: () => Promise<void>;
}

export class TestRunner {
    private results: { name: string, success: boolean, error?: string, duration: number, skipped?: boolean, skipReason?: string }[] = [];

    async run(testCases: TestCase[], pattern?: string): Promise<TestRunResult> {
        const filteredTests = pattern
            ? testCases.filter(tc => tc.name.toLowerCase().includes(pattern.toLowerCase()))
            : testCases;

        let output = `Running ${filteredTests.length} tests...\n`;

        for (const testCase of filteredTests) {
            if (testCase.skip) {
                this.results.push({ name: testCase.name, success: true, duration: 0, skipped: true, skipReason: testCase.skip });
                output += `○ ${testCase.name} — skipped: ${testCase.skip}\n`;
                continue;
            }
            const startTime = Date.now();
            try {
                await testCase.test();
                const duration = Date.now() - startTime;
                this.results.push({ name: testCase.name, success: true, duration });
                output += `✓ ${testCase.name} (${duration}ms)\n`;
            } catch (error) {
                const duration = Date.now() - startTime;
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.results.push({ name: testCase.name, success: false, error: errorMessage, duration });
                output += `✗ ${testCase.name} (${duration}ms)\n  ${errorMessage}\n`;
            }
        }

        const testsSkipped = this.results.filter(r => r.skipped).length;
        const testsPassed = this.results.filter(r => r.success && !r.skipped).length;
        const testsFailed = this.results.filter(r => !r.success).length;

        output += `\nResults: ${testsPassed}/${this.results.length - testsSkipped} passed`;
        if (testsSkipped > 0) output += `, ${testsSkipped} skipped`;
        output += `\n`;

        if (testsFailed > 0) {
            output += `\nFailed tests:\n`;
            this.results.filter(r => !r.success).forEach(r => {
                output += `  - ${r.name}: ${r.error}\n`;
            });
        }

        return {
            success: testsFailed === 0,
            output,
            testsRun: this.results.length - testsSkipped,
            testsPassed,
            testsFailed,
            testsSkipped,
            tests: this.results.map(r => ({
                name: r.name,
                success: r.success,
                duration: r.duration,
                error: r.error,
                skipped: r.skipped,
                skipReason: r.skipReason
            }))
        };
    }

    reset() {
        this.results = [];
    }
}