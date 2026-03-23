export interface TestRunResult {
    success: boolean;
    output: string;
    error?: string;
    testsRun: number;
    testsPassed: number;
    testsFailed: number;
}

export interface TestCase {
    name: string;
    test: () => Promise<void>;
}

export class TestRunner {
    private results: { name: string, success: boolean, error?: string, duration: number }[] = [];

    async run(testCases: TestCase[], pattern?: string): Promise<TestRunResult> {
        const filteredTests = pattern
            ? testCases.filter(tc => tc.name.toLowerCase().includes(pattern.toLowerCase()))
            : testCases;

        let output = `Running ${filteredTests.length} tests...\n`;

        for (const testCase of filteredTests) {
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

        const testsPassed = this.results.filter(r => r.success).length;
        const testsFailed = this.results.length - testsPassed;

        output += `\nResults: ${testsPassed}/${this.results.length} passed\n`;

        if (testsFailed > 0) {
            output += `\nFailed tests:\n`;
            this.results.filter(r => !r.success).forEach(r => {
                output += `  - ${r.name}: ${r.error}\n`;
            });
        }

        return {
            success: testsFailed === 0,
            output,
            testsRun: this.results.length,
            testsPassed,
            testsFailed
        };
    }

    reset() {
        this.results = [];
    }
}