<?php

global $ch_gsettings;
//you can use $ch_gsettings to display global variables

?><!DOCTYPE html>
<html class="no-js" lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $ch_gsettings['current_page']['title']; ?></title>

  <link href="../wp-content/themes/ch-theme/css/app.css" rel="stylesheet" />
</head>
<body>
<div class="off-canvas-wrapper">

	<div class="off-canvas-wrapper-inner" data-off-canvas-wrapper>
		<div class="off-canvas-content" data-off-canvas-content>
			<div class="page-container">

				<header class="page-header">
					<div class="main-menu">
						<div class="row">
							<div class="columns small-12">

								<a href="#!" class="menu-logo"><img src="img/logo-menu.png" alt=""></a>

								<div class="triggers">
									<a href="#!" class="menu-trigger">
										<span class="text">Menu</span>
										<div class="lines"><span></span></div>
									</a>
									<ul class="language">
										<li><a href="#!" class="active">FR</a></li>
										<li><a href="#!">EN</a></li>
									</ul>
									<a href="#!" class="reservation-trigger"><span>reservation</span></a>
								</div>

								<div class="reserve-form">
									<header>
										<h2>Réservez votre séjour</h2>
										<h1>chez le général</h1>
									</header>

									<div class="form-wrap columns">
										<form action="#">
										<div class="row">

											<div class="field">
												<label for="arrivee">Arrivée</label>
												<input type="text" id="arrivee" name="arrivee" placeholder="03 / 03 / 2016">
											</div>

											<div class="field">
												<label for="depart">Départ</label>
												<input type="text" id="depart" name="depart" placeholder="23 / 03 / 2016">
											</div>
											

											<div class="field">
												<label for="asd">Nb. d’invités</label>
												<input type="number" id="invites" name="invites" placeholder="3">
											</div>

											<div class="field">
												<label for="chambre-select">Chambre</label>
												<select class="select-1" name="chambre-select" id="chambre-select">
													<option value="0">selectionnez</option>
													<option value="1">toutes les chambres</option>
													<option value="2">La suite royale</option>
													<option value="3">Les suites juniors</option>
													<option value="4">Les chambres deluxe</option>
													<option value="5">Les suites familiales</option>
													<option value="6">Les chambres supérieures</option>
													<option value="7">Les chambres classiques</option>
												</select>
											</div>

											<div class="field">
												<button class="verifier" type="submit" id="submit">Vérifier les disponibilités</button>
											</div>

										</div>
										</form>
									</div>

									<div class="hash-tag">
										<figure><img src="img/general-happy.png" alt=""></figure>
										<a href="#!">#happy</a>
									</div>
								</div>

								<nav class="menu">
									<ul>
										<li><a href="#!">Général who ?</a></li>
										<li class="menu-item-has-children">
											<a href="#!">Les chambres</a>
											<ul>
												<li><a href="#!">TOUTes les chambres</a></li>
												<li><a href="#!">La suite royale</a></li>
												<li><a href="#!">Les suites juniors</a></li>
												<li><a href="#!">Les chambres deluxe</a></li>
												<li><a href="#!">Les suites familiales</a></li>
												<li><a href="#!">Les chambres supérieures</a></li>
												<li><a href="#!">Les chambres classiques</a></li>
											</ul>
										</li>
										<li><a href="#!">services</a></li>
										<li><a href="#!">évènementiel</a></li>
										<li><a href="#!">un cadre unique</a></li>
										<li><a href="#!">infos pratiques</a></li>
									</ul>
								</nav>

								<footer class="columns">
									<div class="border-text"><span>Reserver</span></div>
									<div class="row">
										<div class="columns small-12 medium-4">
											<span class="tel">+33 (0)2 51 39 10 29</span>
											<a class="mailto" href="mailto:booking@generaldelbee.fr">booking@generaldelbee.fr</a>
										</div>
										<div class="columns small-12 medium-4">
											<ul class="social">
												<li><a target="_blank" class="facebook" href="https://www.facebook.com/Hotel.du.General.dElbee/"></a></li>
												<li><a target="_blank" class="instagram" href="https://www.instagram.com/hotel_generaldelbee/"></a></li>
												<li><a target="_blank" class="gplus" href="https://plus.google.com/114280727121688893218/posts"></a></li>
												<li><a class="phone" href="#!"></a></li>
												<li><a class="marker" href="#!"></a></li>
											</ul>
										</div>
										<div class="columns small-12 medium-4">
											<div class="address">2 Place d'Atrmes, 1 Quai Cassard, <br>	85330 Noirmoutier-en-l'Île</div>
										</div>
									</div>
								</footer>

							</div>
						</div>
					</div>


				</header><!--/.page-header-->