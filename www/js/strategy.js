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

	testSerialization() {
		console.log('red1', ko.toJS(this.blue2));
		var red_stream = this.blue2().serializeStats();
		console.log('red1 stream', red_stream);
		var red_info = TeamStatistics.deserializeSheet(red_stream);
		console.log('red1 info', red_info);
	}

	serializeStrategy() {
		let data = [
			this.match_number().toString().padStart(4, '0'),
			this.red1().serializeStats(),
			this.red2().serializeStats(),
			this.red3().serializeStats(),
			this.blue1().serializeStats(),
			this.blue2().serializeStats(),
			this.blue3().serializeStats()
		];

		return data.join('*');
	}

	static deserializeSheet(stream) {
		let parts = stream.split('*');

		return new StrategySheet({
			match_number: parseInt(parts[0]),
			red1: TeamStatistics.deserializeSheet(parts[1]),
			red2: TeamStatistics.deserializeSheet(parts[2]),
			red3: TeamStatistics.deserializeSheet(parts[3]),
			blue1: TeamStatistics.deserializeSheet(parts[4]),
			blue2: TeamStatistics.deserializeSheet(parts[5]),
			blue3: TeamStatistics.deserializeSheet(parts[6])
		});
	}

	createQRcode() {
		console.log('Creating QR code');

		let $qr_code = $('.js-qr-code');
		let $modal = $('#qr_code_display');

		console.log('Serialize Sheet!');

		let data = {};

		try {
			data = this.serializeStrategy();
		} catch(error) {
			bootbox.alert('Serialization Failed. Error:' + JSON.stringify(error));
			console.log('Serialization Failed', JSON.stringify(error));
			return;
		}

		console.log('QR encoding:', data);
		console.log('Length', data.length);

		$qr_code.empty();

		if (data.length > 1273) {
			bootbox.alert('Strategy Sheet too big!');
			return;
		}

		let modal_width = (parseInt($('.modal-lg', $modal).css('max-width').replace('px', '')) || 1140);
		let best_height = Math.min(window.innerHeight * 0.8, window.innerWidth * 0.8, modal_width * 0.9);

		try {
			let qrcode = new QRCode($qr_code[0], {
				text: data,
				width: best_height,
				height: best_height,
				colorDark : "#000000",
				colorLight : "#ffffff",
				correctLevel : QRCode.CorrectLevel.H
			});
	
			$modal.modal();
		} catch (error) {
			console.log('QR Code error', error);
			bootbox.alert('Failed to generate QR code. Error: ' + JSON.stringify(error));
		}

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