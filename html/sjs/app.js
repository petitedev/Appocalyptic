// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

function dd(variable, varName)
{
	var varNameOutput;

	varName = varName || '';
	varNameOutput = varName ? varName + ':' : '';

	console.warn(varNameOutput, variable, ' (' + (typeof variable) + ')');
}

// document ready method
$(function ()
{



	// Main slider init function
	$('.main-slider-container').slick({
		arrows: false,
		dots: true,
		adaptiveHeight: true
	});


	// magnific popup init function
	$('.video-button a').magnificPopup({
		type: 'iframe',
		disableOn: function ()
		{
			if ($(window).width() < 600)
			{
				$('.video-button a').attr("target", "_blank");
				return false;
			}
			return true;
		},
		fixedContentPos: "auto"
	});


	// News slider for home
	$('.box-3-container').slick({
		arrows: false,
		dots: true,
		responsive: [
			{
				breakpoint: 700,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}// You can unslick at a given breakpoint now by adding:
			// settings: "unslick"
			// instead of a settings object
		]
	});


	// go to top function
	jQuery.easing['jswing'] = jQuery.easing['swing'];
	jQuery.extend(jQuery.easing, {
		def: 'easeOutQuint',
		swing: function (x, t, b, c, d)
		{
			//alert(jQuery.easing.default);
			return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
		},
		easeOutQuint: function (x, t, b, c, d)
		{
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		}
	});


	// clear input on custom-search template
	$('.clear-search').click(function ()
	{
		$(this).prev().val(' ');
	})

	$('.page-footer .section-footer_1 > a').bind('click', function (event)
	{
		var $anchor = $(this);
		$('html, body').stop().animate({
			scrollTop: 0
		}, 1000, 'easeOutQuint');
		event.preventDefault();
	});


	// 	add custom class when searchandfilter input is :checked

	$('.searchandfilter input[type="checkbox"]').on('change', function ()
	{
		if ($(this).attr("checked"))
		{
			$(this).parent().addClass('checked');
		}
		else
		{
			$(this).parent().removeClass('checked');
		}
	})


	// init related news slider content
	$('.slider-articles').slick({
		slidesToShow: 3,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 800,
				settings: {
					slidesToShow: 2
				}
			},
			{
				breakpoint: 650,
				settings: {
					slidesToShow: 1,
					dots: true,
					arrows: false

				}
			}

		]
	});

	$('.slider-articles .box-1 figure, .slider-articles .slick-next').matchHeight(true);


	$('.welcome-video .columns').matchHeight(true);
	$('.main-slider-container .columns').matchHeight(true);


	$('.registration-form-event').hide();
	$('.registration-form-trigger').click(function (e)
	{
		e.preventDefault();

		$('.registration-form-event').slideDown(500, function ()
		{

		}.bind(this));

		$(this).hide();
	});


	var $viewMoreContainer = $('.page-pagination'),
		$viewMoreButton = $viewMoreContainer.find('a');

	if ($viewMoreButton.length)
	{


		var $infinite = $('.js-infinite').infiniteScroll({
			append: '.js-article',
			status: '.scroller-status',
			//hideNav:      '.pagination',
			path: '.page-pagination a',
			loadOnScroll: false
		});
		$viewMoreButton.on('click', function ()
		{
			// load next page
			$infinite.infiniteScroll('loadNextPage');
			// enable loading on scroll
			//$infinite.infiniteScroll( 'option', {
			//	loadOnScroll: true,
			//});
			return false;
		});

		$infinite.on('last.infiniteScroll', function (event, response, path)
		{
			$viewMoreContainer.hide();
		});

	}


	/*companies*/

	function companies_scroll_to(el)
	{
		console.log(el);

		$('#companies-accordion').foundation('toggle', $('#dlc'+el));

		setTimeout(function ()
			{
				$('html, body').stop().animate({
					scrollTop: $("#companies-accordion li[data-id='" + el + "']").offset().top
				}, 1000, 'swing');
			}, 150);
	}



	var $companiesViewMoreContainer = $('.companies-page-pagination'),
		$companiesViewMoreButton = $companiesViewMoreContainer.find('a');

	if ($companiesViewMoreButton.length)
	{
		var $companiesInfinite = $('.js-companies-infinite').infiniteScroll({
			append: '.js-companies-article',
			status: '.scroller-status',
			//hideNav:      '.pagination',
			path: '.companies-page-pagination a',
			loadOnScroll: false,
			history: false
		});

		$companiesViewMoreButton.on('click', function ()
		{
			// load next page
			$companiesInfinite.infiniteScroll('loadNextPage');
			// enable loading on scroll
			//$infinite.infiniteScroll( 'option', {
			//	loadOnScroll: true,
			//});
			return false;
		});

		$companiesInfinite.on('last.infiniteScroll', function (event, response, path)
		{
			$companiesViewMoreContainer.hide();
		});


		$companiesInfinite.on('append.infiniteScroll', function (event, response, path, items)
		{
			if (typeof companiesMap !== 'undefined')
			{
				$.each(items, function (index, value)
				{
					var companiesMapLatLng = new google.maps.LatLng($(value).data('lat'), $(value).data('lng'));
					var companiesMapMarker = new google.maps.Marker({
						position: companiesMapLatLng,
						customInfo: $(value).data('id')
					});
					companiesMapMarkers.push(companiesMapMarker);
					companiesMapBounds.extend(companiesMapLatLng);
					companiesMapMarkerCluster.addMarker(companiesMapMarker);

					google.maps.event.addListener(companiesMapMarker, 'click', function() {

						companies_scroll_to(this.customInfo);

					});
				});
			}

			Foundation.reInit(['accordion']);
		});


		$('.companies-accordion-close').click(function (e)
		{
			e.preventDefault();

			companies_scroll_to($(this).attr('href'));

		});
	}


	if ($('#companies-map').length && companies_markers)
	{
		var companiesMapOptions = {
			'zoom': 13,
			'mapTypeId': google.maps.MapTypeId.ROADMAP
		};

		var companiesMap = new google.maps.Map(document.getElementById("companies-map"), companiesMapOptions);

		var companiesMapMarkers = [];

		var companiesMapBounds = new google.maps.LatLngBounds();

		$.each(companies_markers , function (index, value){

			var companiesMapLatLng = new google.maps.LatLng(value['lat'], value['lng']);
			var companiesMapMarker = new google.maps.Marker({position: companiesMapLatLng, customInfo: value['id']});
			companiesMapMarkers.push(companiesMapMarker);
			companiesMapBounds.extend(companiesMapLatLng);

			google.maps.event.addListener(companiesMapMarker, 'click', function() {

				companies_scroll_to(this.customInfo);

			});
		});

		companiesMap.fitBounds(companiesMapBounds);

		var companiesMapMarkerCluster = new MarkerClusterer(companiesMap, companiesMapMarkers, {imagePath: cht_wp.theme + "img/m"});

	}

});