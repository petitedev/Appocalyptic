// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();


/* Variables 
------------------------------------------------------------------------------------------------------------------------*/
var viewHeight;


// document ready method
$(function ()
{

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






	/*--------------------------------------------------------------------------------------------------------------------------
	Header Slider
	----------------------------------------------------------------------------------------------------------------------------*/
	var slider = $('.header-images-slider').slick({
  		autoplay: true,
  		autoplaySpeed: 3500,
  		// speed: 400,
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		centerMode: true,
  		centerPadding: '0px',
  		draggable: false
	}).on('init', function(event, slick){
		var cSlide = $('.header-images-slider').slick('slickCurrentSlide');

		$(slick.$slides[cSlide]).removeClass('left-current right-current');		
		$(slick.$slides[cSlide]).prevAll().removeClass('left-current right-current');
		$(slick.$slides[cSlide]).nextAll().removeClass('left-current right-current');		

		$(slick.$slides[cSlide]).prev().addClass('left-current');
		$(slick.$slides[cSlide]).next().addClass('right-current');
	});

	slider.slick('unslick');

	slider.slick({
  		autoplay: true,
  		autoplaySpeed: 3500,
  		// speed: 400,
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		centerMode: true,
  		centerPadding: '0px',
  		draggable: false
	});

	slider.on('init', function(event, slick){
		var cSlide = $('.header-images-slider').slick('slickCurrentSlide');

		$(slick.$slides[cSlide]).removeClass('left-current right-current');		
		$(slick.$slides[cSlide]).prevAll().removeClass('left-current right-current');
		$(slick.$slides[cSlide]).nextAll().removeClass('left-current right-current');		

		$(slick.$slides[cSlide]).prev().addClass('left-current');
		$(slick.$slides[cSlide]).next().addClass('right-current');
	});

	slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
		$(slick.$slides[currentSlide]).removeClass('left-current right-current');		
		$(slick.$slides[currentSlide]).prevAll().removeClass('left-current right-current');
		$(slick.$slides[currentSlide]).nextAll().removeClass('left-current right-current');
	});

	slider.on('afterChange', function(event, slick, currentSlide) {
		$(slick.$slides[currentSlide]).prev().addClass('left-current');
		$(slick.$slides[currentSlide]).next().addClass('right-current');
	});
	/*----------------------------------------------------------------------------------------------------------------------------
	End Header Slider
	------------------------------------------------------------------------------------------------------------------------------*/

});


$(window).on('load resize', function() {
	viewHeight = $(window).height();
	console.log(viewHeight);

	header();
});


$(document).on('scroll', function() {
	header();
});


/*--------------------------------------------------------------------------------------------------------------------------
Sticky Header
----------------------------------------------------------------------------------------------------------------------------*/
function header() {
	var sc = $(document).scrollTop();

	if (sc >= 45) {
		$('header').addClass('sticky-header');
	}
	else {
		$('header').removeClass('sticky-header');
	}

	if (sc >= viewHeight) {
		$('header').addClass('full');
	}
	else {
		$('header').removeClass('full');
	}
}
/*----------------------------------------------------------------------------------------------------------------------------
End Sticky Header
------------------------------------------------------------------------------------------------------------------------------*/