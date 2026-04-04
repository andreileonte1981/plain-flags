/**
 * seed-data.ts
 *
 * Creates the stress test dataset by calling the management service's API:
 *   - 2 constraints (user: John,Steve  and  brand: Initech,Acme)
 *   - 100 feature flags, each linked to both constraints, all turned on
 *
 * After seeding, fetches the flag list and verifies every seeded flag
 * for correctness before the stress test runs.
 *
 * Flag names are written to dist/seed-flag-names.json for use by stress-test.ts.
 */

import * as fs from 'fs';
import * as path from 'path';

import { ManagementApiClient, Flag } from './management-client';

const N_FLAGS = 100;
const SEED_FLAG_NAMES_FILE = path.resolve(__dirname, '../dist/seed-flag-names.json');

export async function seedData(): Promise<string[]> {
    const managementUrl = process.env.MANAGEMENT_SERVICE_URL || '';
    if (!managementUrl) {
        throw new Error('MANAGEMENT_SERVICE_URL is not set in .env');
    }

    const client = new ManagementApiClient(managementUrl);
    await client.init();

    console.log('Seeding stress test data via management API...');

    // ── Constraints ──────────────────────────────────────────────────────────
    console.log('  Creating constraints...');
    const userConstraint = await client.createConstraint(
        'stress-user-constraint', 'user', 'John, Steve'
    );
    const brandConstraint = await client.createConstraint(
        'stress-brand-constraint', 'brand', 'Initech, Acme'
    );
    console.log(`  Constraints: ${userConstraint.id.substring(0, 8)}… ${brandConstraint.id.substring(0, 8)}…`);

    // ── Flags ─────────────────────────────────────────────────────────────────
    console.log(`  Creating ${N_FLAGS} flags...`);
    const flagNames: string[] = [];
    const createRequests: Promise<Flag>[] = [];

    for (let i = 1; i <= N_FLAGS; i++) {
        const name = `stress-flag-${String(i).padStart(3, '0')}`;
        flagNames.push(name);
        createRequests.push(client.createFlag(name));
    }

    const createdFlags = await Promise.all(createRequests);
    console.log(`  Created ${createdFlags.length} flags`);

    // ── Link constraints ──────────────────────────────────────────────────────
    console.log('  Linking constraints to flags (sequential)...');
    let linkCount = 0;
    for (const flag of createdFlags) {
        await client.linkConstraint(flag.id, userConstraint.id);
        await client.linkConstraint(flag.id, brandConstraint.id);
        linkCount += 2;
    }
    console.log(`  Linked ${linkCount} constraint-flag pairs`);

    // ── Turn flags on ─────────────────────────────────────────────────────────
    console.log('  Turning all flags on...');
    const turnOnRequests: Promise<void>[] = createdFlags.map(f => client.turnOnFlag(f.id));
    await Promise.all(turnOnRequests);
    console.log(`  All flags turned on`);

    // ── Verification ──────────────────────────────────────────────────────────
    console.log('  Verifying all seeded flags...');
    const allFlags = await client.listFlags();
    const seededFlags = allFlags.filter(f => f.name.startsWith('stress-flag-'));

    if (seededFlags.length !== N_FLAGS) {
        throw new Error(`Verification failed: expected ${N_FLAGS} stress flags in list, got ${seededFlags.length}`);
    }

    for (const flag of seededFlags) {
        if (!flag.isOn) {
            throw new Error(`Verification failed: flag '${flag.name}' is not on`);
        }
        const constraints = flag.constraints ?? [];
        if (constraints.length !== 2) {
            throw new Error(`Verification failed: flag '${flag.name}' has ${constraints.length} constraints, expected 2`);
        }
        const keys = constraints.map(c => c.key).sort();
        if (keys[0] !== 'brand' || keys[1] !== 'user') {
            throw new Error(`Verification failed: flag '${flag.name}' has unexpected constraint keys: ${keys.join(', ')}`);
        }
    }

    console.log(`  All ${N_FLAGS} flags verified (isOn=true, 2 constraints each)`);

    // ── Persist flag names ────────────────────────────────────────────────────
    fs.mkdirSync(path.dirname(SEED_FLAG_NAMES_FILE), { recursive: true });
    fs.writeFileSync(SEED_FLAG_NAMES_FILE, JSON.stringify(flagNames, null, 2));
    console.log(`  Flag names written to ${SEED_FLAG_NAMES_FILE}`);

    console.log('Seeding complete.');
    return flagNames;
}

export { SEED_FLAG_NAMES_FILE };

// Run directly
seedData()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Failed to seed data:', err?.response?.data ?? err);
        process.exit(1);
    });

