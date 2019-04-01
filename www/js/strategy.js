class StrategySheet {
	constructor(sheet = {}) {
		this.match_number = ko.observable(sheet.match_number);
		this.red1 = ko.observable(sheet.red1 || new TeamStatistics());
		this.red2 = ko.observable(sheet.red2 || new TeamStatistics());
		this.red3 = ko.observable(sheet.red3 || new TeamStatistics());
		this.blue1 = ko.observable(sheet.blue1 || new TeamStatistics());
		this.blue2 = ko.observable(sheet.blue2 || new TeamStatistics());
		this.blue3 = ko.observable(sheet.blue3 || new TeamStatistics());

		this.match_number.teams = ko.computed(() => [
			{alliance: 'red', team: this.red1},
			{alliance: 'red', team: this.red2},
			{alliance: 'red', team: this.red3},
			{alliance: 'blue', team: this.blue1},
			{alliance: 'blue', team: this.blue2},
			{alliance: 'blue', team: this.blue3}
		], this);
	}

	view(sheet) {
		app_state.scout.current_stat(sheet());
		window.goToPage('team-profile-page');
	}

	see() {
		app_state.current_strategy(this);
		window.goToPage('current-strategy');
	}
}

function MakeStrategySheet(js_sheet = {}) {
	return new StrategySheet({
		match_number: js_sheet.match_number,
		red1: new TeamStatistics(js_sheet.red1),
		red2: new TeamStatistics(js_sheet.red2),
		red3: new TeamStatistics(js_sheet.red3),
		blue1: new TeamStatistics(js_sheet.blue1),
		blue2: new TeamStatistics(js_sheet.blue2),
		blue3: new TeamStatistics(js_sheet.blue3),
	});
}

class SheetMaker {
	constructor(match = {}) {
		this.match_number = ko.observable(match.match_number);
		this.red1 = ko.observable(match.red1);
		this.red2 = ko.observable(match.red2);
		this.red3 = ko.observable(match.red3);
		this.blue1 = ko.observable(match.blue1);
		this.blue2 = ko.observable(match.blue2);
		this.blue3 = ko.observable(match.blue3);
	}

	buildSheet() {
		app_state.scout.calculateAllTeamStatistics();
		let sheet = new StrategySheet({
			match_number: this.match_number(),
			red1: this.findTeam(this.red1()),
			red2: this.findTeam(this.red2()),
			red3: this.findTeam(this.red3()),
			blue1: this.findTeam(this.blue1()),
			blue2: this.findTeam(this.blue2()),
			blue3: this.findTeam(this.blue3())
		});
		app_state.strategy_sheets.push(sheet);
		return sheet;
	}

	makeSheet() {
		let sheet = this.buildSheet();
		app_state.current_strategy(sheet);
		window.goToPage('current-strategy');
	}

	findTeam(team_number) {
		return app_state.scout.team_stats().find(x => x.team_number() == team_number);
	}
}