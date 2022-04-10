const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");


let question = {
    step: 0,
    question: "",
    a: "",
    b: "",
    c: "",
    d: "",
    answer: "",
};

let player_blue = {
    name: "",
    a: false,
    b: false,
    c: false,
    d: false,
    chip_set: 10,
    chip_cal: 10,
    acc: 2,
    f_acc: false,
    locked_down: false,
};

let player_yellow = {
    name: "",
    a: false,
    b: false,
    c: false,
    d: false,
    chip_set: 10,
    chip_cal: 10,
    acc: 2,
    f_acc: false,
    locked_down: false,


};

// let step = 1;
const choice = ['a', 'b', 'c', 'd']
    /*
    0 - not questioned
    1 - questioned
    2 - locked_on
    3 - answered_shown


    */

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

io.on("connection", (socket) => {

    socket.username = socket.id
    console.log(socket.username + " is connected")

    socket.emit('ask_status', { "username": socket.username });

    socket.on('send_status', (data) => {
        console.log(data)
            // console.log(data['type'])
            // socket.emit('yeet', { "username": socket.username });

        initialize_process(data, socket)
    });

    socket.on('send_choice_from_blue', (data) => {
        console.log(data)
            // console.log(data['type'])
            // socket.emit('yeet', { "username": socket.username });

        let i = 0
        choice.forEach(c => {
            if (data[c]) {
                i++
            }
        });

        if (player_blue['chip_set'] >= i) {
            player_blue['a'] = data['a']
            player_blue['b'] = data['b']
            player_blue['c'] = data['c']
            player_blue['d'] = data['d']


            player_blue['chip_cal'] = player_blue['chip_set'] - i



        }

        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
        socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })






        // initialize_process(data, socket)
    });

    socket.on('send_choice_from_yellow', (data) => {
        console.log(data)
            // let old_yellow = player_yellow
            // console.log(data['type'])
            // socket.emit('yeet', { "username": socket.username });

        let i = 0
        choice.forEach(c => {
            if (data[c]) {
                i++
            }
        });
        if (player_yellow['chip_set'] >= i) {
            player_yellow['a'] = data['a']
            player_yellow['b'] = data['b']
            player_yellow['c'] = data['c']
            player_yellow['d'] = data['d']

            player_yellow['chip_cal'] = player_yellow['chip_set'] - i



        }

        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
        socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })




        // initialize_process(data, socket)
    });

    socket.on('blue_locked_down', () => {
        console.log("blue_locked_down")
            // console.log(data['type'])
            // socket.emit('yeet', { "username": socket.username });
        if (player_blue['locked_down'] == false) {
            player_blue['locked_down'] = true
            check_is_both_lock_on()



            socket.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.emit("play_sound_locked_down")
            socket.broadcast.emit("play_sound_locked_down")
        }

        // initialize_process(data, socket)
    });

    socket.on('yellow_locked_down', () => {
        console.log("yellow_locked_down")
            // console.log(data['type'])
            // socket.emit('yeet', { "username": socket.username });
        if (player_yellow['locked_down'] == false) {
            player_yellow['locked_down'] = true
            check_is_both_lock_on()


            socket.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.emit("play_sound_locked_down")
            socket.broadcast.emit("play_sound_locked_down")
        }
        // initialize_process(data, socket)
    });

    socket.on('show_answer', () => {
        if (question.step == 2) {
            question.step = 3
                //cal chip remain
            choice.forEach(ch => {
                if (player_blue[ch]) { // if select
                    if (ch != question.answer) {
                        player_blue.chip_set -= 1
                    }

                }
                if (player_yellow[ch]) { // if select
                    if (ch != question.answer) {
                        player_yellow.chip_set -= 1
                    }

                }
            })

            socket.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })


        }

    })

    socket.on('reset_round', () => {
        //reset choice
        question['question'] = ""
            //answer
        choice.forEach(ch => {
            question[ch] = ""
            player_blue[ch] = false
            player_yellow[ch] = false
        })

        //chip
        player_blue['chip_cal'] = player_blue['chip_set']
        player_yellow['chip_cal'] = player_yellow['chip_set']
            //locked_down
        player_blue['locked_down'] = false
        player_yellow['locked_down'] = false
            //locked_down
        player_blue['f_acc'] = false
        player_yellow['f_acc'] = false


        question['step'] = 0







        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
        socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })

    })

    socket.on('reset_game', () => {
        question = {
            step: 0,
            question: "",
            a: "",
            b: "",
            c: "",
            d: "",
            answer: "",
        };

        player_blue = {
            name: "",
            a: false,
            b: false,
            c: false,
            d: false,
            chip_set: 10,
            chip_cal: 10,
            acc: 2,
            f_acc: false,
            locked_down: false,
        };

        player_yellow = {
            name: "",
            a: false,
            b: false,
            c: false,
            d: false,
            chip_set: 10,
            chip_cal: 10,
            acc: 2,
            f_acc: false,
            locked_down: false,


        };







        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
        socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })

    })

    socket.on('set_question', (data) => {
        console.log(data)


        question.question = data.question
        question.a = data.choice_a
        question.b = data.choice_b
        question.c = data.choice_c
        question.d = data.choice_d
        question.step = 1
        question.answer = data.answer

        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
        socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })


    })

    //accelator

    socket.on('blue_acc', () => {
        if (question.step == 1 && player_blue.acc > 0 && player_blue.locked_down) { // correct_condition
            player_blue.acc -= 1;
            player_blue.f_acc = true;
            socket.broadcast.emit("all_acc", { player: "blue" })
            socket.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })
        }


    })

    socket.on('yellow_acc', () => {
        if (question.step == 1 && player_yellow.acc > 0 && player_yellow.locked_down) { // correct_condition
            player_yellow.acc -= 1;
            player_yellow.f_acc = true;
            socket.broadcast.emit("all_acc", { player: "yellow" })
            socket.emit("set_viewer_status", { question, player_blue, player_yellow })
            socket.broadcast.emit("set_viewer_status", { question, player_blue, player_yellow })
        }


    })


    // console.log(socket);
    /*
    socket.username = socket.id;
    // const userId = ;
    console.log(socket.username + ' a user connected');

    socket.emit('yeet', { "username": socket.username });
    // socket.emit('send_info', { "data": socket })

    socket.on('yeet', () => {
        console.log("user yeet you")
        socket.emit('yeet', { "username": socket.username });

    });

    socket.on('yeet_everyone', () => {
        console.log(socket.username + " yeet everyone")
        socket.broadcast.emit('yeet_everyone', { "username": socket.username });
    });
    socket.on('disconnect', () => {
        console.log(socket.username + " user disconnect")
    })
    */
});
app.listen(10252, (token) => {
    if (!token) {
        console.warn("port already in use");
    }
    console.log("Duel port start in 10252")
});

function initialize_process(data, socket) {
    if (data['type'] == "viewer") {
        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
    }
    if (data['type'] == "admin") {
        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
    }
    if (data['type'] == "blue") {
        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
    }
    if (data['type'] == "yellow") {
        socket.emit("set_viewer_status", { question, player_blue, player_yellow })
    }
}

function check_is_both_lock_on() {
    if (player_blue.locked_down && player_yellow.locked_down) {
        question.step = 2
    }
}