package com.example.updown

import android.content.Intent
import android.graphics.Rect
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import io.socket.emitter.Emitter
import org.json.JSONObject
import java.util.*

class ConnectActivity : AppCompatActivity() {
    lateinit var player1 : TextView
    lateinit var player2 : TextView
    lateinit var start : Button

    var playerOneConnected = false
    var playerTwoIsConnected = false
    var canchoose = false

    var player_id : Int ?= null
    var room_name : String ?= null

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
        setContentView(R.layout.connect)

        player1 = findViewById(R.id.player1)
        player2 = findViewById(R.id.player2)
        start = findViewById(R.id.start)

        val mSocket = SocketHandler.getSocket()
        var intent = intent
        player_id = intent.getIntExtra("player", 0)
        room_name = intent.getStringExtra("room_name").toString()
        println("joined room Id22 : " + room_name)
        if(player_id == 1){
            player1!!.text = "You (Player 1)"
            player2!!.text = "Enemy (Player 2)"
            var p1 = JSONObject()
            p1.put("player", player_id.toString())
            p1.put("room", room_name)
            mSocket!!.emit("player_con", p1)
        } else if(player_id == 2){
            this.playerOneConnected = true
            player1!!.text = "Enemy (Player 1)"
            player2!!.text = "You (Player 2)"
            var p2 = JSONObject()
            p2.put("player", player_id.toString())
            p2.put("room", room_name)
            mSocket!!.emit("player_con", p2)
        }

        start.setOnClickListener {
            if(player_id == 1 && playerOneConnected == true && playerTwoIsConnected == true){
                var intent = Intent(this, QuizActivity::class.java)
                intent.putExtra("room_name", room_name.toString())
                startActivity(intent)
            } else if(player_id == 2 && playerOneConnected == true && playerTwoIsConnected == true){
                var intent = Intent(this, UpDownActivity::class.java)
                intent.putExtra("room_name", room_name.toString())
                startActivity(intent)
            }

        }


        mSocket!!.on("player-1-connected", player1_con)
        mSocket!!.on("player-2-connected", player2_con)

    }



    val player1_con: Emitter.Listener = Emitter.Listener {
        this.playerOneConnected = true
        runOnUiThread {
            player1!!.setTextColor(resources.getColor(R.color.teal_200))
        }
    }

    val player2_con: Emitter.Listener = Emitter.Listener {
        this.playerTwoIsConnected = true
        this.canchoose = true
        runOnUiThread {
            player1!!.setTextColor(resources.getColor(R.color.teal_200))
            player2!!.setTextColor(resources.getColor(R.color.teal_200))
        }
    }
}