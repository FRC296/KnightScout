class Scout {
	constructor(app_state) {
		let stored_scout = JSON.parse(localStorage.getItem('scout_2') || null);

		this.scout_name = ko.observable(stored_scout && stored_scout.scout_name || '');
		this.current_sheet = ko.observable(new Sheet(ko.toJS(app_state.current_event)));
		this.sheets = ko.observableArray(((stored_scout && stored_scout.sheets) || []).map(sheet => new Sheet(sheet)));
		this.team_stats = ko.observableArray();
		this.current_stat = ko.observable(new TeamStatistics());

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
			try {
				localStorage.setItem('scout_2', ko.toJSON(this));
			} catch(e) {
				bootbox.alert("Could not save scouting sheets. Try deleting old scouting sheets to make more room.");
			}
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

	newSheet(force, match_info) {
		if (this.current_sheet().submitted() || force) {
			let event_info = ko.toJS(window.app_state.current_event);
			let sheet_info = $.extend({}, event_info, match_info);
			this.current_sheet(new Sheet(sheet_info));
		}
		$(document).trigger('persist_scout');
	}
	clearSheet() {
		this.newSheet(true);
	}

	calculateAllTeamStatistics() {
		let team_sheets = this.sheets().reduce((acc, sheet) => {
			if (!sheet.team_number()) {
				return acc;
			}

			acc[sheet.team_number()] ? acc[sheet.team_number()].push(sheet) : acc[sheet.team_number()] = [sheet];
			return acc;
		}, {});

		let stats = [];
		for (let team in team_sheets) {
			stats.push(this.calculateTeamStatistics(team, team_sheets[team]));
		}

		this.team_stats(stats);

		return stats;
	}

	calculateTeamStatistics(team, sheets) {
		let team_results = sheets.reduce((acc, sheet) => {

			let starts_with = parseInt(sheet.starts_with());
			switch (starts_with) {
				case 0:
					++acc.starts_nothing;
					break;
				case 1:
					++acc.starts_particle;
					break;
			}
			if (!isNaN(starts_with)) {
				++acc.starts_count;
			}

			let auton_bonus = parseInt(sheet.auton_bonus());
			switch(auton_bonus) {
				case 0:
					++acc.auton_bonus_no_move;
					break;
				case 1:
					++acc.auton_bonus_no_score;
					break;
				case 2:
					++acc.auton_score_1;
					break;
				case 3:
					++acc.auton_score_2;
					break;
				case 4:
					++acc.auton_score_3;
					break;
			}
			if (!isNaN(auton_bonus)) {
				++acc.auton_bonus_count;
			}

			let auton_mobility = parseInt(sheet.auton_mobility());
			if (!isNaN(auton_mobility)) {
				acc.auton_mobility_score += auton_mobility;
				++acc.auton_mobility_count;
			}

			acc.avg_defense_counts += parseInt(sheet.defense_count()) || 0;

			let robot_speed = parseInt(sheet.robot_speed());
			if (!isNaN(robot_speed)) {
				acc.robot_speed_score += robot_speed;
				++acc.robot_speed_count;
			}

			let actions = sheet.action_menu.actions();

			actions.forEach(action => {
				//let action_name = action.action_name();
				//let game_piece = action.game_piece();
				let location = action.location();

				//++acc[ACTION_STAT_MAPPING[action_name] + '_' + GAME_PIECE_STAT_MAPPING[game_piece] + '_' + LOCATION_STAT_MAPPING[location]];

				switch (location) {
					case 0:
						++acc.score_1;
						break;
					case 1:
						++acc.score_2;
						break;
					case 2:
						++acc.score_3;
						break;
				}

				return acc;
			});
			return acc;
		}, {
			starts_particle: 0,
			starts_nothing: 0,
			starts_count: 0,

			auton_bonus_no_move: 0,
			auton_bonus_no_score: 0,
			auton_score_1: 0,
			auton_score_2: 0,
			auton_score_3: 0,
			auton_bonus_count: 0,

			auton_mobility_score: 0,
			auton_mobility_count: 0,

			avg_defense_counts: 0,

			score_1: 0,
			score_2: 0,
			score_3: 0,

			robot_speed_score: 0,
			robot_speed_count: 0
		});

		return new TeamStatistics({
			team_number: team,
			matches_scouted: sheets.length,

			starts_nothing: team_results.starts_count ? team_results.starts_nothing / team_results.starts_count : '',
			starts_particle: team_results.starts_count ? team_results.starts_particle / team_results.starts_count : '',

			auton_bonus_no_move: team_results.auton_bonus_count ? team_results.auton_bonus_no_move / team_results.auton_bonus_count : '',
			auton_bonus_no_score: team_results.auton_bonus_count ? team_results.auton_bonus_no_score / team_results.auton_bonus_count : '',
			auton_score_1: team_results.auton_bonus_count ? team_results.auton_score_1 / team_results.auton_bonus_count : '',
			auton_score_2: team_results.auton_bonus_count ? team_results.auton_score_2 / team_results.auton_bonus_count : '',
			auton_score_3: team_results.auton_bonus_count ? team_results.auton_score_3 / team_results.auton_bonus_count : '',

			auton_mobility_score: team_results.auton_mobility_count ? team_results.auton_mobility_score / team_results.auton_mobility_count : '',

			avg_defense_counts: team_results.avg_defense_counts / sheets.length,

			score_1: team_results.score_1 / sheets.length,
			score_2: team_results.score_2 / sheets.length,
			score_3: team_results.score_3 / sheets.length,

			robot_speed_score: team_results.robot_speed_count ? team_results.robot_speed_score / team_results.robot_speed_count : '',
		});
	}
}