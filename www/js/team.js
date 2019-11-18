class TeamStatistics {
	constructor(team_statistics = {}) {
		this.team_number = ko.observable(team_statistics.team_number);
		this.matches_scouted = ko.observable(team_statistics.matches_scouted);

		this.starts_particle = ko.observable(team_statistics.starts_particle);
		this.starts_particle.formatted = ko.computed(() => this.formatStat(this.starts_particle(), true), this);
		this.starts_nothing = ko.observable(team_statistics.starts_nothing);
		this.starts_nothing.formatted = ko.computed(() => this.formatStat(this.starts_nothing(), true), this);

		this.auton_bonus_no_move = ko.observable(team_statistics.auton_bonus_no_move);
		this.auton_bonus_no_move.formatted = ko.computed(() => this.formatStat(this.auton_bonus_no_move(), true), this);
		this.auton_bonus_no_score = ko.observable(team_statistics.auton_bonus_no_score);
		this.auton_bonus_no_score.formatted = ko.computed(() => this.formatStat(this.auton_bonus_no_score(), true), this);
		this.auton_score_1 = ko.observable(team_statistics.auton_score_1);
		this.auton_score_1.formatted = ko.computed(() => this.formatStat(this.auton_score_1(), true), this);
		this.auton_score_2 = ko.observable(team_statistics.auton_score_2);
		this.auton_score_2.formatted = ko.computed(() => this.formatStat(this.auton_score_2(), true), this);
		this.auton_score_3 = ko.observable(team_statistics.auton_score_3);
		this.auton_score_3.formatted = ko.computed(() => this.formatStat(this.auton_score_3(), true), this);

		this.auton_mobility_score = ko.observable(team_statistics.auton_mobility_score);
		this.auton_mobility_score.formatted = ko.computed(() => this.formatStat(this.auton_mobility_score()), this);

		this.avg_defense_counts = ko.observable(team_statistics.avg_defense_counts);
		this.avg_defense_counts.formatted = ko.computed(() => this.formatStat(this.avg_defense_counts()), this);

		this.score_1 = ko.observable(team_statistics.score_1);
		this.score_1.formatted = ko.computed(() => this.formatStat(this.score_1()), this);
		this.score_2 = ko.observable(team_statistics.score_2);
		this.score_2.formatted = ko.computed(() => this.formatStat(this.score_2()), this);
		this.score_3 = ko.observable(team_statistics.score_3);
		this.score_3.formatted = ko.computed(() => this.formatStat(this.score_3()), this);

		this.robot_speed_score = ko.observable(team_statistics.robot_speed_score);
		this.robot_speed_score.formatted = ko.computed(() => this.formatStat(this.robot_speed_score()), this);
	}

	formatStat(stat, percentage) {
		var parsed_stat = parseFloat(stat);

		if (isNaN(parsed_stat)) {
			return stat;
		}

		if (percentage) {
			return (parsed_stat * 100).toFixed(0) + '%';
		}
	
		return parsed_stat.toFixed(1);
	}

	view() {
		app_state.scout.current_stat(this);
		window.goToPage('team-profile-page');
	}

	padInt(num, size, decimals) {
		if ($.isNumeric(num)) {
			decimals = decimals || 0;
			let decimal_multiplier = Math.pow(10, decimals);
			let padded_string = parseInt(Math.round(num * decimal_multiplier)).toString().padStart(size, '0');
			return padded_string.substr(padded_string.length - size);
		}

		return new Array(size + 1).join(' ');
	}

	serializeStats() {
		let stream = [];

		stream.push(this.padInt(this.team_number(), 4));
		stream.push(this.padInt(this.matches_scouted(), 3));

		let short_counts = [
			this.avg_defense_counts(),
			this.pickup_hatch_total(),
			this.pickup_cargo_total(),
			this.drop_hatch_ship(),
			this.drop_hatch_r1(),
			this.drop_hatch_r2(),
			this.drop_hatch_r3(),
			this.drop_cargo_ship(),
			this.drop_cargo_r1(),
			this.drop_cargo_r2(),
			this.drop_cargo_r3()
		].map(x => this.padInt(x, 4, 1));

		let decimal_counts = [
			this.auton_bonus_score(),
			this.auton_mobility_score(),
			this.climb_speed_score(),
			this.robot_speed_score(),
		].map(x => this.padInt(x, 3, 2));

		let percentages = [
			this.starts_hatch(),
			this.starts_cargo(),
			this.starts_nothing(),
			this.end_fail(),
			this.end_lvl1(),
			this.end_lvl2(),
			this.end_lvl3(),
			this.end_climb(),
			this.carry_score(),
			this.pickup_hatch_ground(),
			this.pickup_hatch_loading(),
			this.pickup_cargo_ground(),
			this.pickup_cargo_loading()
		].map(x => this.padInt(x, 4, 3));

		return stream.join('') + short_counts.join('') + decimal_counts.join('') + percentages.join('');
	}

	static unpadNum(num, decimals) {
		if ($.isNumeric(num)) {
			return parseInt(num) / Math.pow(10, decimals || 0);
		}
		return '';
	}

	static deserializeSheet(stream) {
		let short_items = stream
			.slice(7, 51)
			.match(/.{1,4}/g)
			.map(x => TeamStatistics.unpadNum(x, 1));
		
		let decimal_counts = stream
			.slice(51, 63)
			.match(/.{1,3}/g)
			.map(x => TeamStatistics.unpadNum(x, 2));
		
		let percentages = stream
			.slice(63, 115)
			.match(/.{1,4}/g)
			.map(x => TeamStatistics.unpadNum(x, 3));

		let info = {
			team_number: TeamStatistics.unpadNum(stream.slice(0, 4)).toString(),
			matches_scouted: TeamStatistics.unpadNum(stream.slice(4, 7)),
			avg_defense_counts: short_items[0],
			pickup_hatch_total: short_items[1],
			pickup_cargo_total: short_items[2],
			drop_hatch_ship: short_items[3],
			drop_hatch_r1: short_items[4],
			drop_hatch_r2: short_items[5],
			drop_hatch_r3: short_items[6],
			drop_cargo_ship: short_items[7],
			drop_cargo_r1: short_items[8],
			drop_cargo_r2: short_items[9],
			drop_cargo_r3: short_items[10],
			auton_bonus_score: decimal_counts[0],
			auton_mobility_score: decimal_counts[1],
			climb_speed_score: decimal_counts[2],
			robot_speed_score: decimal_counts[3],
			starts_hatch: percentages[0],
			starts_cargo: percentages[1],
			starts_nothing: percentages[2],
			end_fail: percentages[3],
			end_lvl1: percentages[4],
			end_lvl2: percentages[5],
			end_lvl3: percentages[6],
			end_climb: percentages[7],
			carry_score: percentages[8],
			pickup_hatch_ground: percentages[9],
			pickup_hatch_loading: percentages[10],
			pickup_cargo_ground: percentages[11],
			pickup_cargo_loading: percentages[12]
		};

		return new TeamStatistics(info);
	}
}