import 'package:event_bus/event_bus.dart';

class Event {
  final String name;

  Event({this.name = ''});
}

class Events {
  static final eventBus = EventBus();

  static void fire(Event event) {
    eventBus.fire(event);
  }

  static void register(void Function(Event) onEvent) {
    eventBus.on<Event>().listen(onEvent);
  }
}
