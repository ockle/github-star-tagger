angular
.module('githubStarTagger.controllers', [])
.controller('starsController', function($scope, $modal, GitHubAPI) {
    $scope.stars = []; // Main stars data
    $scope.searchText = ''; // Any text being searched for
    $scope.filterLanguage = null; // Language being filtered
    $scope.availableLanguages = []; // Languages present across all stars
    $scope.allTags = []; // Tags present across all stars
    $scope.filterTags = []; // Tags being filtered on
    $scope.sortOrder = '+index'; // Sort order
    $scope.settingsModal = null; // Settings modal object, as returned by $modal.open()
    $scope.username = ''; // Current username of stars being viewed
    $scope.currentPage = 1; // Current pagination page
    $scope.starsPerPage = 20; // Number of stars per pagination page
    $scope.loading = false; // Loading state of app
    $scope.usernameError = false; // Any error as a result of trying to load data from API
    $scope.allUsernames = []; // All usernames present in localStorage

    /**
     * Start up the app
     */
    $scope.init = function() {
        if (localStorage.length > 0) { // If we have previously used the app and have data stored
            // Load the data for the last used username
            $scope.username = localStorage.currentUsername;

            var userData = $scope.loadUserData($scope.username);

            $scope.stars = userData.stars;
            $scope.availableLanguages = userData.availableLanguages;

            // Get all stored usernames (and tags)
            for (key in localStorage) {
                if (key !== 'currentUsername') {
                    $scope.allUsernames.push(key);
                }
            }
        } else { // If we haven't used the app before, open the settings modal
            $scope.loading = true;

            $scope.settings();
        }
    };

    /**
     * Watch the stars object and when it changes, save it and assemble
     * an array of all available tags
     */
    $scope.$watch('stars', function() {
        // Don't do anything if the app is in a state of loading
        if ($scope.loading) {
            return;
        }

        $scope.saveUserData();

        var newAllTags = [];

        angular.forEach($scope.stars, function(star) {
            angular.forEach(star.tags, function(tag) {
                if (newAllTags.indexOf(tag) === -1) {
                   newAllTags.push(tag);
                }
            });
        });

        $scope.allTags = newAllTags.sort();
    }, true);

    /**
     * Add or remove tags from filter
     */
    $scope.toggleTagFilter = function(tag) {
        var tagIndex = $scope.filterTags.indexOf(tag);

        if (tagIndex === -1) {
            $scope.filterTags.push(tag);
        } else {
            $scope.filterTags.splice(tagIndex, 1);
        }
    };

    /**
     * Save the stars object to localStorage
     */
    $scope.saveUserData = function() {
        var userData = {
            availableLanguages: $scope.availableLanguages,
            stars: $scope.stars
        };

        localStorage[$scope.username] = angular.toJson(userData);
    };

    /**
     * Load the stars object from localStorage
     */
    $scope.loadUserData = function(username) {
        return (typeof localStorage[username] !== 'undefined') ? JSON.parse(localStorage[username]) : [];
    };

    /**
     * Open the settings modal
     */
    $scope.settings = function() {
        $scope.settingsModal = $modal.open({
            templateUrl: 'templates/modal.html',
            scope: $scope,
            size: 'sm'
        });
    };

    /**
     * Load stars from Github and merge with existing saved stars
     */
    $scope.loadStars = function(username) {
        // Validate the one field
        if (username.length == 0) {
            $scope.usernameError = 'Please enter a username';

            return;
        }

        // Close the settings modal
        $scope.settingsModal.close();

        // Put app into loading state
        $scope.loading = true;
        $scope.usernameError = false;
        $scope.username = username;

        // Call GithubAPI service
        GitHubAPI.setUsername(username).getAllStars().then(function(starsData) {
            // Success, so set current username
            localStorage.currentUsername = username;

            // Reset available languages
            $scope.availableLanguages = [];

            // Get stars for the username we are loading, which is not
            // necessarily the same as the one currently on $scope
            var stars = $scope.loadUserData(username).stars || [];

            // Loop through the incoming star data
            angular.forEach(starsData, function(star, index) {
                var language = star.language || 'N/A';

                // Build up new array of available languages
                if ($scope.availableLanguages.indexOf(language) === -1) {
                    $scope.availableLanguages.push(language);
                }

                // Loop through old stars and figure out if we already know about
                // this star...
                var starAlreadyExists = false;

                angular.forEach(stars, function(oldStar, oldStarIndex) {
                    if (oldStar.full_name == star.full_name) {
                        starAlreadyExists = true;

                        // ...if we do, we change its index so it in its correct
                        // place as per the new data...
                        stars[oldStarIndex].index = index;
                    }
                });

                // ...if we don't we push it to the array
                if (!starAlreadyExists) {
                    stars.push({
                        index: index,
                        full_name: star.full_name,
                        author: star.owner.login,
                        name: star.name,
                        description: star.description,
                        searchableText: star.full_name + ' ' + star.description,
                        language: star.language,
                        url: star.html_url,
                        tags: []
                    });
                }
            });

            // Loop though the old stars again and see what's no longer in the
            // new star data, then remove it
            angular.forEach(stars, function(star, index) {
                var starNoLongerExists = true;

                angular.forEach(starsData, function(newStar) {
                    if (star.full_name == newStar.full_name) {
                        starNoLongerExists = false;
                    }
                });

                if (starNoLongerExists) {
                    stars.splice(index, 1);
                }
            });

            // Set $scope stars to new stars array
            $scope.stars = stars;

            // Save stars
            $scope.saveUserData();

            // Come out of loading state
            $scope.loading = false;
        }, function(failure) {
            // Failure, so display error to user and force settings modal open
            $scope.usernameError = failure;

            $scope.settings();
        });
    };
});
