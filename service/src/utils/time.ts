import { DateTime } from "luxon"

export class TestableTime {
    now(): Date {
        let d = new Date()

        if(process.env.NODE_ENV === "production") {
            return d
        }

        // In debug mode, pretend the time is in the future.
        const offsetDays = +(process.env.OFFSET_DAYS || "0")

        let dt: DateTime = DateTime.fromJSDate(d)

        dt.plus({days: offsetDays})

        return dt.toJSDate()
    }
}
