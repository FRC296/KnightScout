const TOURNAMENT_LEVELS = [
	'Qualification',
	'Playoff',
	'Practice',
	'Other'
]


const ACTION_MAPPING = [
	'Pickup',
	'Dropoff'
];

const GAME_PIECE_MAPPING = [
	'Cargo',
	'Hatch',
	'None'
]

const LOCATION_MAPPING = [
	'Ground',
	'Loading Station',
	'Cargo Ship',
	'Rocket Level 1',
	'Rocket Level 2',
	'Rocket Level 3'
];

class Action {
	constructor(action = {}) {
		this.action_name = ko.observable(action.action_name);
		this.action_name.formatted = ko.computed(() => ACTION_MAPPING[this.action_name()], this);
		this.game_piece = ko.observable(action.game_piece);
		this.game_piece.formatted = ko.computed(() => GAME_PIECE_MAPPING[this.game_piece()], this);
		this.location = ko.observable(action.location);
		this.location.formatted = ko.computed(() => LOCATION_MAPPING[this.location()], this);
	}
}


class ActionMenu {
	constructor(action_menu = {}) {
		this.current_action = ko.observable(new Action());
		this.actions = ko.observableArray((action_menu.actions || []).map(action => new Action(action)));
		this.current_menu = ko.observable('home');
	}

	cancel() {
		this.current_action(new Action());
		this.current_menu('home');
	}

	updateMenu(data, event) {
		let $button = $(event.target);
		this.current_action()[$button.data('key')]($button.data('value'));
		this.current_menu($button.data('next'));

		if ($button.is('[data-submit]')) {
			this.actions.push(this.current_action());
			this.current_action(new Action());
		}
	}
}

class Sheet {
	constructor(sheet_data = {}) {
		this.scout_name = ko.observable(sheet_data.scout_name);
		this.event_key = ko.observable(sheet_data.event_key);
		this.event_year = ko.observable(sheet_data.event_year);
		this.match_number = ko.observable(sheet_data.match_number);
		this.match_level = ko.observable(sheet_data.match_level);
		this.team_number = ko.observable(sheet_data.team_number);
		this.alliance = ko.observable(sheet_data.alliance);

		this.starts_with = ko.observable(sheet_data.starts_with);
		this.auton_bonus = ko.observable(sheet_data.auton_bonus);
		this.auton_mobility = ko.observable(sheet_data.auton_mobility);

		this.defense_count = ko.observable(sheet_data.defense_count || 0);

		this.end_platform = ko.observable(sheet_data.end_platform);
		this.climb_speed = ko.observable(sheet_data.climb_speed);
		this.carried = ko.observable(sheet_data.carried || false);

		this.robot_speed = ko.observable(sheet_data.robot_speed);
		this.comments = ko.observable(sheet_data.comments);

		this.action_menu = new ActionMenu(sheet_data.action_menu);
	}

	addDefenseInteraction() {
		this.defense_count(this.defense_count() + 1);
	}

	removeDefenseInteraction() {
		this.defense_count(Math.max(this.defense_count() - 1, 0));
	}
}