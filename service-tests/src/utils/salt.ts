import * as uuid from "uuid"

export default class Salt {
    public static uniqued(s: string) {
        return `${s}_${uuid.v4().replace(/-/g, "")}`
    }
}
