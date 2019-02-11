class AppState {
	constructor() {
		let stored_event = localStorage.getItem('current_event');

		this.default_event = !stored_event;
		this.current_event = ko.observable(new EventCode(JSON.parse(stored_event) || undefined));
		this.current_event.subscribe((event) => {
			this.default_event = false;
			localStorage.setItem('current_event', ko.toJSON(event))
		});
	}
}