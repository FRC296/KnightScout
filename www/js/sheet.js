const ACTION_MAPPING = {
	p: 'Pickup',
	d: 'Dropoff'
}

const GAME_PIECE_MAPPING = {
	c: 'Cargo',
	h: 'Hatch'
}

const LOCATION_MAPPING = {
	g: 'Ground',
	l: 'Loading Station',
	c: 'Cargo Ship',
	b: 'Rocket Level 1',
	m: 'Rocket Level 2',
	t: 'Rocket Level 3'
}

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
	constructor($container) {
		this.$menus = $('[data-menu]', $container);
		this.$menus
			.hide()
			.filter('[data-menu="home"]').show();
		this.$buttons = $('button[data-key]', $container);
		this.current_action = ko.observable(new Action());
		this.actions = ko.observableArray();


		this.$buttons.on('click', event => {
			let $button = $(event.target);
			this.current_action()[$button.data('key')]($button.data('value'));
			this.$menus
				.hide()
				.filter(`[data-menu="${$button.data('next')}"]`)
				.show();

			if ($button.is('[data-submit]')) {
				this.actions.push(this.current_action());
				this.current_action(new Action());
			}
		});

		ko.applyBindings(this, $container[0]);
	}

	cancel() {
		this.current_action(new Action());
		this.$menus
			.hide()
			.filter('[data-menu="home"]').show();
	}
}