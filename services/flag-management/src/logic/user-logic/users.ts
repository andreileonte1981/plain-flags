import User, { Role } from "../../entities/user";
import * as bcrypt from "bcrypt";
import Config from "../../utils/config";
import DemoConfig from "../../utils/demoConfig";
import { FastifyBaseLogger } from "fastify";

export default class Users {
    static async makeAdminIfNone() {
        const users = await User.find()

        if (users.length) { return }

        const admin = new User()

        admin.email = process.env.SUPERADMIN_EMAIL || "superadmin@default.admin"

        const salt = await bcrypt.genSalt(10)

        admin.password = await bcrypt.hash(Config.superAdminPassword, salt)

        admin.role = Role.SUPERADMIN

        await User.insert(admin)
    }

    static async deleteExcessDemoUsers(log: FastifyBaseLogger) {
        if (process.env.DEMO_MODE !== "true") {
            return
        }

        const demoUserCount = await User.countBy({ role: Role.DEMO })

        if (demoUserCount >= DemoConfig.forceDeleteUserCountThreshold) {
            const usersToDelete = await User.createQueryBuilder("user")
                .where("user.role = :role", { role: Role.DEMO })
                .orderBy("user.createdAt", "ASC")
                .limit(demoUserCount - DemoConfig.keepUsersCount)
                .getMany()

            log.info(`Deleting ${usersToDelete.length} excess demo users`)

            await User.remove(usersToDelete)
        }

        const remainingDemoUserCount = await User.countBy({ role: Role.DEMO })
        if (remainingDemoUserCount >= DemoConfig.deleteUserCountThreshold) {
            const cutoffDate = new Date(Date.now() - DemoConfig.deleteOlderThanHours * 60 * 60 * 1000)

            const usersToDelete = await User.createQueryBuilder("user")
                .where("user.role = :role", { role: Role.DEMO })
                .andWhere("user.createdAt < :cutoffDate", { cutoffDate })
                .getMany()

            if (usersToDelete.length > 0) {
                log.info(`Deleting ${usersToDelete.length} old demo users`)

                await User.remove(usersToDelete)
            }
        }
    }
}
