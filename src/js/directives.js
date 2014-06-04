angular
.module('githubStarTagger.directives', [])
.directive('selectize', function($timeout) {
    return {
        restrict: 'A',
        require: '^ngModel',
        link: function(scope, element, attrs, ngModel) {
            // Set up config values and initiate selectize
            var config = scope.$eval(attrs.selectize);
                config.options = scope.$eval(attrs.options);

            config.options = config.options.map(formatOption);

            config.create = formatOption;

            element.selectize(config);

            var selectize = element[0].selectize;

            // Watch model of all available options, shared amongst
            // all selectize instances
            scope.$watch(attrs.options, updateOptions, true);

            // Watch tags on scope and update selectize as required
            scope.$watch(function() {
                return ngModel.$modelValue;
            }, function(newValue, oldValue) {
                updateOptions(newValue, oldValue);

                $timeout(function() {
                    selectize.setValue(newValue);
                });
            }, true);

            /**
             * Format value to correct format for selectize
             */
            function formatOption(value) {
                return {
                    text: value,
                    value: value
                }
            }

            /**
             * Add what needs to be added to the available option,
             * remove what needs to be removed
             */
            function updateOptions(newValue, oldValue) {
                $timeout(function() {
                    if (newValue != oldValue) {
                        angular.forEach(newValue, function(tag) {
                            selectize.addOption(formatOption(tag));
                        });

                        angular.forEach(oldValue, function(tag) {
                            if (newValue.indexOf(tag) === -1) {
                                selectize.removeOption(tag);
                            }
                        });
                    }
                });
            }
        }
    };
});
