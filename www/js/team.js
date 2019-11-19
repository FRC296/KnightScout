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
			this.score_1(),
			this.score_2(),
			this.score_3(),
		].map(x => this.padInt(x, 4, 1));

		let decimal_counts = [
			this.auton_mobility_score(),
			this.robot_speed_score(),
		].map(x => this.padInt(x, 3, 2));

		let percentages = [
			this.starts_nothing(),
			this.starts_particle(),
			this.auton_bonus_no_move(),
			this.auton_bonus_no_score(),
			this.auton_score_1(),
			this.auton_score_2(),
			this.auton_score_3(),
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
			.slice(7, 23)
			.match(/.{1,4}/g)
			.map(x => TeamStatistics.unpadNum(x, 1));
		
		let decimal_counts = stream
			.slice(23, 29)
			.match(/.{1,3}/g)
			.map(x => TeamStatistics.unpadNum(x, 2));
		
		let percentages = stream
			.slice(29, 57)
			.match(/.{1,4}/g)
			.map(x => TeamStatistics.unpadNum(x, 3));

		let info = {
			team_number: TeamStatistics.unpadNum(stream.slice(0, 4)).toString(),
			matches_scouted: TeamStatistics.unpadNum(stream.slice(4, 7)),
			avg_defense_counts: short_items[0],
			score_1: short_items[1],
			score_2: short_items[2],
			score_3: short_items[3],
			auton_mobility_score: decimal_counts[0],
			robot_speed_score: decimal_counts[1],
			starts_nothing: percentages[0],
			starts_particle: percentages[1],
			auton_bonus_no_move: percentages[2],
			auton_bonus_no_score: percentages[3],
			auton_score_1: percentages[4],
			auton_score_2: percentages[5],
			auton_score_3: percentages[6],
		};

		return new TeamStatistics(info);
	}
}