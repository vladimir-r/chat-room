var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// имена пользователей, которые в настоящее время подключены к чату
var usernames = {};

// rooms, которые в настоящее время доступны в чате
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {
	
	// когда клиент emit «adduser», server слушает и выполняет
	socket.on('adduser', function(username){
		// сохранить имя пользователя в сеансе сокета для этого клиента
		socket.username = username;
		// сохранить имя room в сеансе сокета для этого клиента
		socket.room = 'room1';
		// добавьте имя пользователя клиента в глобальный список
		usernames[username] = username;
		// отправить клиента в room 1
		socket.join('room1');
		// emit к клиенту, с которым они подключены
		socket.emit('updatechat', 'SERVER', 'вы присоединился к  room1');
		// emit в комнату 1, что человек подключился к своей комнате
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' присоединился к этой комнате');
		socket.emit('updaterooms', rooms, 'room1');
	});
	
	// когда клиент emit «sendchat», server слушает и выполняет
	socket.on('sendchat', function (data) {
		// мы сообщаем клиенту выполнить «updatechat» с двумя параметрами socket.username и data
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// отправлено сообщение в  комнату в которой был клиент
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' покинул комнату');
		// название сессии сеанса обновления
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' присоединился к комнате');
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// когда пользователь отключается 
	socket.on('disconnect', function(){
		// удалить имя пользователя из глобального списка имен пользователей
		delete usernames[socket.username];
		// удалить имя пользователя из глобального списка имен пользователей
		io.sockets.emit('updateusers', usernames);
		// emit глобально , что этот клиент оставил
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});
