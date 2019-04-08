class Scout {
	constructor(app_state) {
		let stored_scout = JSON.parse(localStorage.getItem('scout') || null);

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
				localStorage.setItem('scout', ko.toJSON(this));
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
					++acc.starts_cargo;
					break;
				case 1:
					++acc.starts_hatch;
					break;
				case 2:
					++acc.starts_nothing;
					break;
			}
			if (!isNaN(starts_with)) {
				++acc.starts_count;
			}

			let auton_bonus = parseInt(sheet.auton_bonus());
			if (!isNaN(auton_bonus)) {
				acc.auton_bonus_score += auton_bonus;
				++acc.auton_bonus_count;
			}

			let auton_mobility = parseInt(sheet.auton_mobility());
			if (!isNaN(auton_mobility)) {
				acc.auton_mobility_score += auton_mobility;
				++acc.auton_mobility_count;
			}

			acc.avg_defense_counts += parseInt(sheet.defense_count()) || 0;

			let end_score = parseInt(sheet.end_platform());
			switch (end_score) {
				case 0:
					++acc.end_fail;
					break;
				case 1:
				case 2:
				case 3:
					++acc['end_lvl' + end_score];
					break;
				case 4:
					++acc.end_climb;
					break;
			}
			if (!isNaN(end_score)) {
				++acc.end_count;
			}

			let climb_score = parseInt(sheet.climb_speed());
			if (!isNaN(climb_score)) {
				acc.climb_speed_score += climb_score;
				++acc.climb_count;
			}

			acc.carry_score += ~~sheet.carried();

			let robot_speed = parseInt(sheet.robot_speed());
			if (!isNaN(robot_speed)) {
				acc.robot_speed_score += robot_speed;
				++acc.robot_speed_count;
			}

			let actions = sheet.action_menu.actions();

			let action_results = actions.reduce((acc, action) => {
				let action_name = action.action_name();
				let game_piece = action.game_piece();
				let location = action.location();

				++acc[ACTION_STAT_MAPPING[action_name] + '_' + GAME_PIECE_STAT_MAPPING[game_piece] + '_' + LOCATION_STAT_MAPPING[location]];

				/*if (action_name === 'drop') {
					if (game_piece == 'hatch') {
						++acc['drop_hatch_total'];
					} else if (game_piece == 'cargo') {
						++acc['drop_cargo_total'];
					}
				}*/

				return acc;
			}, {
				pickup_hatch_ground: 0,
				pickup_hatch_loading: 0,
				pickup_cargo_ground: 0,
				pickup_cargo_loading: 0,
				drop_hatch_ship: 0,
				drop_hatch_r1: 0,
				drop_hatch_r2: 0,
				drop_hatch_r3: 0,
				drop_cargo_ship: 0,
				drop_cargo_r1: 0,
				drop_cargo_r2: 0,
				drop_cargo_r3: 0,
				//drop_cargo_total: 0,
				//drop_hatch_total: 0
			});

			let hatch_total = action_results.pickup_hatch_ground + action_results.pickup_hatch_loading;
			let cargo_total = action_results.pickup_cargo_ground + action_results.pickup_cargo_loading;

			acc.pickup_hatch_total += hatch_total;
			acc.pickup_cargo_total += cargo_total;

			acc.drop_hatch_total += action_results.drop_hatch_ship + action_results.drop_hatch_r1 + action_results.drop_hatch_r2 + action_results.drop_hatch_r3;
			acc.drop_cargo_total += action_results.drop_cargo_ship + action_results.drop_cargo_r1 + action_results.drop_cargo_r2 + action_results.drop_cargo_r3;

			if (hatch_total > 0) {
				++acc.pickup_hatch_count;
				acc.pickup_hatch_ground += action_results.pickup_hatch_ground / hatch_total;
				acc.pickup_hatch_loading += action_results.pickup_hatch_loading / hatch_total;
			}

			if (cargo_total > 0) {
				++acc.pickup_cargo_count;
				acc.pickup_cargo_ground += action_results.pickup_cargo_ground / cargo_total;
				acc.pickup_cargo_loading += action_results.pickup_cargo_loading / cargo_total;
			}

			acc.drop_hatch_ship += action_results.drop_hatch_ship;
			acc.drop_hatch_r1 += action_results.drop_hatch_r1;
			acc.drop_hatch_r2 += action_results.drop_hatch_r2;
			acc.drop_hatch_r3 += action_results.drop_hatch_r3;
			acc.drop_cargo_ship += action_results.drop_cargo_ship;
			acc.drop_cargo_r1 += action_results.drop_cargo_r1;
			acc.drop_cargo_r2 += action_results.drop_cargo_r2;
			acc.drop_cargo_r3 += action_results.drop_cargo_r3;

			return acc;
		}, {
			starts_hatch: 0,
			starts_cargo: 0,
			starts_nothing: 0,
			starts_count: 0,
			auton_bonus_score: 0,
			auton_bonus_count: 0,
			auton_mobility_score: 0,
			auton_mobility_count: 0,
			avg_defense_counts: 0,
			end_fail: 0,
			end_lvl1: 0,
			end_lvl2: 0,
			end_lvl3: 0,
			end_climb: 0,
			end_count: 0,
			climb_speed_score: 0,
			climb_count: 0,
			carry_score: 0,
			robot_speed_score: 0,
			robot_speed_count: 0,
			pickup_hatch_total: 0,
			pickup_hatch_count: 0,
			pickup_hatch_ground: 0,
			pickup_hatch_loading: 0,
			pickup_cargo_total: 0,
			pickup_cargo_count: 0,
			pickup_cargo_ground: 0,
			pickup_cargo_loading: 0,
			drop_hatch_ship: 0,
			drop_hatch_r1: 0,
			drop_hatch_r2: 0,
			drop_hatch_r3: 0,
			drop_cargo_ship: 0,
			drop_cargo_r1: 0,
			drop_cargo_r2: 0,
			drop_cargo_r3: 0,
			drop_hatch_total: 0,
			drop_cargo_total: 0
		});

		return new TeamStatistics({
			team_number: team,
			matches_scouted: sheets.length,
			starts_hatch: team_results.starts_count ? team_results.starts_hatch / team_results.starts_count : '',
			starts_cargo: team_results.starts_count ? team_results.starts_cargo / team_results.starts_count : '',
			starts_nothing: team_results.starts_count ? team_results.starts_nothing / team_results.starts_count : '',
			auton_bonus_score: team_results.auton_bonus_count ? team_results.auton_bonus_score / team_results.auton_bonus_count : '',
			auton_mobility_score: team_results.auton_mobility_count ? team_results.auton_mobility_score / team_results.auton_mobility_count : '',
			avg_defense_counts: team_results.avg_defense_counts / sheets.length,
			end_fail: team_results.end_count ? team_results.end_fail / team_results.end_count : '',
			end_lvl1: team_results.end_count ? team_results.end_lvl1 / team_results.end_count : '',
			end_lvl2: team_results.end_count ? team_results.end_lvl2 / team_results.end_count : '',
			end_lvl3: team_results.end_count ? team_results.end_lvl3 / team_results.end_count : '',
			end_climb: team_results.end_count ? team_results.end_climb / team_results.end_count : '',
			climb_speed_score: team_results.climb_count ? team_results.climb_speed_score / team_results.climb_count : '',
			carry_score: team_results.carry_score / sheets.length,
			robot_speed_score: team_results.robot_speed_count ? team_results.robot_speed_score / team_results.robot_speed_count : '',
			pickup_hatch_total: team_results.pickup_hatch_total / sheets.length,
			pickup_hatch_ground: team_results.pickup_hatch_count ? team_results.pickup_hatch_ground / team_results.pickup_hatch_count : '',
			pickup_hatch_loading: team_results.pickup_hatch_count ? team_results.pickup_hatch_loading / team_results.pickup_hatch_count : '',
			pickup_cargo_total: team_results.pickup_cargo_total / sheets.length,
			pickup_cargo_ground: team_results.pickup_cargo_count ? team_results.pickup_cargo_ground / team_results.pickup_cargo_count : '',
			pickup_cargo_loading: team_results.pickup_cargo_count ? team_results.pickup_cargo_loading / team_results.pickup_cargo_count : '',
			drop_hatch_ship: team_results.drop_hatch_ship / sheets.length,
			drop_hatch_r1: team_results.drop_hatch_r1 / sheets.length,
			drop_hatch_r2: team_results.drop_hatch_r2 / sheets.length,
			drop_hatch_r3: team_results.drop_hatch_r3 / sheets.length,
			drop_cargo_ship: team_results.drop_cargo_ship / sheets.length,
			drop_cargo_r1: team_results.drop_cargo_r1 / sheets.length,
			drop_cargo_r2: team_results.drop_cargo_r2 / sheets.length,
			drop_cargo_r3: team_results.drop_cargo_r3 / sheets.length,
			drop_cargo_total_avg: team_results.drop_cargo_total / sheets.length,
			drop_hatch_total_avg: team_results.drop_hatch_total / sheets.length,
			drop_cargo_total: team_results.drop_cargo_total,
			drop_hatch_total: team_results.drop_hatch_total,
		});
	}
}