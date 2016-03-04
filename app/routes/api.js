var User = require('../models/user.js');
var Story = require('../models/story.js');
var config = require('../../config.js');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
    var token = jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username
    }, secretKey, {
        expiresInMinute: 1440
    });

    return token;
}

module.exports = function(app, express, io) {
    var api = express.Router();

    api.post('/signup', function(req, res) {
        var user = new User({
            name: req.body.name,
            password: req.body.password
        });
        //создаем токен
        var token = createToken(user);
        user.save(function(err) {
            if (err) {
                res.send(err);
                return;
            }
            res.json({
                success: true,
                message: 'User has been created',
                token: token
            });
        });
    });

    api.post('/login', function(req, res) {
        User.findOne({
            username: req.body.name
                //выбираем name username password чтобы передать их дальше
        }).select('name password').exec(function(err, user) {
            if (err) throw err;

            if (!user) {
                res.send({ message: "Некорректные данные" });
            } else if (user) {
                var validPassword = user.comparePassword(req.body.password);

                if (!validPassword) {
                    res.send({ message: "Неверный пароль" });
                } else {
                    // token
                    var token = createToken(user);
                    res.json({
                        success: true,
                        message: "Successfully login",
                        token: token
                    });
                }
            }
        });
    });

    api.use(function(req, res, next) {
        console.log("Somebody just came to our app!");

        // var token = req.body.token || req.param('token') || req.headers['x-access-token'];
        var token = req.query['x-access-token'] || req.headers['x-access-token'];

        console.log("token: " + token);

        // check if token exist
        if (token) {
            jsonwebtoken.verify(token, secretKey, function(err, decoded) {
                if (err) {
                    res.status(403).send({ success: false, message: "Failed to authenticate user" });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(403).send({ success: false, message: "No token Provided" });
        }
    });
    


    api.get('/all_stories', function(req, res) {
        Story.find().populate('creator').exec(function(err, stories) {

            if (err) {
                res.send(err);
                return;
            }
            res.json(stories);

        });
    });


    // Destination B // provide a logitimate token

    api.route('/')
        .post(function(req, res) {
            var story = new Story({
                creator: req.decoded.id,
                content: req.body.content
            });
            story.save(function(err, newStory) {
                if (err) {
                    res.send(err);
                    return;
                }
                io.emit('story', newStory);
                res.json({ message: "New Story Created!" });
            });
        })
        .get(function(req, res) {
            Story
            .find({creator: req.decoded.id })
            .sort({created: -1})
            .exec(function(err, stories) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json(stories);
            });
        });

    api.post('/story_delete', function(req, res){
      
        Story.find({ _id: req.body.storyId}).remove(function(err){

            if(err){
                res.send(err);
                return;
            }

            res.send({deleted: true});
        })
    });

    api.get('/me', function(req, res) {
        res.json(req.decoded);
    });

    return api;
};
