
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/datepicker/datepicker.html","<div class=\"form-group {{form.htmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n  <div ng-class=\"{\'input-group\': (form.fieldAddonLeft || form.fieldAddonRight)}\">\n    <span ng-if=\"form.fieldAddonLeft\"\n          class=\"input-group-addon\"\n          ng-bind-html=\"form.fieldAddonLeft\"></span>\n    <scheme-date-picker placeholder=\"{{from.placeholder}}\"  ngDisabled=\"form.readonly\" HtmlClass=\"{{form.fieldHtmlClass}}\" form=\"{{form}}\" name=\"{{form.key.slice(-1)[0]}}\" ng-model=\"$$value$$\"></scheme-date-picker>\n    <span ng-if=\"form.fieldAddonRight\"\n          class=\"input-group-addon\"\n          ng-bind-html=\"form.fieldAddonRight\"></span>\n  </div>\n  <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/datepicker/datetimepicker.html","<div class=\"form-group {{form.htmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n  <div ng-class=\"{\'input-group\': (form.fieldAddonLeft || form.fieldAddonRight)}\">\n    <span ng-if=\"form.fieldAddonLeft\"\n          class=\"input-group-addon\"\n          ng-bind-html=\"form.fieldAddonLeft\"></span>\n    <scheme-date-time-picker placeholder=\"{{from.placeholder}}\"  ngDisabled=\"form.readonly\" HtmlClass=\"{{form.fieldHtmlClass}}\" form=\"{{form}}\" name=\"{{form.key.slice(-1)[0]}}\" ng-model=\"$$value$$\"></scheme-date-time-picker>\n    <span ng-if=\"form.fieldAddonRight\"\n          class=\"input-group-addon\"\n          ng-bind-html=\"form.fieldAddonRight\"></span>\n  </div>\n  <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/datepicker/timepicker.html","<div class=\"form-group {{form.htmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n  <div ng-class=\"{\'input-group\': (form.fieldAddonLeft || form.fieldAddonRight)}\">\n    <span ng-if=\"form.fieldAddonLeft\"\n          class=\"input-group-addon\"\n          ng-bind-html=\"form.fieldAddonLeft\"></span>\n    <scheme-time-picker placeholder=\"{{from.placeholder}}\"  ngDisabled=\"form.readonly\" HtmlClass=\"{{form.fieldHtmlClass}}\" form=\"{{form}}\" name=\"{{form.key.slice(-1)[0]}}\" ng-model=\"$$value$$\"></scheme-time-picker>\n    <span ng-if=\"form.fieldAddonRight\"\n          class=\"input-group-addon\"\n          ng-bind-html=\"form.fieldAddonRight\"></span>\n  </div>\n  <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/typeahead/typeahead.html","<div class=\"form-group {{form.htmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n    <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n    \n    <div ng-class=\"{\'input-group\': (form.fieldAddonLeft || form.fieldAddonRight)}\" class=\"typeahead\">\n        <span ng-if=\"form.fieldAddonLeft\"\n              class=\"input-group-addon\"\n              ng-bind-html=\"form.fieldAddonLeft\"></span>\n        <input ng-show=\"form.key\"\n               type=\"text\"\n               class=\"form-control {{form.fieldHtmlClass}}\"\n               schema-validate=\"form\"\n               ng-model=\"$$value$$\"\n               typeahead-template-url=\"{{form.typeaheadTemplate}}\"\n               typeahead=\"{{form.typeahead}}\"\n               typeahead-on-select=\"{{form.typeaheadOnSelect}}\"\n               name=\"{{form.key.slice(-1)[0]}}\"\n  ngDisabled=\"form.readonly\"\n  autocomplete=\"off\" />\n        <span ng-if=\"form.fieldAddonRight\"\n              class=\"input-group-addon\"\n              ng-bind-html=\"form.fieldAddonRight\"></span>\n    </div>\n    <span class=\"help-block\" sf-message=\"form.description\"></span>\n</div>");}]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/richeditor/richeditor.html","<div class=\"form-group {{form.fieldHtmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n  <textarea style=\"width:100%;max-height:400px;\" initconfig=\"form.config\" height=\"form.height\" ueditor ng-model=\"$$value$$\"></textarea>\n    <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);
//angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/fileuploader/fileuploader.html","<FileUploader directiveid=\"form.id\" fileAccept=\"form.fileAccept\" maxsize=\"form.maxsize\" recordid=\"$$value$$\"></FileUploader>\n");}]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/fileuploader/fileuploader.html","<div class=\"form-group {{form.fieldHtmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n <FileUploader ng-model=\"$$value$$\" file-accept=\"{{form.fileAccept}}\"  directiveid=\"{{form.id}}\"></FileUploader>\n </div>\n");}]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/multiselect/multiselect.html","<div class=\"form-group {{form.fieldHtmlClass}}\" ng-class=\"{\'has-error\': hasError()}\">\n  <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n  <div isteven-multi-select selection-mode = \"form.selectioned\" input-model=\"form.inputmodel\" output-model=\"$$value$$\" default-label=\"{{form.defaultlabel}}\" max-height=\"180px\" button-label=\"{{form.buttonlabel}}\" item-label=\"{{form.itemlabel}}\" tick-property=\"{{form.tickproperty}}\" output-properties=\"{{form.outputproperties}}\"></div>\n    <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n</div>\n");}]);



