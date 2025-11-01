/**
 * For demo I only run one instance, so I hardcode and redeploy.
 *
 * This is irrelevant for production Plain Flags instances.
 */
export default class DemoConfig {
    // Above this demo user count, delete any older than deleteOlderThanHours
    static readonly deleteUserCountThreshold = 50

    // Above this demo user count, delete the oldest so only keepCount remain
    static readonly forceDeleteUserCountThreshold = 60
    static readonly keepUsersCount = 30
    static readonly deleteOlderThanHours = 48

    static readonly deleteFlagCountThreshold = 30
    static readonly keepFlagsCount = 20

    static readonly deleteConstraintCountThreshold = 300
    static readonly keepConstraintsCount = 200

    static readonly deleteHistoryCountThreshold = 150
    static readonly keepHistoryCount = 100
}
