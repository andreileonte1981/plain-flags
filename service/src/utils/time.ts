import { DateTime } from "luxon"
import Settings from "../entities/settings"

export class TestableTime {
    async now(): Promise<Date> {
        let d = new Date()

        if (process.env.NODE_ENV === "production") {
            return d
        }

        // In debug mode, pretend the time is in the future.
        const offsetDays = (await Settings.find())[0]?.offsetDays || 0

        let dt: DateTime = DateTime.fromJSDate(d)

        return dt.plus({ days: offsetDays }).toJSDate()
    }
}