angular.module('schemaForm').directive('schemeDatePicker', function () {
    var formatDate = function(value) {
        //Strings or timestamps we make a date of
        if (angular.isString(value) || angular.isNumber(value)) {
            return new Date(value);
        }
        return value; //We hope it's a date object
    };

    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            name: '@',
            placeholder: '@',
            ngClass: '=',
            ngRequired: '@',
            HtmlClass : '@',
            form : '@',
            ngDisabled : '@'
        },
        replace: true,
        template: '<div>' +
            '<input style="background-color: white" type="text" class="form-control {{HtmlClass}}" schema-validate="form" ng-disabled="ngDisabled" name="{{name}}" placeholder="{{placeholder}}" ng-model="ngModel"/>' +
            '</div>',
        link: function (scope, element, attrs, ngModel) {
            var input = element.find('input');
            input.datetimepicker({
                format: "yyyy-mm-dd",
                showMeridian: false,
                minView: "month",
                autoclose: true,
                todayBtn: true,
                todayHighlight: true,
                language: "zh-CN",
                pickerPosition: "bottom-right"
            });

            var defaultFormat = 'yyyy-mm-dd';
        }
    }
});
angular.module('schemaForm').directive('schemeDateTimePicker', function () {
    var formatDate = function(value) {
        //Strings or timestamps we make a date of
        if (angular.isString(value) || angular.isNumber(value)) {
            return new Date(value);
        }
        return value; //We hope it's a date object
    };

    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            name: '@',
            placeholder: '@',
            ngClass: '=',
            ngRequired: '@',
            HtmlClass : '@',
            form : '@',
            ngDisabled : '@'
        },
        replace: true,
        template: '<div>' +
            '<input style="background-color: white" type="text" class="form-control {{HtmlClass}}" schema-validate="form" ng-disabled="ngDisabled" name="{{name}}" placeholder="{{placeholder}}" ng-model="ngModel"/>' +
            '</div>',
        link: function (scope, element, attrs, ngModel) {
            var input = element.find('input');
            input.datetimepicker({
                format: "yyyy-mm-dd hh:ii",
                showMeridian: false,
                minView: "hour",
                autoclose: true,
                todayBtn: true,
                todayHighlight: true,
                language: "zh-CN",
                pickerPosition: "bottom-right"
            });

            var defaultFormat = 'yyyy-mm-dd hh:ii';
        }
    }
});
angular.module('schemaForm').directive('schemeTimePicker', function () {
    var formatDate = function(value) {
        //Strings or timestamps we make a date of
        if (angular.isString(value) || angular.isNumber(value)) {
            return new Date(value);
        }
        return value; //We hope it's a date object
    };

    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            name: '@',
            placeholder: '@',
            ngClass: '=',
            ngRequired: '@',
            HtmlClass : '@',
            form : '@',
            ngDisabled : '@'
        },
        replace: true,
        template: '<div>' +
            '<input style="background-color: white" type="text" class="form-control {{HtmlClass}}" schema-validate="form" ng-disabled="ngDisabled" name="{{name}}" placeholder="{{placeholder}}" ng-model="ngModel"/>' +
            '</div>',
        link: function (scope, element, attrs, ngModel) {
            var input = element.find('input');
            input.datetimepicker({
                format: "hh:ii",
                showMeridian: false,
                maxView:"hour",
                autoclose: true,
                todayBtn: true,
                todayHighlight: true,
                language: "zh-CN",
                pickerPosition: "bottom-right"
            });

            var defaultFormat = 'hh:ii';
        }
    }
});

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {
            var schemedatepicker = function(name, schema, options) {
                if (schema.type === 'string' && schema.format == 'date') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key  = options.path;
                    f.type = 'schemedatepicker';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };
            var schemedatetimepicker = function(name, schema, options) {
                if (schema.type === 'string' && schema.format == 'datetime') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key  = options.path;
                    f.type = 'schemedatetimepicker';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };
            var schemetimepicker = function(name, schema, options) {
                if (schema.type === 'string' && schema.format == 'time') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key  = options.path;
                    f.type = 'schemetimepicker';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };
            var typeahead = function (name, schema, options) {
                if (schema.type === 'string' && schema.format === 'typeahead') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'typeahead';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };
            var richeditor = function (name, schema, options) {
                if (schema.type === 'string' && schema.format === 'richeditor') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'richeditor';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };
            var multiselect = function (name, schema, options) {
                if (schema.type === 'string' && schema.format === 'multiselect') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'multiselect';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };
            var fileuploader = function (name, schema, options) {
                if (schema.type === 'string' && schema.format === 'file') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'fileuploader';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.string.unshift(schemedatepicker);
            schemaFormProvider.defaults.string.unshift(schemedatetimepicker);
            schemaFormProvider.defaults.string.unshift(schemetimepicker);
            schemaFormProvider.defaults.string.unshift(typeahead);
            schemaFormProvider.defaults.string.unshift(richeditor);
            schemaFormProvider.defaults.string.unshift(fileuploader);
            schemaFormProvider.defaults.string.unshift(multiselect);

            //Add to the bootstrap directive
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'schemedatepicker','directives/decorators/bootstrap/datepicker/datepicker.html');
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'schemedatetimepicker','directives/decorators/bootstrap/datepicker/datetimepicker.html');
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'schemetimepicker','directives/decorators/bootstrap/datepicker/timepicker.html');
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator','typeahead','directives/decorators/bootstrap/typeahead/typeahead.html');
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator','richeditor','directives/decorators/bootstrap/richeditor/richeditor.html');
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator','fileuploader','directives/decorators/bootstrap/fileuploader/fileuploader.html');
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator','multiselect','directives/decorators/bootstrap/multiselect/multiselect.html');

            schemaFormDecoratorsProvider.createDirective('schemedatepicker','directives/decorators/bootstrap/datepicker/datepicker.html');
            schemaFormDecoratorsProvider.createDirective('schemedatetimepicker','directives/decorators/bootstrap/datepicker/datetimepicker.html');
            schemaFormDecoratorsProvider.createDirective('schemetimepicker','directives/decorators/bootstrap/datepicker/timepicker.html');
            schemaFormDecoratorsProvider.createDirective('typeahead','directives/decorators/bootstrap/typeahead/typeahead.html');
            schemaFormDecoratorsProvider.createDirective('richeditor','directives/decorators/bootstrap/richeditor/richeditor.html');
            schemaFormDecoratorsProvider.createDirective('fileuploader','directives/decorators/bootstrap/fileuploader/fileuploader.html');
            schemaFormDecoratorsProvider.createDirective('multiselect','directives/decorators/bootstrap/multiselect/multiselect.html');
        }]);
