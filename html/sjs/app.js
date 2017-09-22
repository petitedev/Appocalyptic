// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();


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



	var slider = $('.header-images-slider').slick({
  		autoplay: false,
  		autoplaySpeed: 2000,
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		centerMode: true,
  		centerPadding: '0px'
	}).on('init', function(event, slick){
		var cSlide = $('.header-images-slider').slick('slickCurrentSlide');

		// $(slick.$slides[cSlide]).removeClass('left-current right-current');		
		// $(slick.$slides[cSlide]).prevAll().nextAll().removeClass('left-current right-current');		

		// $(slick.$slides[cSlide]).prev().addClass('left-current');
		// $(slick.$slides[cSlide]).next().addClass('right-current');

		$(slick.$slides[cSlide]).prev().css({
			'right': '-50px' 
		});
		$(slick.$slides[cSlide]).next().css({
			'left' : '-50px',
		});
	});

	slider.slick('unslick');

	slider.slick({
  		autoplay: false,
  		autoplaySpeed: 2000,
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		centerMode: true,
  		centerPadding: '0px',
  		appendArows: $('header'), 
  		leftArrow: $('.left-arrow'),
  		rightArrow: $('.right-arrow')  
	});  


	slider.on('init', function(event, slick){
		var cSlide = $('.header-images-slider').slick('slickCurrentSlide');

		$(slick.$slides[cSlide]).prev().css({
			'right': '-50px' 
		}); 
		$(slick.$slides[cSlide]).next().css({
			'left' : '-50px',
		});
	});



	// var currentSlide = $('.header-images-slider').slick('slickCurrentSlide');
	// console.log(currentSlide)

	slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {

		// $(slick.$slides[currentSlide])
		
		// .nextAll().css({
		// 	'left' : ''
		// 	'right' : ''
		// }).end()
		// .prevAll().css({
		// 	'left': '' 
		// 	'right': '' 
		// });



		$(slick.$slides[currentSlide]).prevAll().css({
			'left': '',
			'right': '0' 
		});

		$(slick.$slides[currentSlide]).nextAll().css({
			'left' : '0',
			'right' : ''
		});
	});

	slider.on('afterChange', function(event, slick, currentSlide) {
		$(slick.$slides[currentSlide]).prev().css({
			'right': '-50px',
			'left' : ''
		});

		$(slick.$slides[currentSlide]).next().css({
			'left' : '-50px',
			'right' : ''
		});
		
	});


});

