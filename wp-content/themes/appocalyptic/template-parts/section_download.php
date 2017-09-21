	<!-- download-section -->
	<section class="section section-download">
		<div class="heading heading-download">
			<h3 class="text-center">Download</h3>
			<span class="fa-icon fa-cloud-download"></span>
		</div>	
		<!-- content wrapper -->
		<div class="content-wrapper row">
			<?php if (have_rows('section_download')) : 

			while (have_rows('section_download')) : the_row(); ?>
				
				<div class="download-box columns medium-4">
					<div class="download-box-container">
					<?php if (get_row_layout() == 'apple_app'): 
						  $row1 = get_sub_field('apple_app_img');

						if ($row1) :  ?>
							
							<div class="image-download">
							<img src="<?php echo $row1; ?>" >
							</div> 
							
						<?php endif;
						endif; 
						 if (get_row_layout() == 'android_app'): 
							  $row1 = get_sub_field('android_app_img');

								if ($row1) :  ?>
									
									<div class="image-download">
									<img src="<?php echo $row1; ?>" >
									</div> 
									
								<?php endif;
						endif; 
						 if (get_row_layout() == 'windows_phone_app'): 
						  $row1 = get_sub_field('windows_phone_app_img');

						if ($row1) :  ?>
							
							<div class="image-download">
							<img src="<?php echo $row1; ?>" >
							</div> 
							
						<?php endif;
						endif; ?>
					</div>
				</div>
				<?php  

			endwhile;

			endif; ?>



		</div><!-- end content-wrapper -->


	</section><!-- end download section