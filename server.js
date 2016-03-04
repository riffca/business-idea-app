var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect(config.database, err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the database');
    }
});




// Установим middleware app.use то все middleware
app.use(bodyParser.urlencoded({ extended: true }));
//если поставить true то он будет парсить только сроки
//а так парсит и картинки и видео и документы
app.use(bodyParser.json());
app.use(morgan('dev'));
//логинг всех взаимодействий с сервером в консоль
//статик сервер нужен для того чтобы рендерить css из 
//других папок
app.use(express.static(__dirname + '/public'));



var api = require('./app/routes/api')(app, express, io);
//мы использовали app и express в качестве параметров, что и делаем сейчас
//префикс
app.use('/api', api);


app.post('/post', (req, res) => {
	res.send(req.headers);

});



app.get('*', (req, res) => {
    //если поставить более глубокую папку, 
    //то из самого html ссылки на скрипты
    //можно делать как будето мы находимся в коневой папке 
    res.sendFile(__dirname + '/public/app/views/index.html');
});

http.listen(config.port, err => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Server listen on Port ${config.port}`);
    }
});
