const SELECT_DEVICE = document.querySelector(".js-input-devices");
const START_BTN = document.querySelector(".js-start-stream");
const STOP_BTN = document.querySelector(".js-stop-stream");

let socket = io("http://localhost:8000");
let video = null;


/* stop stream */

STOP_BTN.addEventListener('click', stopStream);

function stopStream() {
    document.querySelector(".js-container").innerHTML = "";
};


/* devices */

navigator
    .mediaDevices
    .enumerateDevices()
    .then(devices => devices.map(device => {
        console.log(device.kind + ": " + device.label + " id = " + device.devideId)
    }))
    .catch(error => console.log(error.name + ": " + error.message));


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
        .then(stream => {
            stopStream();
            video = document.createElement('video');
            video.setAttribute('autoplay', 'true');
            video.setAttribute('playsinline', 'true');
            video.setAttribute('controls', 'true');
            video.srcObject = stream;
            document.querySelector('.js-container').appendChild(video);

            window.stream = stream;
        })
        .catch(error => console.log(error.name + ": " + error.message));
};










