import * as uuid from "uuid"

export default class Salt {
    public static uniqued(s: string, saltLength: number = 12): string {
        return `${s}_${uuid.v4().replace(/-/g, "").slice(0, saltLength)}`
    }
}
