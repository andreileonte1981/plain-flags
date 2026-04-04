/**
 * stress-test.ts
 *
 * Fires N concurrent requests to the Plain Flags states service using the
 * Node SDK's isOn() method (manual-update policy) and records:
 *
 *   - start / end / total duration of sending all requests
 *   - time to last response (successful or not)
 *   - time to first error, duration from start to first error
 *   - count of errors (SDK returning false for a flag that should be on)
 *   - count of timeouts (SDK throwing / init failing)
 *
 * Writes a JSON and a human-readable TXT report to dist/report-<timestamp>.txt|json
 *
 * Usage:
 *   node dist/stress-test.js [concurrency]
 *
 * The concurrency argument overrides the STRESS_CONCURRENCY env var (default 200).
 */

import * as path from 'path';
import * as fs from 'fs';

import PlainFlags from 'plain-flags-node-sdk';
import { SEED_FLAG_NAMES_FILE } from './seed-data';
import { clearData } from './clear-data';
import { closePool } from './db';

// ── Config ────────────────────────────────────────────────────────────────────

const concurrency = parseInt(process.argv[2] || process.env.STRESS_CONCURRENCY || '200', 10);
const statesUrl = process.env.STATES_SERVICE_URL || '';
const statesApiKey = process.env.STATES_APIKEY || '';

// Context that should always produce isOn=true (matches seed data)
const VALID_CONTEXT = { user: 'John', brand: 'Initech' };

// Timeout per SDK init call (ms)
const SDK_TIMEOUT = 30000;

// ── Report types ─────────────────────────────────────────────────────────────

interface StressReport {
    concurrency: number;
    statesUrl: string;
    flagsChecked: number;

    sendStart: string;       // ISO timestamp when first batch was fired
    sendEnd: string;         // ISO timestamp when last SDK was created and init() called
    sendDurationMs: number;  // elapsed from first to last init() call dispatched

    lastResponseAt: string;  // ISO timestamp of last resolved/rejected promise
    totalDurationMs: number; // from sendStart to lastResponseAt

    firstErrorAt: string | null;   // ISO timestamp of first error (null if none)
    timeToFirstErrorMs: number | null;

    totalRequests: number;
    errors: number;          // isOn returned false (flag should be on)
    timeouts: number;        // sdk.init() threw
    successes: number;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    if (!statesUrl) {
        console.error('Error: STATES_SERVICE_URL is not set in .env');
        process.exit(1);
    }
    if (!statesApiKey) {
        console.error('Error: STATES_APIKEY is not set in .env');
        process.exit(1);
    }

    // Load flag names written by seed-data
    if (!fs.existsSync(SEED_FLAG_NAMES_FILE)) {
        console.error(`Error: seed flag names file not found at ${SEED_FLAG_NAMES_FILE}`);
        console.error('Run seed-data first: npm run seed');
        process.exit(1);
    }
    const flagNames: string[] = JSON.parse(fs.readFileSync(SEED_FLAG_NAMES_FILE, 'utf8'));
    if (flagNames.length === 0) {
        console.error('Error: seed flag names file is empty');
        process.exit(1);
    }

    console.log(`\nStress test configuration:`);
    console.log(`  Concurrent requests : ${concurrency}`);
    console.log(`  States service      : ${statesUrl}`);
    console.log(`  Flags in dataset    : ${flagNames.length}`);
    console.log(`  Check context       : user=John, brand=Initech\n`);

    // Use the first flag name for all requests — it's definitely seeded and on
    const targetFlag = flagNames[0];

    // ── Fire requests ─────────────────────────────────────────────────────────

    let errors = 0;
    let timeouts = 0;
    let successes = 0;
    let firstErrorAt: number | null = null;

    const sendStartMs = performance.now();
    const sendStartISO = new Date().toISOString();

    // Build all SDK instances up-front (cheap, no network yet)
    const sdks: PlainFlags[] = [];
    for (let i = 0; i < concurrency; i++) {
        sdks.push(new PlainFlags(
            {
                policy: 'manual',
                serviceUrl: statesUrl,
                apiKey: statesApiKey,
                timeout: SDK_TIMEOUT,
            },
            null, null
        ));
    }

