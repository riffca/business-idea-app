angular.module('stories', [

    'appRoutes',
    'reverseDirective',
    'mainCtrl',
    'authService',
    'userCtrl',
    'userService',
    'storyService',
    'storyCtrl'
    
])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
})
