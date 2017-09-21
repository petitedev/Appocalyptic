<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package OnePageTemplate
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="http://gmpg.org/xfn/11">

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="site">
	<!-- <a class="skip-link screen-reader-text" href="#content"><?php esc_html_e( 'Skip to content', 'onepagetemplate' ); ?></a> -->

	<header id="masthead" class="site-header">
		<div class="site-branding">
			<div id="top-header">
				<div class="site_logo">
					<?php the_custom_logo(); ?>
				</div>

				<nav id="site-navigation" class="main-navigation">
					<?php
						wp_nav_menu( array(
							'theme_location' => 'menu-1',
							'menu_id'        => 'primary-menu',
						) );
					?>
				</nav><!-- #site-navigation -->
			</div>

			<?php if ( is_front_page() && is_home() ) : ?>
				<h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
			<?php else : ?>
				<p class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></p>
			<?php
			endif;

			$description = get_bloginfo( 'description', 'display' );
			if ( $description || is_customize_preview() ) : ?>
				<p class="site-description"><?php echo $description; /* WPCS: xss ok. */ ?></p>
			<?php
			endif; ?>
		</div><!-- .site-branding -->

		<div id="header-phone-slider">
			<div class="header-image-slider">
				<?php if( get_sub_field('header_slide_image') ): ?>
					<img src="<?php echo the_sub_field('header_slide_image'); ?>" />
				<?php endif; ?>


				<?php
					// check if the repeater field has rows of data
					if( have_rows('header_images') ):
					 	// loop through the rows of data
					    while ( have_rows('header_images') ) : the_row(); ?>
					        <div style="background-image: url('<?php the_sub_field('header_slide_image'); ?>');"></div>
					    <?php endwhile;
					else :
					    // no rows found
					endif;
				?>
			</div>

			<img class="phone-frame" src="<?php echo get_template_directory_uri(); ?>/img/samsung.png" />
		</div>
		
	</header><!-- #masthead -->

	<div id="content" class="site-content">
