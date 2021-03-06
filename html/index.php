<?php

/* INDEX HTML SLICING - use this file only as settings, provide a method to generate a HTML slicing project

 * PROJECT SETTINGS, please change them

*/

global $ch_gsettings;
$ch_gsettings = array(

  'project_title'                     => 'Project Name',
  'developers'                        => array(
    'CSS'                 => 'Names of the CSS team members, comma separated',
    'WP'                  => 'Names of the CSS team members, comma separated',
    'JS'                  => 'Names of the CSS team members, comma separated',
    'Testing'             => 'Names of the CSS team members, comma separated',
  ),

  'header'                            => 'lib/header',
  'footer'                            => 'lib/footer',

  'extensions_2_display_in_index'     => array(
    'html',
    // 'php',
  ),
  'files_2_hide_in_index'             => array(
    'index.html',
    'index.php',
  ),
  'current_page'                      => array(
    'title'                           => '', // !!!! this is autogenerated, do not change ! You can use this in your header, footer or any other php files
    'script_name'                     => '', // !!!! this is autogenerated, do not change ! You can use this in your header, footer or any other php files
  ),

);


/* DO NOT CHANGE AFTER THIS UNLESS YOU KNOW WHAT YOU'RE DOING */

if ( !isset($_GET['fn']) ) {
error_reporting(0);

?><html>
  <head>
    <title><?php echo $ch_gsettings['project_title'].' - HTML Slicing'; ?></title>
  </head>
<body><?php

echo '<pre>';
echo '<h1>Project '.$ch_gsettings['project_title'].', HTML Slicing</h1>';
echo '<h4>Developers: </h4>';
echo '<ul class="developers">';
  foreach ($ch_gsettings['developers'] as $k=>$devs) {
    echo '<li class="'.$k.'">'.$k.': '.$devs.'</li>';
  }
echo '</ul>';
echo '<h5>Project List: </h5>';
echo '<ul>';

  $dir = dirname(__FILE__);
  $finfo = pathinfo(__FILE__);
  $dir = $finfo['dirname'];

  $dh  = opendir($dir);

  $url = str_replace( $finfo['basename'], '', 'http://'.$_SERVER[HTTP_HOST].$_SERVER[REQUEST_URI]);
  while (false !== ($filename = readdir($dh))) {

    if ( is_file($filename) ) {
      $finfo = pathinfo($filename);
      $extension = $finfo['extension'];
      if ( in_array( strtolower($extension), $ch_gsettings['extensions_2_display_in_index'] ) ) {

        if ( !in_array($filename, $ch_gsettings['files_2_hide_in_index']) ) {
          $files[] = $filename;
          echo '<li><a target="_blank" href="?fn='.$finfo['filename'].'">'.$filename.'</a></li>';
        }

      }
    }
  }

echo '</ul>';

?></body>
</html><?php

} else {

  if ( file_exists($_GET['fn'].'.html') ) {
    //deploying current page settings
    $ch_gsettings['current_page']['title'] = $ch_gsettings['project_title'].', '.$_GET['fn'];
    $ch_gsettings['current_page']['script_name'] = $_GET['fn'];

    get_template_part('lib/header', $_GET['fn']);

      require($_GET['fn'].'.html');

    get_template_part('lib/footer', $_GET['fn']);

  } else {
    echo '<pre>Page not found, '.$_GET['fn'].'.html</pre>';
  }

}



function get_template_part( $slug, $name = '' ) {
  if ( !empty($name) ) {
    $searched_filename = $slug.'-'.$name.'.php';

    if ( file_exists($searched_filename) ) {
      include($searched_filename);
      return;
    }
  }
  $searched_filename = $slug.'.php';
  if ( file_exists($searched_filename) ) {
    include($searched_filename);
    return;
  }

  echo '<pre>No script filename found for '.$slug.'[-'.$name.'].php</pre>';
  die();

}