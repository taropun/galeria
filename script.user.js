// ==UserScript==
// @name         galeria
// @namespace    http://github.com/taropun
// @version      0.1
// @description  Make exhentai's gallery view more useful
// @author       taropun
// @match        https://exhentai.org/s/*/*-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var apiUrl = 'https://api.e-hentai.org/api.php';

    function POST(url, body, onSuccess, onError) {
        var xhr = new XMLHttpRequest();
        xhr.onload = onSuccess;
        xhr.onerror = onError;
        xhr.open('POST', url);
        xhr.send(body);
    }

    function fixLinks() {
        var galleryLink = document.querySelector('#i5 .sb a');
        var relatedImagesLink = document.querySelector('#i6 a');
        var reloadLink = document.querySelector('#i6 a#loadfail');

        var pathSegments = galleryLink.pathname.split('/');
        var galleryId = parseInt(pathSegments[2], 10);
        var galleryToken = pathSegments[3];

        relatedImagesLink.href = galleryLink.pathname;
        relatedImagesLink.textContent = 'Go back to gallery';

        reloadLink.href = '#';
        reloadLink.textContent = 'Find more by artist';
        reloadLink.onclick = '';
        reloadLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var request = {'method': 'gdata',
                           'gidlist': [[galleryId, galleryToken]],
                           'namespace': 1};
            POST(apiUrl, JSON.stringify(request), function() {
                var response = JSON.parse(this.responseText);
                var tags = response.gmetadata[0].tags;
                var artistTags = tags.filter(function(tag) {
                    return tag.startsWith('artist:');
                });

                if (artistTags.length === 1) {
                    var artist = artistTags[0].split(':')[1];
                    // default search URL, but with expunged galleries enabled
                    var searchUrl = 'https://exhentai.org/?f_doujinshi=0&f_manga=1&f_artistcg=0&f_gamecg=0&f_western=0&f_non-h=0&f_imageset=0&f_cosplay=0&f_asianporn=0&f_misc=0&f_apply=Apply+Filter&advsearch=1&f_sname=on&f_stags=on&f_sh=on&f_srdd=2&f_search=';
                    searchUrl += encodeURIComponent('artist:"' + artist + '$"');
                    document.location = searchUrl;
                } else {
                    alert('More than one artist found: ' + artistTags);
                }
            });
        });
    }

    fixLinks(); // initial load
    var old_apply_json_state = apply_json_state;
    apply_json_state = function(a) {
        old_apply_json_state(a);
        fixLinks(); // subsequent page changes
    };
})();
