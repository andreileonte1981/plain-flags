import Constraint from "../../entities/Constraint";
import Flag from "../../entities/Flag";
import History from "../../entities/History";

export default class Recorder {
    static recordCreation(user: { id: string; email: string }, flag: Flag): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "create";
        return h;
    }

    static recordArchive(user: { id: string; email: string }, flag: Flag): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "archive";
        return h;
    }

    static recordActivation(user: { id: string; email: string }, flag: Flag): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "turnon";
        return h;
    }

    static recordDeactivation(user: { id: string; email: string }, flag: Flag): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "turnoff";
        return h;
    }

    static recordLink(user: { id: string; email: string }, flag: Flag, constraint: Constraint): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "link";
        h.constraintId = constraint.id;
        h.constraintInfo = `${constraint.description}|${constraint.key}|${constraint.values.join(",")}`;
        return h;
    }

    static recordUnlink(user: { id: string; email: string }, flag: Flag, constraint: Constraint): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "unlink";
        h.constraintId = constraint.id;
        h.constraintInfo = `${constraint.description}|${constraint.key}|${constraint.values.join(",")}`;
        return h;
    }

    static recordConstraintEdit(
        user: { id: string; email: string },
        flag: Flag,
        constraint: Constraint,
        oldValues: string[],
    ): History {
        const h = new History();
        h.flagId = flag.id;
        h.flagName = flag.name;
        h.userId = user.id;
        h.userEmail = user.email;
        h.what = "cvedit";
        h.constraintId = constraint.id;
        h.constraintInfo = `${constraint.description}|${constraint.key}|${oldValues.join(",")}>${constraint.values.join(",")}`;
        return h;
    }
}
