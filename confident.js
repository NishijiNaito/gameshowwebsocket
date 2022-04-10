const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");

const app = new App();
const io = new Server({
    origins: ["*"],
    cors: {
        // methods: ["GET", "POST"],
        allowedHeaders: ["Access-Control-Allow-Origin:*"],
        // credentials: true
    }
});


io.attachApp(app);


// ตัวแปร
let isCanRegister = true
    // -1 - register  0 - prepare 1 - ShowQuestion 2 - Show Player Answer (Cannot Answered) 3 - Show Correct Answer (include calculate)
let inGameStage = -1
let gameMode = null
let arrPlayerlist = []
let arrPlayerdata = {}
let question = {
    question: "",
    questionexplain: "",
    answer: "",
    answerPrefix: "",
    answerSuffix: "",
}


io.on("connection", (socket) => {
    // console.log(socket.id + " was connected")
    socket.playername = "Annonymous"

    //check_can_register when client haven't name

    socket.on("check_can_register", () => {
        if (isCanRegister == false) { // Can register
            socket.emit("move_to_viewer")

        } else { // not register
        }
    })

    //register player when submit or registered before play
    socket.on("register", (data) => {
        console.log(data)

        if (searchStringInArray(data.name, arrPlayerlist) == -1) { //name not in register
            if (isCanRegister) { // Can register
                arrPlayerlist.push(data.name)
                socket.playername = data.name
                console.log(arrPlayerlist)
                socket.emit("waiting_time")
                socket.broadcast.emit("adm_info", { isCanRegister, arrPlayerlist, inGameStage })
                socket.broadcast.emit("view_info", { isCanRegister, arrPlayerlist, inGameStage })

            } else { // can not register
                socket.playername = data.name
                socket.emit("move_to_viewer")
            }
        } else { // name in register
            socket.playername = data.name
            if (inGameStage == -1) { // register time
                socket.emit("waiting_time")
            } else {
                socket.emit("game_info", { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
            }
        }

    })

    socket.on("adm_logon", () => {
        if (inGameStage == -1) { // register time
            socket.emit("adm_info", { isCanRegister, arrPlayerlist, inGameStage })
        } else {
            socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })

        }
    })

    socket.on("view_data", () => {
        if (inGameStage == -1) { // register time
            socket.emit("view_info", { isCanRegister, arrPlayerlist, inGameStage })
        } else {
            socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })

        }
    })

    socket.on("start_game", (data) => {
        console.log("Admin Start Game")
        console.log(data)
        isCanRegister = false
        inGameStage = 0
        gameMode = data.gamemode

        start_game(socket)
    })

    socket.on("submit_question", (data) => {
        console.log("submit question")
        question = data
        inGameStage = 1
        console.log(question)
        socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        socket.broadcast.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
    })

    socket.on("submit_answer", (data) => {
        console.log(socket.playername + " submit answer")
        arrPlayerdata[socket.playername].min = data.min
        arrPlayerdata[socket.playername].max = data.max
        arrPlayerdata[socket.playername].size = data.size
        arrPlayerdata[socket.playername].lock_down = true
        socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        socket.broadcast.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        console.log(data)
    })

    socket.on("show_player_answer", () => {
        console.log("show answer")

        inGameStage = 2
        socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        socket.broadcast.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
            // console.log(data)
    })
    socket.on("reveal_answer", () => {
        console.log("reveal answer")

        inGameStage = 3

        cal_answer()

        socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        socket.broadcast.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
            // console.log(data)
    })

    socket.on("reset_question", () => {
        console.log("reset question")
        inGameStage = 0

        //reset question 

        question = {
            question: "",
            questionexplain: "",
            answer: "",
            answerPrefix: "",
            answerSuffix: "",
        }

        //reset status
        arrPlayerlist.forEach(pl => {
            // arrPlayerdata[pl] = {
            //     min: null,
            //     max: null,
            //     size: null,
            //     lock_down: false,
            //     answer_status: "", // correct_smallest,correct,correct_largest,incorrect
            //     score: 0
            // }

            arrPlayerdata[pl].min = null
            arrPlayerdata[pl].max = null
            arrPlayerdata[pl].size = null
            arrPlayerdata[pl].lock_down = false
            arrPlayerdata[pl].answer_status = ""

        });



        socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        socket.broadcast.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })

    })
    socket.on("reset_game", () => {
        console.log("reset Game")
        inGameStage = -1
        isCanRegister = true
            //reset question 

        arrPlayerlist = []
        arrPlayerdata = {}
        question = {
            question: "",
            questionexplain: "",
            answer: "",
            answerPrefix: "",
            answerSuffix: "",
        }



        socket.emit('reset_game')
        socket.broadcast.emit('reset_game')

    })



    socket.on("disconnect", (reason) => {
        if (isCanRegister) { // can regis remove
            place = searchStringInArray(socket.playername, arrPlayerlist)
            if (place != -1) {
                arrPlayerlist.splice(place, 1)
                console.log(arrPlayerlist)
                socket.broadcast.emit("adm_info", { isCanRegister, arrPlayerlist, inGameStage })
                socket.broadcast.emit("view_info", { isCanRegister, arrPlayerlist, inGameStage })

            }

        } // else in play
        console.log(socket.playername + " was disconnected (" + reason + ")")
    })

})

