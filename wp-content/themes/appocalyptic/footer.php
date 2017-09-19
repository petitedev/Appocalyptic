<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package OnePageTemplate
 */

?>

	</div><!-- #content -->

	<footer id="colophon" class="site-footer">
		<div class="row fullWidth site-copyright align-middle">
			<a href="<?php echo esc_url( __( 'https://wordpress.org/', 'onepagetemplate' ) ); ?>">
				
					
					<?php the_field('footer_copyright'); ?>
			
			</a>
			
			
		</div><!-- .site-info -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
