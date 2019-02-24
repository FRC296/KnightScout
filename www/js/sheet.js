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
	constructor() {
		this.action_name = ko.observable();
		this.action_name_formatted = ko.computed(() => ACTION_MAPPING[this.action_name()], this);
		this.game_piece = ko.observable();
		this.game_piece_formatted = ko.computed(() => GAME_PIECE_MAPPING[this.game_piece()], this);
		this.location = ko.observable();
		this.location_formatted = ko.computed(() => LOCATION_MAPPING[this.location()], this);
	}
}


class ActionMenu {
	constructor() {
		this.current_action = ko.observable(new Action());
		this.actions = ko.observableArray();
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
	constructor(current_event) {
		this.scout_name = ko.observable();
		this.event_key = ko.observable(current_event ? current_event.event_key() : undefined);
		this.event_year = ko.observable(current_event ? current_event.event_year() : undefined);
		this.match_number = ko.observable();
		this.match_level = ko.observable();
		this.team_number = ko.observable();
		this.alliance = ko.observable();

		this.starts_with = ko.observable();
		this.auton_bonus = ko.observable();
		this.auton_mobility = ko.observable();

		this.defense_count = ko.observable(0);

		this.end_platform = ko.observable();
		this.climb_speed = ko.observable();
		this.carried = ko.observable(false);

		this.robot_speed = ko.observable();
		this.comments = ko.observable();

		this.action_menu = new ActionMenu();
	}

	addDefenseInteraction() {
		this.defense_count(this.defense_count() + 1);
	}

	removeDefenseInteraction() {
		this.defense_count(Math.max(this.defense_count() - 1, 0));
	}
}