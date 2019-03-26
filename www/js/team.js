class TeamStatistics {
	constructor(team_statistics) {
		this.team_number = ko.observable(team_statistics.team_number);
		this.matches_scouted = ko.observable(team_statistics.matches_scouted);

		this.starts_hatch = ko.observable(team_statistics.starts_hatch);
		this.starts_cargo = ko.observable(team_statistics.starts_cargo);
		this.starts_nothing = ko.observable(team_statistics.starts_nothing);

		this.auton_bonus_score = ko.observable(team_statistics.auton_bonus_score);
		this.auton_mobility_score = ko.observable(team_statistics.auton_mobility_score);

		this.avg_defense_counts = ko.observable(team_statistics.avg_defense_counts);

		this.end_fail = ko.observable(team_statistics.end_fail);
		this.end_lvl1 = ko.observable(team_statistics.end_lvl1);
		this.end_lvl2 = ko.observable(team_statistics.end_lvl2);
		this.end_lvl3 = ko.observable(team_statistics.end_lvl3);

		this.climb_speed_score = ko.observable(team_statistics.climb_speed_score);
		this.carry_score = ko.observable(team_statistics.carry_score);

		this.robot_speed_score = ko.observable(team_statistics.robot_speed_score);
	}
}