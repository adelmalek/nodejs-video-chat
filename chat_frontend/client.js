const SELECT_DEVICE = document.querySelector(".js-input-devices");
const START_BTN = document.querySelector(".js-start-stream");
const STOP_BTN = document.querySelector(".js-stop-stream");
const CALL_BTN = document.querySelector(".js-call");
const CALL_INPUT = document.querySelector(".js-call-id");
const ANSWER_BTN = document.querySelector(".js-answer");
const HANGUP_BTN = document.querySelector(".js-hangup");

let socket = null;
let video = null;
let othervideo = null;
let id = null;
let otherId = null;
let signal = null;
let currentStream = null;
let callerPeer = null;
let receiverPeer = null;


/* devices */

/*
navigator
    .mediaDevices
    .enumerateDevices()
    .then(devices => devices.map(device => {
        console.log(device.kind + ": " + device.label + " id = " + device.deviceId)
    }))
    .catch(error => console.log(error.name + ": " + error.message));

*/

/* microphone */

navigator
    .mediaDevices
    .enumerateDevices()
    .then(devices => {
        let html = "";
        devices
            .filter(device => device.kind === "audioinput")
            .map(device => html += `<option value=${device.deviceId}>${device.label}</option>`);
        const devicesSelect = document.querySelector(".js-input-devices");
        devicesSelect.innerHTML = html;
        devicesSelect.addEventListener('change', changeMicrophone)
    })
    .catch(error => console.log(error.name + ": " + error.message));

function changeMicrophone(event) {
    console.log(event.target.value)
};


/* socket */

function initialSocket() {
    socket = io("http://localhost:8000");
    socket.on('connected', connectionReceived);
    socket.on('call', called);
    /*socket.on('answered', answered);*/
};


/* id */

function connectionReceived(currentId) {
    id = currentId;
    alert(id);
    CALL_BTN.disabled = false;
};


/* other id and signal */

function called(payload) {
    console.log("receiverPeer has called by callerPeer: ", payload);
    ANSWER_BTN.disabled = false;
    otherId = payload.sourceUserId;
    signal = payload.signal
};


/* stop stream */

STOP_BTN.addEventListener('click', stopStream);

function stopStream() {
    currentStream = null;
    CALL_BTN.disabled = true;
    ANSWER_BTN.disabled = true;
    HANGUP_BTN.disabled = true;
    document.querySelector(".js-container").innerHTML = "";
};


/* start stream */

START_BTN.addEventListener('click', () => {
    const microphoneId = SELECT_DEVICE.value;
    startStream(microphoneId);
});

function startStream(audioDeviceId) {
    navigator
        .mediaDevices
        .getUserMedia({
            audio: {
                deviceId: audioDeviceId
            },
            video: true
        })
        .then(loadStream)
        .catch(error => console.log(error.name + ": " + error.message));
};

function loadStream(stream) {
    stopStream();
    renderVideo(stream, ".js-container");
    currentStream = stream;
    initialSocket();
};

function renderVideo(stream, selector) {
    video = document.createElement('video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('controls', 'true');
    video.style = "width: 500px; height: 400px";
    video.srcObject = stream;
    document.querySelector(selector).appendChild(video);
};


/* call */

CALL_BTN.addEventListener('click', () => {
    CALL_BTN.disabled = true;

    callerPeer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: currentStream
    });

    callerPeer.on('signal', signal => {
        if (CALL_INPUT.value.trim().length > 0 && CALL_INPUT.value !== id) {
            socket.emit('send-call', {
                targetUserId: CALL_INPUT.value,
                sourceUserId: id,
                signal
            });
        }
    });
    
    callerPeer.on('stream', (stream) => {
        console.log("callerPeer stream: ", stream);
        renderVideo(stream, ".js-container")
    });
});


/* answer */

ANSWER_BTN.addEventListener('click', () => {
    ANSWER_BTN.disabled = true;

    receiverPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: currentStream
    });

    receiverPeer.on('signal', (signal) => {
        socket.emit('answer-call', {
            targetUserId: otherId,
            sourceUserId: id,
            signal
        });
    });

    receiverPeer.on('stream', (stream) => {
        renderVideo(stream, '.js-other-container');
    });

    receiverPeer.signal(signal);
});





