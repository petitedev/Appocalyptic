// remove the "$" namespace from jQuery, avoids conflicts with other libraries
jQuery.noConflict();

// closure, mapping jQuery to $, window, document and undefined - useful for minifing tools
(function($, window, document, undefined){