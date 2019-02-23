class Match {
	constructor(event_info = {}) {
		this.match_number = event_info.match_number || 0;
		this.match_time = event_info.match_time || new Date(0);
		this.match_time_formatted = moment(this.match_time).format('H:mm');
		this.red1 = event_info.red1 || 0;
		this.red2 = event_info.red2 || 0;
		this.red3 = event_info.red3 || 0;
		this.blue1 = event_info.blue1 || 0;
		this.blue2 = event_info.blue2 || 0;
		this.blue3 = event_info.blue3 || 0;
		this.tournament_level = event_info.tournament_level || '';
	}
}

function BuildMatch(match_info) {
	let station_teams = MatchTeamArrayToStations(match_info.teams);
	return new Match({
		match_number: match_info.matchNumber,
		match_time: new Date(match_info.startTime),
		red1: station_teams.red1,
		red2: station_teams.red2,
		red3: station_teams.red3,
		blue1: station_teams.blue1,
		blue2: station_teams.blue2,
		blue3: station_teams.blue3,
		tournament_level: match_info.tournamentLevel
	});
}

function MatchTeamArrayToStations(teams) {
	let stations = teams.reduce((acc, cur) => {
		acc[cur.station.toLowerCase()] = cur.teamNumber;
		return acc;
	}, {});
	return stations;
}