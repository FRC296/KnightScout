class Scout {
	constructor(app_state) {
		this.scout_name = ko.observable();
		this.current_sheet = ko.observable(new Sheet($('.js-scout-sheet'), app_state.current_event()));
		this.sheets = ko.observableArray();

		let self = this;
		this.editSheet = function() {
			self.current_sheet(this);
			window.goToPage('scout-sheet');
		}
	}

	submitSheet() {
		this.sheets.push(this.current_sheet());
		this.current_sheet(new Sheet($('.js-scout-sheet'), window.app_state.current_event()));
		window.goToPage('scout-page');
	}

	deleteSheet() {

	}
}