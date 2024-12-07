import Flag from "../../entities/flag";
import History from "../../entities/history";

export default class Recorder {
    static async recordCreation(user: {id: string, email: string}, flag: Flag) {
        const h = new History()

        h.flagId = flag.id
        h.flagName = flag.name
        h.userId = user.id
        h.userEmail = user.email
        h.what = "create"

        await h.save()
    }

    static async recordArchive(user: {id: string, email: string}, flag: Flag) {
        const h = new History()

        h.flagId = flag.id
        h.flagName = flag.name
        h.userId = user.id
        h.userEmail = user.email
        h.what = "archive"

        await h.save()
    }

    static async recordActivation(user: {id: string, email: string}, flag: Flag) {
        const h = new History()

        h.flagId = flag.id
        h.flagName = flag.name
        h.userId = user.id
        h.userEmail = user.email
        h.what = "turnon"

        await h.save()
    }

    static async recordDeactivation(user: {id: string, email: string}, flag: Flag) {
        const h = new History()

        h.flagId = flag.id
        h.flagName = flag.name
        h.userId = user.id
        h.userEmail = user.email
        h.what = "turnoff"

        await h.save()
    }
}
