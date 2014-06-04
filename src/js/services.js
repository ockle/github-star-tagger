angular
.module('githubStarTagger.services', [])
.factory('GitHubAPI', function($http, $q) {
    // Construct a Service object
    var Service = function() {};

    Service.prototype = {
        /**
         * Setter for username
         */
        setUsername: function(username) {
            this.username = username;

            return this;
        },
        /**
         * Get all user's stars
         */
        getAllStars: function() {
            var self = this;

            // Get the first page for stars...
            return this.getStarsPage(1).then(function(response) {
                // ...if there are no more pages, return what we have...
                if (!response.headers.link) {
                    return response.data;
                }

                // ...else return a group of promises of all remaining pages...
                var starData = response.data,
                    lastPage = parseInt(self.parseLinksHeader(response.headers.link).last.match(/&page=([0-9]+)/)[1]),
                    pagePromises = [];

                for (var i = 2; i <= lastPage; i++) {
                    pagePromises.push(self.getStarsPage(i));
                }

                return $q.all(pagePromises).then(function(responses) {
                    // ...and from that return the array of stars with the resolved
                    // non-first pages' stars joined onto the first page stars
                    angular.forEach(responses, function(response) {
                        starData.push.apply(starData, response.data);
                    });

                    return starData;
                });

            });
        },
        /**
         * Get a specific page of stars
         */
        getStarsPage: function(page) {
            var deferred = $q.defer();

            $http.get('https://api.github.com/users/' + this.username + '/starred', {
                params: {
                    per_page: 100,
                    page: page,
                    cache_buster: Math.random()
                }
            }).success(function(data, staus, headers) {
                // Success, resolve the star data
                deferred.resolve({
                    data: data,
                    headers: headers()
                });
            }).error(function(data, status) {
                // Failure, reject with the likely reason
                switch (status) {
                    case 403:
                        deferred.reject('Github API rate limit reached');
                        break;
                    case 404:
                        deferred.reject('Username not found');
                        break;
                }
            });

            return deferred.promise;
        },
        /**
         * Github API exposes pagination data through the "Links"
         * header - this parses it in a non-bulletproof way
         */
        parseLinksHeader: function(header) {
            // Adpated from https://gist.github.com/niallo/3109252
            var parts = header.split(','),
                links = {};

            angular.forEach(parts, function(part) {
                var sections = part.split(';'),
                    url = sections[0].replace(/<(.*)>/, '$1').trim(),
                    name = sections[1].replace(/rel="(.*)"/, '$1').trim();

                links[name] = url;
            });

            return links;
        }
    };

    return new Service;
});
