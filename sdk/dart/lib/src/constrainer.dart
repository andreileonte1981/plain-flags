import 'constraint.dart';
import 'flag_state.dart';

class Constrainer {
  static bool isTurnedOn(FlagState flag, Map<String, String>? context) {
    if (!flag.isOn) {
      return false;
    }

    if (context == null || context.isEmpty) {
      return true;
    }

    if (flag.constraints.isEmpty) {
      return true;
    }

    for (String contextKey in context.keys) {
      String? contextValue = context[contextKey];

      for (Constraint constraint in flag.constraints) {
        if (constraint.key == contextKey) {
          bool match = false;

          for (String constraintValue in constraint.values) {
            if (constraintValue == contextValue) {
              match = true;
              break;
            }
          }

          if (!match) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
