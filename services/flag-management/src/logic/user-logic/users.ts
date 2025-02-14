import User, { Role } from "../../entities/user";
import * as bcrypt from "bcrypt";

export default class Users {
    static async makeAdminIfNone() {
        const users = await User.find()

        if (users.length) { return }

        const admin = new User()

        admin.email = process.env.SUPERADMIN_EMAIL || "superadmin@default.admin"

        const salt = await bcrypt.genSalt(10)

        admin.password = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || "password", salt)

        console.log(admin.password)

        admin.role = Role.SUPERADMIN

        await User.insert(admin)
    }
}
