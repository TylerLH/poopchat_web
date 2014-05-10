'use strict';

//transform image links to img tags and http links to a tags
//angular version: 1.2.6
//include ngSanitize

angular.module('poopchat').filter('image_linky', ['$sanitize', function($sanitize) {
  var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,
      MAILTO_REGEXP = /^mailto:/, 
      IMAGE_REGEX = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg)(\?\w*)?)/i;

  return function(text, target) {
    if (!text) return text;
    var match;
    var raw = text;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(IMAGE_REGEX))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      i = match.index;
      addImage(url);
      raw = raw.substring(i + match[0].length);
    }

    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/mailto then assume mailto
      if (match[2] == match[3]) url = 'mailto:' + url;
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(text);
    }

    function addLink(url, text) {
      html.push('<a ');
      html.push('target="');
      html.push('_blank');
      html.push('" ');
      html.push('href="');
      html.push(url);
      html.push('">');
      addText(text);
      html.push('</a>');
    }

    function addImage(url){
      
      html.push('<div class="image-container">');
      html.push('<a href="'+url+'" target="_blank"><img src="'+url+'" /></a>');
      html.push('</div>');

    }
  };
}]);