app.listen(10252, (token) => {
    if (!token) {
        console.warn("port already in use");
    }
    console.log("confident port start in 10252")
});


function searchStringInArray(str, strArray) {
    for (var j = 0; j < strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function start_game(socket) {
    console.log("Start_game Func")
    if (gameMode == 1) { // normal mode
        arrPlayerlist.forEach(pl => {
            arrPlayerdata[pl] = {
                min: null,
                max: null,
                size: null,
                lock_down: false,
                answer_status: "", // correct_smallest,correct,correct_largest,incorrect
                score: 0
            }
        });

    }
    inGameStage = 0
    socket.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
    socket.broadcast.emit('game_info', { arrPlayerdata, arrPlayerlist, gameMode, inGameStage, question })
        // console.log(arrPlayerdata)
}

function cal_answer() {

    //get answer
    ans = question.answer
    cor = 0
    incor = 0

    //chk answer
    arrPlayerlist.forEach(pl => {
        if (arrPlayerdata[pl].lock_down) { // is answered
            if (arrPlayerdata[pl].min <= ans && arrPlayerdata[pl].max >= ans) { //correct
                arrPlayerdata[pl].answer_status = "correct"
                cor++
            } else { //incorrect
                arrPlayerdata[pl].answer_status = "incorrect"
                incor++
            }
        }

    });

    //find smallest and largest
    min = 0
    max = 0
    i = 1
    arrPlayerlist.forEach(pl => {
        if (arrPlayerdata[pl].lock_down && arrPlayerdata[pl].answer_status == "correct") { // answer and correct
            if (i == 1) { // set first
                min = arrPlayerdata[pl].size
                max = arrPlayerdata[pl].size
            } else { //set min max
                if (min > arrPlayerdata[pl].size) {
                    min = arrPlayerdata[pl].size
                } else if (max < arrPlayerdata[pl].size) {
                    max = arrPlayerdata[pl].size
                }
            }
            i++
        }
    })

    //scoring in mode
    if (gameMode == 1) { // normal

        arrPlayerlist.forEach(pl => {
            if (arrPlayerdata[pl].lock_down && arrPlayerdata[pl].answer_status == "correct") { // answer and correct
                if (arrPlayerdata[pl].size == min) { // is the least
                    arrPlayerdata[pl].score += 3;
                    arrPlayerdata[pl].answer_status = "correct_smallest"
                } else if (arrPlayerdata[pl].size != max) { // not least but not max
                    arrPlayerdata[pl].score += 1;
                } else if (incor > 0) { // max but have incor
                    arrPlayerdata[pl].score += 1;
                } else { // no incor and max
                    arrPlayerdata[pl].answer_status = "correct_largest"
                }


            }
        })


    }


}