<?php 
 ?>

 <div class="section section-features">
 	<div class="heading heading-features">
 		<h3 class="text-center">Features</h3>
 		<span class="fa-icon fa-phone"></span>
 	</div>	
 	<div class="row">
<?php 
 	

 		 if( have_rows('feature_section') ): ?>

 			<?php while( have_rows('feature_section') ): the_row(); 

 				// vars
 				$icon = get_sub_field('feature_icon');
 				$feature_description = get_sub_field('feature_description');
 				$feature_title = get_sub_field('feature_title');

 				?>

 				<!-- <li class="slide"> -->

		 		<div class="feature-box columns medium-4">
		 		    <div class="feature-box-container">
		              <div class="icon-heading-container">
		                <div class="icon-heading">

		                </div>
		                <div class="icon-title"> 
		                  <?php 
		                    $iconKey = explode(':', trim($icon));
		                  	echo '<img src="./img/icons/'. $iconKey[0] .'.svg">';
		                  
		                  ?>
		                </div>
		              </div>
		              <div class="section-description">
		                  <?php 
		                  	echo $feature_description;
		                   ?>
		              </div>
		  			</div>
		 		</div>

 					<?php if( $link ): ?>
 						<a href="<?php echo $link; ?>">
 					<?php endif; ?>

 						<img src="<?php echo $image['url']; ?>" alt="<?php echo $image['alt'] ?>" />

 				<!-- </li> -->

 			<?php endwhile; ?>


 		<?php endif; ?>
 	</div>
 </div>