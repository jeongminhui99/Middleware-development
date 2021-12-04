const updown_rooms = {};
const updown_connectedUsers = {};
var updown_ans = "";
//const choices = {};


var ud = function(socket) {
    socket.on('create', function(data){
        console.log("Got 'sendMessage' from android , create room name : " + data.room_name);
        console.log("clientId : " + socket.client.id);
        console.log("nickname : " + data.nickname);
    
        if(updown_rooms[data.room_name]){
            const error = "This room already exists";
            socket.emit("error", error);
        }else{
            updown_connectedUsers[socket.client.id] = true;
            updown_rooms[data.room_name] = [data.nickname, ""];
            socket.emit("room-created", data.room_name);
            //socket.emit("player-1-connected");
            socket.join(data.room_name);
        }
    });

    socket.on('join', function(data){
        console.log("Got 'sendMessage' from android , join room name : " + data.room_name);
        console.log("clientId : " + socket.client.id);
        console.log("nickname : " + data.nickname);
        //socket.to("chat").emit('message', "join room name : " + data);
    
        if(!updown_rooms[data.room_name]){
            const error = "This room doen't exist";
            socket.emit("error", error);
        }else{
            updown_connectedUsers[socket.client.id] = true;
            updown_rooms[data.room_name][1] = data.nickname;
            socket.join(data.room_name);
            socket.emit("room-joined", data.room_name);
            //socket.emit("player-2-connected"); 
            //socket.broadcast.to(data.room_name).emit("player-2-connected");
            //choices[data] = ["", ""]
        }
    });

    socket.on('player_con', function(data){
        console.log("player_con")
        if (data.player == "1"){
            socket.emit("player-1-connected");
            socket.join(data.room);
        } else if (data.player == "2"){
            socket.emit("player-2-connected");
            socket.broadcast.to(data.room).emit("player-2-connected");
        } 
        
    });

    socket.on('quiz_num', function(data){
        console.log("answer num is ", data.num);
        console.log("room is ", data.room);
        updown_ans = data.num;
        socket.emit("turn", "2");    
        socket.broadcast.to(data.room).emit("turn", "2");        
    });

    socket.on('game', function(data){
        if (data.player == "1"){
            console.log("game player1 : ", data.room, "_", data.hint);
            socket.broadcast.to(data.room).emit("game_ans", data.hint);
            socket.emit("turn", "2");    
            socket.broadcast.to(data.room).emit("turn", "2");     
        } else if (data.player == "2"){
            console.log("game player2 : ", data.room, "_", data.try_num);
            socket.broadcast.to(data.room).emit("game_ans", data.try_num);    
            socket.emit("turn", "1");    
            socket.broadcast.to(data.room).emit("turn", "1");     
        }
     
    });

    socket.on('finish', function(data){
        if (data.player == "1"){
            updown_connectedUsers[socket.client.id] = false;
            delete updown_rooms[data.room];
            io.to(roomId).emit("player-1-disconnected");
            //io.to(roomId).emit("player-2-disconnected");
            socket.leave(data.room)

        }else if (data.player == "2"){
            updown_connectedUsers[socket.client.id] = false;
            updown_rooms[data.room][1] = "";
            io.to(roomId).emit("player-2-disconnected");
            socket.leave(data.room)
        }
    });
}

module.exports = ud