angular
.module('githubStarTagger.filters', [])
.filter('paginate', function() {
    // Nice and simple pagination
    return function(input, page, perPage) {
        return input.slice((page - 1) * perPage, page * perPage);
    }
})
.filter('languageFilter', function() {
    // Filter by project language
    return function(input, language) {
        if (language === null) {
            return input;
        }

        var output = [];

        language = (language == 'N/A') ? null : language;

        angular.forEach(input, function(star, index) {
            if (star.language === language) {
                output.push(star);
            }
        });

        return output;
    };
})
.filter('tagFilter', function() {
    // Filter by project's having one of an array of tags,
    // or show all projects if no tags selected
    return function(input, tags) {
        if (tags.length === 0) {
            return input;
        }

        var output = [];

        angular.forEach(input, function(star, index) {
            if (star.tags.filter(function(tag) {
                return tags.indexOf(tag) !== -1;
            }).length > 0) {
                output.push(star);
            }
        });

        return output;
    };
});
