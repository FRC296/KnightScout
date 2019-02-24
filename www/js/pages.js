document.addEventListener("deviceready", initPages, false);

function initPages() {
	$('.js-splash-screen').remove();
	$('body').removeClass('is-app-loading');

	if (window.app_state.default_event) {
		//$('[data-role="page"]#event_select').show();
		window.app_state.event_signup
			.showSignup()
			.onSubmit(() => {
				//$('[data-role="page"]#event_select').hide();
				$('[data-role="page"]#main').show();
			});
	} else {
		$('[data-role="page"]#main').show();
	}

	let $all_pages = $('[data-role="page"]');
	let $navigation_tabs = $('.js-navbar-item');

	$all_pages.each((index, element) => {
		let id = element.id;
		let $element = $(element);

		$(`[href="#${id}"]:not(.dropdown-toggle)`).on('click', () => {
			$all_pages.hide();
			$element.show();

			$(document).trigger('page-show.' + id);
			$navigation_tabs.removeClass('active');
			$navigation_tabs.filter(`[data-active-page="#${id}"]`).addClass('active');


			return false;
		});
	});
}