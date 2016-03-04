angular.module('storyCtrl', [])

.controller('StoryController', function(Story, Socket) {
    //не забываем смотреть где мы присваиваем vm
    var vm = this;


    Story.getStories()
        .success(function(data) {
            vm.stories = data;
        });

    vm.createStory = function() {
        vm.message = '';

        Story.create(vm.storyData)
            .success(function(data) {
                //clear the form

                vm.messsage = data.message;
                //vm.stories.push(vm.storyData);
                vm.storyData = '';

            });
    }
    vm.deleteStory = function($index) {

        Story.delete(vm.stories[$index]._id)
            .then(function(res) {

                if (res.data.deleted) {
                    vm.stories.splice($index, 1);
                }
            });
    }

    Socket.on('story', function(data) {
        //console.log(data);
        vm.stories.unshift(data);
    });
})

.controller('AllStoriesController', function(stories, Socket) {
    var vm = this;
    //получаем stories из resolve
    //console.log(stories);
    vm.stories = stories.data;

    Socket.on('story', function(data) {
        //console.log(data); 
        vm.stories.push(data);
    })
});
