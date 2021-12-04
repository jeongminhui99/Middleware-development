package com.example.updown

import android.content.Intent
import android.graphics.Rect
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import io.socket.emitter.Emitter
import org.json.JSONObject

class UpDownActivity : AppCompatActivity() {

    lateinit var player1 : TextView
    lateinit var player2 : TextView
    lateinit var player1_hint : TextView
    lateinit var arrow1 : ImageView
    lateinit var arrow2 : ImageView
    lateinit var num : EditText
    lateinit var submit : Button
//    lateinit var finish : Button

    var player_id : Int ?= null
    var room_name : String ?= null
    var turn : Int = 1

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
        setContentView(R.layout.game_main)
        player_id = 2

        player1 = findViewById(R.id.player1)
        player2 = findViewById(R.id.player2)
        arrow1 = findViewById(R.id.arrow1)
        arrow2 = findViewById(R.id.arrow2)
        submit = findViewById(R.id.submmit)
        num = findViewById(R.id.num)
        player1_hint = findViewById(R.id.player1_hint)

        val mSocket = SocketHandler.getSocket()
        var intent = intent
        room_name = intent.getStringExtra("room_name").toString()

        if(turn == 1){
            arrow2.visibility = View.INVISIBLE
            arrow1.visibility = View.VISIBLE
            player1.setTextColor(resources.getColor(R.color.pink))
            player2.setTextColor(resources.getColor(R.color.black))
        } else {
            arrow1.visibility = View.INVISIBLE
            arrow2.visibility = View.VISIBLE
            player2.setTextColor(resources.getColor(R.color.pink))
            player1.setTextColor(resources.getColor(R.color.black))
        }

        submit.setOnClickListener {

            var s = JSONObject()
            s.put("try_num", num!!.text.toString())
            s.put("room", room_name.toString())
            s.put("player", player_id.toString())
            mSocket!!.emit("game", s)
        }

//        finish.setOnClickListener {
//            var f = JSONObject()
//            f.put("room", room_name.toString())
//            f.put("player", player_id.toString())
//            mSocket!!.emit("finish", f)
//        }

        mSocket!!.on("turn", player_turn)
        mSocket!!.on("game_ans", ans)
        mSocket!!.on("player-1-disconnected", player1_dis)
        mSocket!!.on("player-2-disconnected", player2_dis)
    }

    val player1_dis: Emitter.Listener = Emitter.Listener {
        var intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    val player2_dis: Emitter.Listener = Emitter.Listener {
        var intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }
    val ans: Emitter.Listener = Emitter.Listener {
        runOnUiThread {
            player1_hint!!.text = "HINT : " + it[0].toString()
        }
    }

    val player_turn: Emitter.Listener = Emitter.Listener {
        runOnUiThread {
            if (it[0].toString() == "1"){
                arrow2.visibility = View.INVISIBLE
                arrow1.visibility = View.VISIBLE
                player1.setTextColor(resources.getColor(R.color.pink))
                player2.setTextColor(resources.getColor(R.color.black))
            } else if (it[0].toString() == "2"){
                arrow1.visibility = View.INVISIBLE
                arrow2.visibility = View.VISIBLE
                player2.setTextColor(resources.getColor(R.color.pink))
                player1.setTextColor(resources.getColor(R.color.black))
            }
        }
    }

}