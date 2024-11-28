import Flag from "../../entities/flags/flag";
import History from "../../entities/history/history";

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

    static async recordArchive(flag: Flag) {

    }

    static async recordActivation(flag: Flag) {

    }

    static async recordDeactivation(flag: Flag) {

    }
}
