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

        const dt: DateTime = DateTime.fromJSDate(d)

        return dt.plus({ days: offsetDays }).toJSDate()
    }

    daysDifference(date1: Date, date2: Date): number {
        const d1 = DateTime.fromJSDate(date1)
        const d2 = DateTime.fromJSDate(date2)

        const diff = d1.diff(d2, ["days"])

        const days = diff.days

        return diff.days
    }
}
