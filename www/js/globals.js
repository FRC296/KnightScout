class AppState {
	constructor() {
		let stored_events = JSON.parse(localStorage.getItem('events') || null);
		let stored_current_event = JSON.parse(localStorage.getItem('current_event') || null);

		this.default_event = !stored_current_event;

		if (stored_events) {
			this.events = ko.observableArray(stored_events.map(event => new Event(event)));
		} else {
			this.events = ko.observableArray();
		}

		this.current_event = ko.observable(new Event(ko.toJS(this.findEvent(stored_current_event)) || undefined));
		this.current_event.subscribe((event) => {
			this.default_event = false;
			localStorage.setItem('current_event', JSON.stringify({
				event_key: event.event_key(),
				event_year: event.event_year()
			}));
		});

		this.events.subscribe(events => {
			localStorage.setItem('events', ko.toJSON(events));
		});
	}

	setCurrentEvent(event) {
		let existing_event = this.findEvent(event);

		if (existing_event) {
			this.current_event(existing_event);
			return existing_event;
		}

		this.events.push(event);
		this.current_event(event);
		return event;
	}

	findEvent(event) {
		return this.events().find(stored_event => stored_event.equalsEvent(event))
	}
}