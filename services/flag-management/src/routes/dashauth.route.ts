import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Config from "../utils/config";
import Salt from "../utils/salt";
import User, { Role } from "../entities/user";
import * as bcrypt from "bcrypt";
import cleanString from "../utils/profanity";
import Users from "../logic/user-logic/users";

export async function dashauthRoutes(server: FastifyInstance) {
    server.post("", async (
        request: FastifyRequest<{ Body: { passkey: string } }>,
        reply: FastifyReply) => {
        if (request.body.passkey === Config.defaultDashboardPasskey) {
            return { success: true }
        } else {
            throw new Error("Auth error")
        }
    })

    server.post("/demo", async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {
        const body = request.body as any;

        const cleanName = cleanString(body.name)
        // Keep just letters and numbers
        let name = (cleanName.trim() || "Anonymous").replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)

        if (name.length < 3) {
            name = `Anon_${name}`
        }

        const saltedName = Salt.uniqued(name);
        const tempPassword = Math.random().toString(36).slice(-8)

        const demoUser = new User()
        demoUser.email = `${saltedName}@plainflags.demo`

        const salt = await bcrypt.genSalt(10)
        demoUser.password = await bcrypt.hash(tempPassword, salt)

        demoUser.role = Role.DEMO

        await User.insert(demoUser)

        const user = await User.findOneByOrFail({ email: demoUser.email })

        const token = server.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        })

        // await when running tests, otherwise fire and forget
        Users.deleteExcessDemoUsers(server.log)

        reply.code(201).send({
            token, user: {
                email: user.email, role: user.role, tempPassword
            }
        })
    })
}
