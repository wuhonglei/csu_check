angular.module('myApp', ['mgcrea.ngStrap', 'ngSanitize', 'ngRoute', 'showTableService', 'showRangeDateServie', 'showChartService', 'showLabTableDetail', 'ShowTableFilter', 'ngSanitize', 'ngCsv', 'defaultEnter'])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider

        // route for the home page
            .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'TableCtrl'
        })

        // 路由到数据分析界面
        .when('/data-analysis', {
            templateUrl: 'partials/data-analysis.html',
            controller: 'AnalysisCtrl'
        })

        .otherwise({
            redirectTo: '/'
        });

        // use the HTML5 History API
        // $locationProvider.html5Mode(true);
    });
