class Scout {
	constructor(app_state) {
		let stored_scout = JSON.parse(localStorage.getItem('scout') || null);

		this.scout_name = ko.observable(stored_scout && stored_scout.scout_name || '');
		this.current_sheet = ko.observable(new Sheet(ko.toJS(app_state.current_event)));
		this.sheets = ko.observableArray(((stored_scout && stored_scout.sheets) || []).map(sheet => new Sheet(sheet)));

		let self = this;
		this.editSheet = function() {
			self.current_sheet(this);
			window.goToPage('scout-sheet');
		}

		this.deleteSheet = function() {
			bootbox.confirm({
				message: "Are you sure you want to delete this sheet?",
				backdrop: true,
				buttons: {
					confirm: {
						label: 'Yes',
						className: 'btn-danger'
					},
					cancel: {
						label: 'No',
						className: 'btn-primary'
					}
				},
				callback: (result) => {
					if (result) {
						self.sheets.remove(this);
					}
				}
			});
		}

		this.scout_name.subscribe(() => {
			$(document).trigger('persist_scout');
		});

		this.sheets.subscribe(() => {
			$(document).trigger('persist_scout');
		});

		$(document).on('persist_scout', () => {
			localStorage.setItem('scout', ko.toJSON(this));
		});
	}

	scoutMatch() {
		this.newSheet();
		window.goToPage('scout-sheet');
	}

	submitSheet() {
		if (this.sheets.indexOf(this.current_sheet()) < 0) {
			this.sheets.push(this.current_sheet());
		}
		this.current_sheet().submitted(true);
		this.newSheet();
		window.goToPage('scout-page');
	}

	newSheet() {
		if (this.current_sheet().submitted()) {
			this.current_sheet(new Sheet(ko.toJS(window.app_state.current_event)));
		}
		$(document).trigger('persist_scout');
	}
}