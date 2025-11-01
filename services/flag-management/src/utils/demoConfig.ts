/**
 * For demo I only run one instance, so I hardcode and redeploy.
 *
 * This is irrelevant for production Plain Flags instances.
 */
export default class DemoConfig {
    // Above this demo user count, delete any older than deleteOlderThanHours
    static readonly deleteUserCountThreshold = 5000

    // Above this demo user count, delete the oldest so only keepCount remain
    static readonly forceDeleteUserCountThreshold = 6000
    static readonly keepUsersCount = 3000
    static readonly deleteOlderThanHours = 48

    static readonly deleteFlagCountThreshold = 2048
    static readonly keepFlagsCount = 1024

    static readonly deleteConstraintCountThreshold = 2048
    static readonly keepConstraintsCount = 1024

    static readonly deleteHistoryCountThreshold = 4096
    static readonly keepHistoryCount = 2048
}
