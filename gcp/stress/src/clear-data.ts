/**
 * clear-data.ts
 *
 * Deletes ALL rows from the flags, constraints, join table, and history tables
 * using raw SQL.  Intended for stress test setup/teardown only.
 *
 * Tables (TypeORM SnakeNamingStrategy):
 *   flags_constraints_constraints  — join table (must be cleared first)
 *   history
 *   flags
 *   constraints
 */

import { getPool, closePool } from './db';

export async function clearData(): Promise<void> {
    const db = await getPool();

    console.log('Clearing stress test data from database...');

    // Join table first to avoid FK violations
    const joinResult = await db.query('DELETE FROM flags_constraints_constraints');
    console.log(`  Deleted ${joinResult.rowCount} rows from flags_constraints_constraints`);

    const historyResult = await db.query('DELETE FROM history');
    console.log(`  Deleted ${historyResult.rowCount} rows from history`);

    const flagsResult = await db.query('DELETE FROM flags');
    console.log(`  Deleted ${flagsResult.rowCount} rows from flags`);

    const constraintsResult = await db.query('DELETE FROM constraints');
    console.log(`  Deleted ${constraintsResult.rowCount} rows from constraints`);

    console.log('Done.');
}

// Run directly
clearData()
    .then(() => closePool())
    .catch(err => {
        console.error('Failed to clear data:', err);
        closePool().finally(() => process.exit(1));
    });
