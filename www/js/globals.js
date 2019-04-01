class AppState {
	constructor() {
		this.event_signup = new EventSignup();

		let stored_events = JSON.parse(localStorage.getItem('events') || null);
		let stored_current_event = JSON.parse(localStorage.getItem('current_event') || null);

		if (stored_events) {
			this.events = ko.observableArray(stored_events.map(event => new Event(event)));
		} else {
			this.events = ko.observableArray();
		}

		this.current_event = ko.observable(this.findEvent(stored_current_event) || undefined);
		this.current_event.subscribe((event) => {
			localStorage.setItem('current_event', JSON.stringify({
				event_key: event.event_key(),
				event_year: event.event_year()
			}));
		});

		this.events.subscribe(() => {
			$(document).trigger('persist_events');
		});

		$(document).on('persist_events', () => {
			console.log('saving event info');
			localStorage.setItem('events', ko.toJSON(this.events));
		})

		//this.current_sheet = ko.observable(new Sheet($('.js-scout-sheet'), this.current_event()));
		this.scout = new Scout(this);
		this.sheet_maker = new SheetMaker();

		let stored_strat_sheets = JSON.parse(localStorage.getItem('strategy_sheets') || null) || [];

		this.strategy_sheets = new ko.observableArray(stored_strat_sheets.map(x => MakeStrategySheet(x)));

		this.strategy_sheets.subscribe((sheets) => {
			localStorage.setItem('strategy_sheets', ko.toJSON(sheets));
		});

		this.current_strategy = ko.observable(new StrategySheet());
	}

	setCurrentEvent(event) {
		let existing_event = this.findEvent(ko.toJS(event));

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

	showEventSignup() {
		this.event_signup.showSignup(ko.toJS(this.current_event()));
	}

	scanSheet() {
		cordova.plugins.barcodeScanner.scan(
			result => {
				bootbox.alert("Receiving info: " + result.text, () => {
					this.scout.sheets.push(Sheet.deserializeSheet(result.text));
				});
			},
			error => {
				bootbox.alert("QR Code Scan Failed");
			}
		);
	}

	makeSheet() {
		window.goToPage('make-strategy-sheet');
	}
}