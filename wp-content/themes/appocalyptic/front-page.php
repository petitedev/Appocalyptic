<?php
/**
 * Template Name: Front Page
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package OnePageTemplate
 */
?>

<?php 
get_header(); 
?>

<?php 
 
get_template_part( '/template-parts/features' );
 ?>
 
 <?php 

 get_template_part( '/template-parts/section_download' );
  ?>

<?php 
get_footer();  
 ?> 


