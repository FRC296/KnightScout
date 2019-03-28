class TeamStatistics {
	constructor(team_statistics) {
		this.team_number = ko.observable(team_statistics.team_number);
		this.matches_scouted = ko.observable(team_statistics.matches_scouted);

		this.starts_hatch = ko.observable(team_statistics.starts_hatch);
		this.starts_hatch.formatted = ko.computed(() => this.formatStat(this.starts_hatch(), true), this);
		this.starts_cargo = ko.observable(team_statistics.starts_cargo);
		this.starts_cargo.formatted = ko.computed(() => this.formatStat(this.starts_cargo(), true), this);
		this.starts_nothing = ko.observable(team_statistics.starts_nothing);
		this.starts_nothing.formatted = ko.computed(() => this.formatStat(this.starts_nothing(), true), this);

		this.auton_bonus_score = ko.observable(team_statistics.auton_bonus_score);
		this.auton_bonus_score.formatted = ko.computed(() => this.formatStat(this.auton_bonus_score()), this);
		this.auton_mobility_score = ko.observable(team_statistics.auton_mobility_score);
		this.auton_mobility_score.formatted = ko.computed(() => this.formatStat(this.auton_mobility_score()), this);

		this.avg_defense_counts = ko.observable(team_statistics.avg_defense_counts);
		this.avg_defense_counts.formatted = ko.computed(() => this.formatStat(this.avg_defense_counts()), this);

		this.end_fail = ko.observable(team_statistics.end_fail);
		this.end_fail.formatted = ko.computed(() => this.formatStat(this.end_fail(), true), this);
		this.end_lvl1 = ko.observable(team_statistics.end_lvl1);
		this.end_lvl1.formatted = ko.computed(() => this.formatStat(this.end_lvl1(), true), this);
		this.end_lvl2 = ko.observable(team_statistics.end_lvl2);
		this.end_lvl2.formatted = ko.computed(() => this.formatStat(this.end_lvl2(), true), this);
		this.end_lvl3 = ko.observable(team_statistics.end_lvl3);
		this.end_lvl3.formatted = ko.computed(() => this.formatStat(this.end_lvl3(), true), this);

		this.climb_speed_score = ko.observable(team_statistics.climb_speed_score);
		this.climb_speed_score.formatted = ko.computed(() => this.formatStat(this.climb_speed_score()), this);
		this.carry_score = ko.observable(team_statistics.carry_score);
		this.carry_score.formatted = ko.computed(() => this.formatStat(this.carry_score(), true), this);

		this.robot_speed_score = ko.observable(team_statistics.robot_speed_score);
		this.robot_speed_score.formatted = ko.computed(() => this.formatStat(this.robot_speed_score()), this);

		this.pickup_hatch_count; // Average # of hatches picked up per match
		this.pickup_hatch_ground; // % of picked up hatches from the ground
		this.pickup_hatch_loading; // % of picked up hatches from the loading
		this.pickup_cargo_count; // Average # of cargo picked up per match
		this.pickup_cargo_ground; // % of picked up cargo from the ground
		this.pickup_cargo_loading; // % of picked up cargo from the loading

		this.drop_hatch_ship; // Average # of hatches scored at ship per match
		this.drop_hatch_r1; // Average # of hatches scored at r1 per match
		this.drop_hatch_r2; // Average # of hatches scored at r2 per match
		this.drop_hatch_r3; // Average # of hatches scored at r3 per match

		this.drop_cargo_ship; // Average # of cargo scored at ship per match
		this.drop_cargo_r1; // Average # of cargo scored at r1 per match
		this.drop_cargo_r2; // Average # of cargo scored at r2 per match
		this.drop_cargo_r3; // Average # of cargo scored at r3 per match
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
}