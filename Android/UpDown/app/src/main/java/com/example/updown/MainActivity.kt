package com.example.updown

import android.content.Intent
import android.graphics.Rect
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import io.socket.emitter.Emitter
import org.json.JSONObject
import java.io.*
import java.util.*


class MainActivity : AppCompatActivity() {

    var playerId : String ?= null
    var roomId : String ?= null
    var userId : String ?= null

    lateinit var create : Button
    lateinit var join : Button
    lateinit var room_name : EditText
    lateinit var nickname : EditText
    lateinit var main : ConstraintLayout

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        val focusView: View? = currentFocus
        if (focusView != null) {
            val rect = Rect()
            focusView.getGlobalVisibleRect(rect)
            val x = ev.x.toInt()
            val y = ev.y.toInt()
            if (!rect.contains(x, y)) {
                val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
                imm?.hideSoftInputFromWindow(focusView.getWindowToken(), 0)
                focusView.clearFocus()
            }
        }
        return super.dispatchTouchEvent(ev)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        main = findViewById(R.id.main)
        main.setOnClickListener {
            //hideKeyboard()
        }
        create = findViewById(R.id.create)
        join = findViewById(R.id.join)
        room_name = findViewById(R.id.room_id)
        nickname = findViewById(R.id.user_id)

        SocketHandler.setSocket()
        SocketHandler.establishConnection()


        val mSocket = SocketHandler.getSocket()

        mSocket!!.emit("game", "updown")

        create.setOnClickListener {
            var create = JSONObject()
            create.put("room_name", room_name!!.text)
            create.put("nickname", nickname!!.text)
            mSocket!!.emit("create", create)
            roomId = room_name!!.text.toString()
            userId = nickname!!.text.toString()
            playerId = "1"
        }

        join.setOnClickListener {
            var join = JSONObject()
            join.put("room_name", room_name!!.text)
            join.put("nickname", nickname!!.text)
            mSocket!!.emit("join", join)
            roomId = room_name!!.text.toString()
            userId = nickname!!.text.toString()
            playerId = "2"
        }
        mSocket!!.on("error", error)
        mSocket!!.on("room-created", created)
        mSocket!!.on("room-joined", joined)
    }

    val error: Emitter.Listener = Emitter.Listener {
        println("error : " + Arrays.toString(it) + " ${it[0]}")
    }

    val created: Emitter.Listener = Emitter.Listener {
        this.playerId = "1"
        println("created room id : " + Arrays.toString(it) + " ${it[0]}")
        runOnUiThread {
            // Updat UI here
            var intent = Intent(this, ConnectActivity::class.java)
            intent.putExtra("player", 1)
            intent.putExtra("room_name", room_name!!.text.toString())
            startActivity(intent)
        }

    }

    val joined: Emitter.Listener = Emitter.Listener {
        this.playerId = "2"
        //playerOneConnected = true
        println("joined room Id : " + Arrays.toString(it) + " ${it[0]}")
        runOnUiThread {
            var intent = Intent(this, ConnectActivity::class.java)
            intent.putExtra("player", 2)
            intent.putExtra("room_name", room_name!!.text.toString())
            startActivity(intent)
            //player1!!.text = "Enemy (Player 1)"
            //player2!!.text = "You (Player 2)"
            //player1!!.append(" : Connected!!")
        }
    }

}