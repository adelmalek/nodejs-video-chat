let socket = io("http://localhost:8000");


/* stream */

navigator
    .mediaDevices
    .getUserMedia({
        audio: true,
        video: true
    })
    .then(stream => {
        const video = document.createElement('video');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('controls', 'true');
        video.srcObject = stream;
        document.querySelector('.js-container').appendChild(video);
    })
    .catch(error => console.log(error.name + ": " + error.message));


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