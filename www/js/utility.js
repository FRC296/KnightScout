$('.js-backup-scout-data').on('click', () => {
	$('.js-backup-output').text(ko.toJSON(app_state.scout.sheets));
});

$('.js-copy-scout-data').on('click', () => {
	var textArea = $('.js-backup-output')[0];

	function isiOS() {
		return navigator.userAgent.match(/ipad|iphone/i);
	}

	if (isiOS()) {
		console.log('ios selection');
		var range, selection;

		range = document.createRange();
		range.selectNodeContents(textArea);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		textArea.setSelectionRange(0, textArea.value.length);
	} else {
		textArea.select();
	}
});

$('.js-max-integer').text(Number.MAX_SAFE_INTEGER);

$('.js-storage-usage').text(calculateUsedStorage());

function calculateUsedStorage() {
	console.log('Current Storage Usage:');
	var _lsTotal=0,_xLen,_x;
	for(_x in localStorage){
		if(!localStorage.hasOwnProperty(_x)){continue;}
		_xLen= ((localStorage[_x].length + _x.length)* 2);
		_lsTotal+=_xLen;
		console.log(_x.substr(0,50)+" = "+ (_xLen/1024).toFixed(2)+" KB")
	};
	console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");

	return (_lsTotal / 1024).toFixed(2) + " KB";
}

$('.js-delete-event-info').on('click', () => {
	bootbox.confirm({
		message: "Are you sure you want to delete all event information? This encompasses events and matches.",
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
		callback: function (result) {
			if (result) {
				localStorage.removeItem('events');
				localStorage.removeItem('current_event');
				location.reload()
			}
		}
	});
});

$('.js-delete-scout-info').on('click', () => {
	bootbox.confirm({
		message: "Are you sure you want to delete all scout information? This includes all your scout sheets!",
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
		callback: function (result) {
			if (result) {
				localStorage.removeItem('scout');
				location.reload()
			}
		}
	});
});