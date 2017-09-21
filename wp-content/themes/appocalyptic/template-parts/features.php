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
 				$feature_background = get_sub_field('feature_background');

 				?>

 				<!-- <li class="slide"> -->

		 		<div style="background-image: url(<?php  echo  $feature_background;  ?>)" class="feature-box columns medium-6 small-12 large-4">
		 		    <div class="feature-box-container">
		              <div class="icon-heading-container">
		                  <?php 
		                    $iconKey = explode(':', trim($icon));
		                  	echo '<img class="icon-img" src="' . get_template_directory_uri() . '/img/icons/'. $iconKey[0] .'">';
				               ?>
		                <div class="icon-heading">
											<?php 
												echo "<h4>". $feature_title. "</h4>";
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

 			<?php endwhile; ?>


 		<?php endif; ?>
 	</div>
 </div>