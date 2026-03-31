import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { testSuites } from './engine/test-suites';

interface TestRequest {
    pattern?: string;
}

interface SuiteResult {
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

interface TestResult {
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

const fastify = Fastify({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined
    }
});

// Store test results in memory
const testResults: Map<string, TestResult> = new Map();

// Health check with environment info
fastify.get('/health', async () => {
    return {
        status: 'ok',
        service: 'plainflags-cloud-test',
        environment: {
            MANAGEMENT_SERVICE_URL: process.env.MANAGEMENT_SERVICE_URL || 'not-configured',
            NODE_ENV: process.env.NODE_ENV,
            version: '1.0.0'
        }
    };
});

// Run tests endpoint
fastify.post('/api/run-tests', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body as TestRequest) || {};
    const { pattern } = body;
    const testId = Date.now().toString();

    try {
        const startTime = Date.now();

        fastify.log.info(`Starting test run ${testId} with pattern: ${pattern || 'all'}`);

        // Validate management service URL
        const managementUrl = process.env.MANAGEMENT_SERVICE_URL;
        if (!managementUrl || managementUrl === 'not-configured') {
            reply.code(400).send({
                error: 'Bad Request',
                message: 'MANAGEMENT_SERVICE_URL environment variable not configured'
            });
            return;
        }

        // Run all test suites and merge results
        const results = await Promise.all(
            testSuites.map(suite => suite.run(managementUrl, pattern))
        );
        const suites: SuiteResult[] = testSuites.map((suite, i) => ({
            label: suite.label,
            success: results[i].success,
            testsRun: results[i].testsRun,
            testsPassed: results[i].testsPassed,
            testsFailed: results[i].testsFailed,
            testsSkipped: results[i].testsSkipped,
            tests: results[i].tests,
        }));
        const testRunResult = {
            success: results.every(r => r.success),
            output: results.map(r => r.output).filter(Boolean).join('\n'),
            error: results.map(r => r.error).filter(Boolean).join('\n') || undefined,
            testsRun: results.reduce((s, r) => s + r.testsRun, 0),
            testsPassed: results.reduce((s, r) => s + r.testsPassed, 0),
            testsFailed: results.reduce((s, r) => s + r.testsFailed, 0),
            testsSkipped: results.reduce((s, r) => s + r.testsSkipped, 0),
            suites,
        };
        const duration = Date.now() - startTime;

        const testResult: TestResult = {
            success: testRunResult.success,
            output: testRunResult.output,
            error: testRunResult.error,
            timestamp: new Date().toISOString(),
            duration,
            testsRun: testRunResult.testsRun,
            testsPassed: testRunResult.testsPassed,
            testsFailed: testRunResult.testsFailed,
            testsSkipped: testRunResult.testsSkipped,
            suites: testRunResult.suites,
        };

        // Store result
        testResults.set(testId, testResult);

        fastify.log.info(`Test run ${testId} completed: ${testResult.testsPassed}/${testResult.testsRun} passed in ${duration}ms`);

        reply.send({
            testId,
            ...testResult
        });

    } catch (error) {
        fastify.log.error(error, `Test run ${testId} failed`);
        reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to run tests'
        });
    }
});

// Get specific test result
fastify.get<{ Params: { testId: string } }>('/api/test-results/:testId',
    async (request: FastifyRequest<{ Params: { testId: string } }>, reply: FastifyReply) => {
        const { testId } = request.params;

        const result = testResults.get(testId);

        if (!result) {
            reply.code(404).send({
                error: 'Not Found',
                message: `Test result with ID ${testId} not found`
            });
            return;
        }

        reply.send(result);
    }
);

// List all test results
fastify.get('/api/test-results', async () => {
    const results = Array.from(testResults.entries()).map(([id, result]) => ({
        testId: id,
        success: result.success,
        timestamp: result.timestamp,
        duration: result.duration,
        testsRun: result.testsRun,
        testsPassed: result.testsPassed,
        testsFailed: result.testsFailed,
        testsSkipped: result.testsSkipped,
        suites: result.suites,
    }));

    return {
        results: results.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        total: results.length
    };
});

// Start server
async function start() {
    try {
        const port = parseInt(process.env.PORT || '8080');
        await fastify.listen({ port, host: '0.0.0.0' });

        fastify.log.info(`Cloud test service listening on port ${port}`);
        fastify.log.info('Available endpoints:');
        fastify.log.info('  GET  /health - Health check');
        fastify.log.info('  POST /api/run-tests - Run tests');
        fastify.log.info('  GET  /api/test-results - List all test results');
        fastify.log.info('  GET  /api/test-results/:testId - Get specific test result');

    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully`);

    try {
        await fastify.close();
        fastify.log.info('Server closed');
        process.exit(0);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

start();