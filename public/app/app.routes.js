angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider
	.when('/',{
		templateUrl: 'app/views/pages/home.html',
		controller: 'MainController as main'
	})
	.when('/login',{
		templateUrl: 'app/views/pages/login.html'
	})
	.when('/signup', {
		templateUrl: 'app/views/pages/signup.html'
	})
	.when('/allStories', {
		templateUrl: 'app/views/pages/allStories.html',
		controller: 'AllStoriesController as story',
		//загрузка до начала показа вида
		resolve: {
			stories: function(Story){
				return Story.allStories();
			}
		}
	})


	$locationProvider.html5Mode(true);

});