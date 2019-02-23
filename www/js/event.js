class EventSignup {
	constructor() {
		this.event = ko.observable(new Event());
		this.$signup_modal = $('.js-event-select-modal');
		this.$signup_form = $('.js-event-select-form', this.$signup_modal);
		ko.applyBindings(this, this.$signup_form[0]);
	}

	showSignup(event) {
		if (event) {
			this.event(new Event(event));
		}
		this.$signup_modal.modal({
			keyboard: false,
			backdrop: 'static'
		});
		return this;
	}

	onSubmit(on_submit) {
		this._on_submit = on_submit;

		return this;
	}

	save() {
		this.$signup_modal.modal('hide')
		window.app_state.setCurrentEvent(this.event());
		if (this._on_submit) {
			this._on_submit();
			this._on_submit = undefined;
		}
	}

}

class Event {
	constructor(event = {}) {
		this.event_key = ko.observable(event.event_key || '');
		this.event_year = ko.observable(event.event_year || 2019);
		this.matches = ko.observableArray();
		this.teams = ko.observableArray();
	}

	equalsEvent(event) {
		return event.event_key === this.event_key() && event.event_year === this.event_year();
	}

	downloadMatches() {
		$.ajax({
			dataType: "json",
			url: `https://frc-api.firstinspires.org/v2.0/${this.event_year()}/schedule/${this.event_key()}?tournamentLevel=Qualification`,
			beforeSend: xhr => {
				xhr.setRequestHeader("Authorization", "Basic " + FRC_AUTH);
			}
		}).done(matches => {
			console.log(matches);
			this.matches(matches.Schedule.map(match => BuildMatch(match)));
		});
	}
}