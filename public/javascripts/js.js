var socket = io.connect('http://localhost:8080');





	// oпри подключении к серверу, попросите имя пользователя обратным вызовом
	socket.on('connect', function(){
		// вызовите функцию «adduser» на стороне сервера и отправьте один параметр (value of prompt)
		socket.emit('adduser', prompt("What's your name?"));
	});

	// слушает ,всякий раз, когда сервер emit updatechat, клиент  обновляет тело чата
	socket.on('updatechat', function (username, data) {
		if(username=='SERVER'){
			$('#conversation').append('<p class="msg-server"><b >'+username + ':</b> ' + data + '<br></p>');
			
			}
			else{
		$('#conversation').append('<p class="msg-user"><b class="login-user" >'+username + ':</b> <span class="massage">' + data + '</span><br></p>');
			}
	});

	// слушает, всякий раз, когда сервер emit «updaterooms», клиент обновляет комнату, в которой находится клиент
	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});
	});

	function switchRoom(room){
		socket.emit('switchRoom', room);
	}
	
	//
	socket.on('addusers',function(arr){
		$('#users').empty();
		$.each(arr,function(key, value) {
			$('#users').append('<div><a href="#" onclick="switchUser(\''+value+'\')">' + value + '</a></div>');
			
		})
		
	})
	
	// при загрузке страницы
	$(function(){
		// когда клиент нажимает SEND
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			// сообщить серверу выполнить «sendchat» и отправить по одному параметру
			socket.emit('sendchat', message);
		});

		// когда клиент нажимает ENTER на клавиатуре
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('#datasend').focus().click();
			}
		});
	});