    const sendEndMs = performance.now();
    const sendEndISO = new Date().toISOString();
    const sendDurationMs = Math.round(sendEndMs - sendStartMs);

    console.log(`Dispatching ${concurrency} concurrent init() calls...`);

    // Fire all inits simultaneously
    const promises = sdks.map(async (sdk, _i) => {
        try {
            await sdk.init();
            const isOn = sdk.isOn(targetFlag, undefined, VALID_CONTEXT);
            if (!isOn) {
                if (firstErrorAt === null) firstErrorAt = performance.now();
                errors++;
            } else {
                successes++;
            }
        } catch (_err) {
            if (firstErrorAt === null) firstErrorAt = performance.now();
            timeouts++;
        }
    });

    await Promise.allSettled(promises);

    const lastResponseMs = performance.now();
    const lastResponseISO = new Date().toISOString();
    const totalDurationMs = Math.round(lastResponseMs - sendStartMs);
    const timeToFirstErrorMs = firstErrorAt !== null
        ? Math.round(firstErrorAt - sendStartMs)
        : null;

    // ── Build report ──────────────────────────────────────────────────────────

    const report: StressReport = {
        concurrency,
        statesUrl,
        flagsChecked: flagNames.length,

        sendStart: sendStartISO,
        sendEnd: sendEndISO,
        sendDurationMs,

        lastResponseAt: lastResponseISO,
        totalDurationMs,

        firstErrorAt: firstErrorAt !== null ? new Date(Date.now() - (lastResponseMs - firstErrorAt)).toISOString() : null,
        timeToFirstErrorMs,

        totalRequests: concurrency,
        errors,
        timeouts,
        successes,
    };

    const timestamp = sendStartISO.replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
    const reportDir = path.resolve(__dirname, '../reports');
    fs.mkdirSync(reportDir, { recursive: true });

    const jsonPath = path.join(reportDir, `report-${timestamp}.json`);
    const txtPath = path.join(reportDir, `report-${timestamp}.txt`);

    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    const txt = [
        `Plain Flags States Service — Stress Test Report`,
        `================================================`,
        ``,
        `Date             : ${sendStartISO}`,
        `States URL       : ${statesUrl}`,
        ``,
        `Concurrency      : ${concurrency} simultaneous SDK requests`,
        `Flags in dataset : ${flagNames.length}`,
        ``,
        `--- Timing ---`,
        `Send start       : ${sendStartISO}`,
        `Send end         : ${sendEndISO}`,
        `Send duration    : ${sendDurationMs} ms  (time to dispatch all init() calls)`,
        ``,
        `Last response    : ${lastResponseISO}`,
        `Total duration   : ${totalDurationMs} ms  (start → last response)`,
        ``,
        `First error at   : ${report.firstErrorAt ?? 'none'}`,
        `Time to 1st error: ${timeToFirstErrorMs !== null ? timeToFirstErrorMs + ' ms' : 'n/a'}`,
        ``,
        `--- Results ---`,
        `Total requests   : ${concurrency}`,
        `Successes        : ${successes}`,
        `Errors (flag off): ${errors}`,
        `Timeouts/throws  : ${timeouts}`,
        ``,
        `Success rate     : ${((successes / concurrency) * 100).toFixed(1)}%`,
    ].join('\n');

    fs.writeFileSync(txtPath, txt);

    console.log('\n' + txt + '\n');
    console.log(`Reports written:`);
    console.log(`  ${txtPath}`);
    console.log(`  ${jsonPath}`);

    return { txtPath, jsonPath };
}

main()
    .then(async ({ txtPath }) => {
        // DB cleanup is handled by stress.sh after the user sees results
        // (the shell script opens the report and waits before calling clear-data)
        await closePool();

        // Signal the path so stress.sh can open it
        console.log(`__REPORT_PATH__:${txtPath}`);
    })
    .catch(async err => {
        console.error('Stress test failed:', err);
        await closePool();
        process.exit(1);
    });
