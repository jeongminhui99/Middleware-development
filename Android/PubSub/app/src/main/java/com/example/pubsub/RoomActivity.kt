package com.example.pubsub

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import org.json.JSONException
import org.json.JSONObject
import java.net.URISyntaxException
import java.util.*

class RoomActivity : AppCompatActivity() {

    // Game variables
    var canChoose = false
    var playerOneConnected = false
    var playerTwoIsConnected = false
    var myChoice = ""
    var enemyChoice = ""
    var myScorePoints = 0
    var enemyScorePoints = 0
    var playerId : String ?= null
    var roomId : String ?= null

    lateinit var btn : Button
    lateinit var btn1 : Button
    lateinit var btn2 : Button
    lateinit var create : Button
    lateinit var join : Button
    lateinit var finish : Button
    lateinit var room_name : EditText
    lateinit var player1 : TextView
    lateinit var player2 : TextView
    lateinit var mychoice : TextView
    lateinit var result : TextView
    var mSocket: Socket ?= null


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.join)

        room_name = findViewById(R.id.room_name)
        create = findViewById(R.id.create)
        join = findViewById(R.id.join)
        player1 = findViewById(R.id.text1)
        player2 = findViewById(R.id.text2)
        btn = findViewById(R.id.btn) // 바위
        btn1 = findViewById(R.id.btn1) //가위
        btn2 = findViewById(R.id.btn2) //보
        mychoice = findViewById(R.id.my)
        result = findViewById(R.id.result)
        finish = findViewById(R.id.finish)

        try {
            //IO.socket 메소드는 은 저 URL 을 토대로 클라이언트 객체를 Return 합니다.
            mSocket = IO.socket("http://192.168.35.195:7000")
            mSocket!!.connect()
            Log.d("Connected", "OK")
            println("OK")
        } catch (e: URISyntaxException) {
            Log.e("RoomActivity", e.reason)
            println("no")
        }

        mSocket!!.on(io.socket.client.Socket.EVENT_CONNECT) {
            // 소켓 서버에 연결이 성공하면 호출됩니다.
            Log.i("Socket", "Connect")
            println("OKOK")
        }.on(io.socket.client.Socket.EVENT_DISCONNECT) { args ->
            // 소켓 서버 연결이 끊어질 경우에 호출됩니다.
            Log.i("Socket", "Disconnet: ${args[0]}")
        }.on(Socket.EVENT_CONNECT_ERROR) { args ->
            // 소켓 서버 연결 시 오류가 발생할 경우에 호출됩니다.
            val errorMessage = "error"
            Log.i("Socket", "Connect Error: $errorMessage")
        }

        finish.setOnClickListener {
            mSocket!!.emit("leave", roomId)
        }

        create.setOnClickListener {
//            val nextIntent = Intent(this, GameActivity::class.java)
//            startActivity(nextIntent)
            mSocket!!.emit("create", room_name!!.text)
            roomId = room_name!!.text.toString()
            playerId = "1"
        }

        join.setOnClickListener {
//            val nextIntent = Intent(this, GameActivity::class.java)
//            startActivity(nextIntent)
            mSocket!!.emit("join", room_name!!.text)
            roomId = room_name!!.text.toString()
            playerId = "2"
        }

        btn.setOnClickListener {
            if(canChoose && myChoice == "" && playerOneConnected && playerTwoIsConnected){
                myChoice = "rock"
                var data = JSONObject()
                try {
                    data.put("playerId", playerId.toString())
                    data.put("choice", myChoice)
                    data.put("roomId", roomId.toString())
                    mSocket!!.emit("make-move", data)
                } catch(e : JSONException) {
                    e.printStackTrace();
                }
                //mSocket!!.emit("make-move", {playerId, "rock", roomId})
                mychoice!!.text = "my choice : 바위"
            }

        }
        btn1.setOnClickListener {
            if(canChoose && myChoice == "" && playerOneConnected && playerTwoIsConnected){
                myChoice = "scissor"
                var data = JSONObject()
                try {
                    data.put("playerId", playerId.toString())
                    data.put("choice", myChoice)
                    data.put("roomId", roomId.toString())
                    mSocket!!.emit("make-move", data)
                } catch(e : JSONException) {
                    e.printStackTrace();
                }
                //mSocket!!.emit("make-move", "scissor")
                mychoice!!.text = "my choice : 가위"
            }
        }
        btn2.setOnClickListener {
            if(canChoose && myChoice == "" && playerOneConnected && playerTwoIsConnected){
                myChoice = "paper"
                var data = JSONObject()
                try {
                    data.put("playerId", playerId.toString())
                    data.put("choice", myChoice)
                    data.put("roomId", roomId.toString())
                    mSocket!!.emit("make-move", data)
                } catch(e : JSONException) {
                    e.printStackTrace();
                }
                //mSocket!!.emit("make-move", "paper")
                mychoice!!.text = "my choice : 보"
            }
        }

        mSocket!!.on("error", error)
        mSocket!!.on("room-created", created)
        mSocket!!.on("room-joined", joined)
        mSocket!!.on("player-1-connected", player1_con)
        mSocket!!.on("player-2-connected", player2_con)
        mSocket!!.on("draw", draw)
        mSocket!!.on("player-1-wins", player1_win)
        mSocket!!.on("player-2-wins", player2_win)
        mSocket!!.on("player-1-disconnected", player1_dis)
        mSocket!!.on("player-2-disconnected", player2_dis)

    }

    val player1_dis: Emitter.Listener = Emitter.Listener {
        canChoose = false
        playerOneConnected = false
        playerTwoIsConnected = false
        myScorePoints = 0
        enemyScorePoints = 0
        runOnUiThread {
            player1!!.text = "disconnected"
            player2!!.text = "disconnected"
        }
    }

    val player2_dis: Emitter.Listener = Emitter.Listener {
        canChoose = false
        enemyScorePoints = 0
        myScorePoints = 0
        playerTwoIsConnected = false

        runOnUiThread {
            player2!!.text = "disconnected"
        }
    }

    val draw: Emitter.Listener = Emitter.Listener {
        canChoose = true
        myChoice = ""
        runOnUiThread {
            result!!.text = it[0].toString()
        }
    }
    val player1_win: Emitter.Listener = Emitter.Listener {
        var you = JSONObject(it[0].toString())
        runOnUiThread {
            if(this.playerId == "1"){
                val message = "You choose " + you.getString("myChoice") + " and the enemy choose " + you.getString("enemyChoice") + " . So you win!"
                result!!.text = message
                this.myScorePoints++
            }else{
                val message = "You choose " + you.getString("myChoice") + " and the enemy choose " + you.getString("enemyChoice") + " . So you lose!"
                result!!.text = message
                this.enemyScorePoints++
            }
        }
        canChoose = true
        myChoice = ""
    }
    val player2_win: Emitter.Listener = Emitter.Listener {
        var you = JSONObject(it[0].toString())
        runOnUiThread {
            if(this.playerId == "2"){
                val message = "You choose " + you.getString("myChoice") + " and the enemy choose " + you.getString("enemyChoice") + " . So you win!"
                result!!.text = message
                this.myScorePoints++

            }else{
                val message = "You choose " + you.getString("myChoice") + " and the enemy choose " + you.getString("enemyChoice") + " . So you lose!"
                result!!.text = message
                this.enemyScorePoints++
            }
        }
        canChoose = true
        myChoice = ""
    }

    val player1_con: Emitter.Listener = Emitter.Listener {
        this.playerOneConnected = true
        runOnUiThread {
            player1!!.append(" : Connected!!")
        }
    }

    val player2_con: Emitter.Listener = Emitter.Listener {
        this.playerTwoIsConnected = true
        this.canChoose = true
        runOnUiThread {
            player2!!.append(" : Connected!!")
        }
    }

    val error: Emitter.Listener = Emitter.Listener {
        println("error : " + Arrays.toString(it) + " ${it[0]}")
    }

    val created: Emitter.Listener = Emitter.Listener {
        this.playerId = "1"
        println("created room id : " + Arrays.toString(it) + " ${it[0]}")
        runOnUiThread {
            // Updat UI here
            player1!!.text = "You (Player 1)"
            player2!!.text = "Enemy (Player 2)"

        }
//        if( it[0].toString() == "1" ){
//            playerId = it[0].toString()
//            println("created player 1 : " + " ${it[0]}")
//            runOnUiThread {
//                // Updat UI here
//                playerId = it[0].toString()
//                player1!!.text = "You (Player 1)"
//                player2!!.text = "Enemy (Player 2)"
//            }
//        } else {
//            println("created player 2 : " + " ${it[0]}")
//            runOnUiThread {
//                player1!!.text = "Enemy (Player 1)"
//                player2!!.text = "You (Player 2)"
//            }
//        }
    }

    val joined: Emitter.Listener = Emitter.Listener {
        this.playerId = "2"
        playerOneConnected = true
        println("joined room Id : " + Arrays.toString(it) + " ${it[0]}")
        runOnUiThread {
            player1!!.text = "Enemy (Player 1)"
            player2!!.text = "You (Player 2)"
            player1!!.append(" : Connected!!")
        }
//        if( it[0].toString() == "1" ){
//            println("created player 1 : " + " ${it[0]}")
//            runOnUiThread {
//                // Updat UI here
//                player1!!.text = "You (Player 1)"
//                player2!!.text = "Enemy (Player 2)"
//            }
//        } else {
//            playerId = it[0].toString()
//            println("created player 2 : " + " ${it[0]}")
//            runOnUiThread {
//                playerId = it[0].toString()
//                player1!!.text = "Enemy (Player 2)"
//                player2!!.text = "You (Player 1)"
//            }
//        }
    }

}