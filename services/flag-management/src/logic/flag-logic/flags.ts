import Constraint from "../../entities/constraint";

export default class Flags {
    static checkNoActiveFlagsWithConstraint(constraint: Constraint) {
        if(!constraint.flags) {
            return
        }
        const activeFlags = constraint.flags.filter(f => (f.isOn))

        if(activeFlags.length) {
            throw new Error(`Cannot delete constraint; it's linked to active flags ${
                activeFlags.map(f => f.name)
            }. Unlink first`)
        }
    }
}