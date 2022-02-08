// 이 파일 앱과 웹 공동으로 사용되는 게임 서버 코드
// server_functions 에 함수 정의해서 여기에 import해서 써도 됨
// 이 곳은 클라이언트(앱, 웹)로부터 json 형식이나 문자열, 정수 등의 데이터를 받아와 게임 룰에 기반하여 데이처 처리 후

// 먄약 데이터를 보내준 클라이언트 한명에게만 답을 할꺼면 emit

// 모두에게 데이터를 공유할 경우 일단 api 사용이라고 표현해주면 됨
// ** 원래 io.to(room).emit 하면 해당 room에 있는 모든 사용자들한테 전송된다고 알고 있을 수도 있지만
// 실제는 이런식("http://graykick.tistory.com/5")으로 동작되기 때문에 위의 코드는 쓰지 말고 저 코드가 필요할 때는 api 사용이라고 표현 부탁

// 다만!! 하나의 프로세스만 이용해서 테스트할때는 io.to(room).emit 써도 되지만 어차피 다 없애야 되는 걸 염두하고 테스트용으로만 썼으면 좋겠다.( 미리 프론트 만들 용도로만 ?)

//===지금은 당장 꼭 엄청 중요한 얘기는 아니지만 참고용 =====
// 최종 생각하는 과정은 하나의 게임이 시작될 때 api를 통해 사용자들이 join할 room 단위로 redis에 channel도 같이 생성해주고 (물론 진행 중인 게임이 종료되면 channel도 바로 삭제)
// room에 join할 때는 api를 통해 redis의 특정 채널을 구독하도록 하고
// 데이터를 공유할 때는 api 파라미터로 데이터를 공유받아야될 대상과 데이터를 써주면 api내에서 pub.sub 매커니즘 기준으로
// publish를 해주어 구독한 클라이언트들에게만 데이터를 뿌려줄 수 있도록 생각만 해놓음

//가능하면 백엔드 모든 코드를 여기에 하지 말고 server_functions에 모듈화해서 여기는 최대한 간소화될 수 있게 부탁

// socket.io 대표 기능을 간단히 적어놓았고 게임 룰에 맞춰 응용하고 주의해야할 점은
// - firebase에 꼭 저장해야 할 정보인지 
// - client와 통신하는 부분 즉, socket.io 쓰는 부분 
//    - client에서 데이터를 받아와 게임 룰에 따라 처리하는 부분은 크게 바뀔일이 없지만
//    - 한명의 client가 자기와 함께 게임하는, 다른, client들 모두에게 데이터 공유 시는 api를 사용해야 하므로 
//    지금 당장 테스트용 코드와 (//이부분 api요청) 설명을 꼭 같이 써주길 바람
//    - 또한 room이름 고유하게! 끝나면 소속되어 있는 모든 클라이언트 leave되게! 쓸데없이 남아있거나 떠도는 room이 없게
//     => 그래서 사용자가 leave를 해서 room에서 나가는 게 아니라 백엔드에서 퀴즈가 끝났다 싶으면 강제로 모든 클라이언트가 room에서 leave하도록 해야될 것 같음
//        해당 코드는 찾아보면 있는 것 같음 (ex) io.of(namespace).in(room).socketsleave(room)) 
//        socket.io버전에 따라 코드가 조금씩 다르니 한번 찾아보길 바람
//        그리고 그곳에 api : redis channel 삭제나 모든 클라이언트 구독 취소 주석 같이 작성


// 주석 안해주면 내가 찾아서 할 때 너무 오래 걸릴 것 같아서 부탁해..ㅜㅜ
// api 빨리 만들껩... 
// 일단 구조는 오늘 싹 다 갈아엎어서 기존 코드는 게임 서버 부분 일부 못쓰게 되서 일단 지금 구성도로 하면 웹 앱 공통으로 쓸 수 있는 서버 코드는 여기에 있고 웹 클라이언트 코드는 react로 있으며 앱 클라이언트 코드는 있다고 가정
// 안드로이드 클라이언트 코드는 좀 짜놨었는데 그거랑 상관없이 게임 서버 자체는 이론적으로 공용 서버 여야 하기 때문에 구조는 이렇게 해야할 것 같음 ( 서버에 클라이언트 코드가 아예 안들어가도록 )
// nodejs router 기능이 react dom router?기능으로로 가는 등 react로 클라이언트를 구현

// 마지막?으로 지금 socket.disconnect 안 넣어놨는데 클라이언트가 게임 서버와 통신이 이제 더 이상 안할 경우
// 해당 사이트에서 나갈 경우 socket이 disconnect 되도록만 해주면 될 것 같음

const url = require('url');

module.exports = (io) => {

    var gameserver = io.of("dynamic-web_OXGame");
    gameserver.on('connection', (socket) => {
        console.log("io-handler.js socket connect!!");
        console.log("socketid : "+ socket.id); 
        // client마다 소켓 id가 다르다. 
        // 따라서 사용자 이름과 소켓 id를 해시값으로 저장해도 됨
        const {ns} = url.parse(socket.handshake.url, true).query;
        console.log(ns);
        socket.on("test", (data) => {
            console.log(data);
            socket.emit("server", "hello22");
        })
        socket.on("join", (data) => { // 이 함수는 클라이언트 단에서 leave를 이름으로 해당 클라이언트 정보를 담아 emit을 해주면 해당 클라이언트를 room에 join 해주는 함수임
            console.log(data);
            //socket.join(data.room);

            // data를 출력했을 때 {"room" : 12345, "username" : "mini"} 라고 한다면
            // socket.io에는 namespace 하위 개념으로 room이 있음
            // room은 게임 그룹 단위로 여기면 될 것 같음 (예를 들어 어몽어스 한 방)
            // room이름(data.room)을 고유번호5자리 등으로 하여 참가자들이 join할 때 마다 즉, 여기 함수로 들어올 때마다
            // firebase에 사용자 이름(data.username)을 해당 룸 하위에 추가하면 될 것 같음
    
        })
        socket.on("leave", (data) => { // 이 함수는 클라이언트 단에서 leave를 이름으로 해당 클라이언트 정보를 담아 emit을 해주면 해당 클라이언트를 room에서 leave해주는 함수임
            console.log(data);
            //socket.leave(data.room);

            // room이름(data.room)을 고유번호5자리 등으로 하여 참가자들이 leave할 때 마다 즉, 여기 함수로 들어올 때마다
            // firebase에 사용자 이름(data.username)을 해당 룸 하위에 제거해주면 될 것 같음
            
        })
        // 그리고 만약 해당 퀴즈가 끝나면 Redis channel 삭제 예정

    })

}