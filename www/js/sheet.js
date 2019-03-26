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

const SERIALIZATION_DELIMITER = '*';

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

		let self = this;
		this.deleteAction = function() {
			self.actions.remove(this);
		}
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

		this.submitted = ko.observable(!!sheet_data.submitted);

		this.action_menu = new ActionMenu(sheet_data.action_menu);
	}

	addDefenseInteraction() {
		this.defense_count(this.defense_count() + 1);
	}

	removeDefenseInteraction() {
		this.defense_count(Math.max(this.defense_count() - 1, 0));
	}

	padInt(int, size) {
		if ($.isNumeric(int)) {
			return parseInt(int).toString().padStart(size, '0');
		}

		return new Array(size + 1).join(' ');
	}
	serializeSheet() {
		let stream = [];
		stream.push((this.scout_name() || '').slice(0, 30)); // TODO: SANITIZE
		stream.push(SERIALIZATION_DELIMITER);
		stream.push((this.event_key() || '').slice(0, 8));
		stream.push(SERIALIZATION_DELIMITER);

		stream = stream.concat([
			[this.event_year(), 4],
			[this.match_number(), 3],
			[this.match_level(), 1],
			[this.team_number(), 4],
			[this.alliance(), 1],
			[this.starts_with(), 1],
			[this.auton_bonus(), 1],
			[this.auton_mobility(), 1],
			[this.defense_count(), 3],
			[this.end_platform(), 1],
			[this.climb_speed(), 1],
			[this.carried() ? 1 : 0, 1],
			[this.robot_speed(), 1]
		].map(part => this.padInt.apply(null, part)));

		stream.push(SERIALIZATION_DELIMITER);

		stream = stream.concat(this.action_menu.actions().map(action => [
			this.padInt(action.action_name(), 1),
			this.padInt(action.game_piece(), 1),
			this.padInt(action.location(), 1)
		]).flat());

		stream.push(SERIALIZATION_DELIMITER);

		stream.push(this.comments());

		return stream.join('');
	}

	static deserializeBlobPart(part) {
		if ($.isNumeric(part)) {
			return parseInt(part).toString();
		}
		return '';
	}

	static deserializeSheet(stream) {
		let stream_parts = stream.split('*');
		let blob = stream_parts[2];
		let action_blob = stream_parts[3];

		let actions = [];

		for (var i = 0; i < action_blob.length; i=i+3) {
			actions.push({
				action_name: parseInt(action_blob[i]),
				game_piece: parseInt(action_blob[i + 1]),
				location: parseInt(action_blob[i + 2])
			});
		}

		let f = Sheet.deserializeBlobPart;

		return new Sheet({
			scout_name: stream_parts[0],
			event_key: stream_parts[1],
			event_year: f(blob.slice(0, 4)),
			match_number: f(blob.slice(4, 7)),
			match_level: f(blob.slice(7, 8)),
			team_number: f(blob.slice(8, 12)),
			alliance: f(blob.slice(12, 13)),
			starts_with: f(blob.slice(13, 14)),
			auton_bonus: f(blob.slice(14, 15)),
			auton_mobility: f(blob.slice(15, 16)),
			defense_count: f(blob.slice(16, 19)),
			end_platform: f(blob.slice(19, 20)),
			climb_speed: f(blob.slice(20, 21)),
			carried: parseInt(blob.slice(21, 22)) > 0,
			robot_speed: f(blob.slice(22, 23)),
			comments: stream_parts[4],
			action_menu: {
				actions: actions
			}
		});
	}

	createQRcode() {

		console.log('Creating QR code');

		let $qr_code = $('.js-qr-code');
		let $modal = $('#qr_code_display');

		console.log('Serialize Sheet!');

		let data = {};

		try {
			data = this.serializeSheet();
		} catch(error) {
			bootbox.alert('Serialization Failed. Error:' + JSON.stringify(error));
			console.log('Serialization Failed', JSON.stringify(error));
			return;
		}

		console.log('QR encoding:', data);
		console.log('Length', data.length);

		$qr_code.empty();

		if (data.length > 1273) {
			bootbox.alert('Scout sheet contains too much data! Try making your comments more concise.');
			return;
		}

		let modal_width = (parseInt($('.modal-lg', $modal).css('max-width').replace('px', '')) || 1140);

		let best_height = Math.min(window.innerHeight * 0.8, window.innerWidth * 0.8, modal_width * 0.9);

		try {
			let qrcode = new QRCode($qr_code[0], {
				text: data,
				width: best_height,
				height: best_height,
				colorDark : "#000000",
				colorLight : "#ffffff",
				correctLevel : QRCode.CorrectLevel.H
			});
	
			$modal.modal();
		} catch (error) {
			debugger;
			console.log('QR Code error', error);
			bootbox.alert('Failed to generate QR code. Error: ' + JSON.stringify(error));
		}
		
	}
}