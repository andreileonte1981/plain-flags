import { FastifyBaseLogger } from "fastify";
import Constraint from "../../entities/constraint";
import Flag from "../../entities/flag";
import History from "../../entities/history";
import DemoConfig from "../../utils/demoConfig";

export default class Flags {
    static checkNoActiveFlagsWithConstraint(constraint: Constraint) {
        if (!constraint.flags) {
            return
        }
        const activeFlags = constraint.flags.filter(f => (f.isOn))

        if (activeFlags.length) {
            throw new Error(`Cannot delete constraint; it's linked to active flags ${activeFlags.map(f => f.name)
                }. Unlink first`)
        }
    }

    static async deleteExcessFlagsAndConstraints(log: FastifyBaseLogger) {
        if (process.env.DEMO_MODE !== "true") {
            return
        }

        const flagCount = await Flag.count()

        if (flagCount >= DemoConfig.deleteFlagCountThreshold) {
            const flagsToDelete = await Flag.createQueryBuilder("flag")
                .orderBy("flag.createdAt", "ASC")
                .limit(flagCount - DemoConfig.keepFlagsCount)
                .getMany()

            log.info(`Deleting ${flagsToDelete.length} excess flags`)

            for (const flag of flagsToDelete) {
                flag.unlinkAllConstraints()
            }

            await Flag.save(flagsToDelete) // Save first to update the join table

            await Flag.remove(flagsToDelete)
        }

        const constraintCount = await Constraint.count()

        if (constraintCount >= DemoConfig.deleteConstraintCountThreshold) {
            const constraintsToDelete = await Constraint.createQueryBuilder("constraint")
                .orderBy("constraint.createdAt", "ASC")
                .limit(constraintCount - DemoConfig.keepConstraintsCount)
                .getMany()

            log.info(`Deleting ${constraintsToDelete.length} excess constraints`)

            for (const constraint of constraintsToDelete) {
                constraint.unlinkAllFlags()
            }

            await Constraint.save(constraintsToDelete) // Save first to update the join table

            await Constraint.remove(constraintsToDelete)
        }

        const historyCount = await History.count()

        if (historyCount >= DemoConfig.deleteHistoryCountThreshold) {
            const historiesToDelete = await History.createQueryBuilder("history")
                .orderBy("history.when", "ASC")
                .limit(historyCount - DemoConfig.keepHistoryCount)
                .getMany()

            log.info(`Deleting ${historiesToDelete.length} excess history records`)

            await History.remove(historiesToDelete)
        }
    }
}
