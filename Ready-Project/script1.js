alert("Please be aware that the face detection may take some more time!");
let fileInput = document.getElementById('file-i');
let img = document.getElementById('img');
let net;
let publishBtn = document.getElementById('upload-i');
let predictionOutput = document.getElementById('console-output');
let speechSynth = window.speechSynthesis;
let isIC = true;
let isFD = false;
let ImageClassificationBtn = document.getElementById("ic");
let FaceDetectionBtn = document.getElementById("fd");
let ImageClassificationLayer = document.getElementById("ic-l");
let FaceDetectionLayer = document.getElementById("fd-l");
const video = document.getElementById("video");
/*if(isIC){
    window.onload = () => {
        let utt = new SpeechSynthesisUtterance("Waiting for uploading an image...");
        speechSynth.speak(utt);
    }
}*/
window.onload = () => {
    let ut = new SpeechSynthesisUtterance("Welcome back buddy!");
    speechSynth.speak(ut);
}
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(ready);
if(isIC){

}
ImageClassificationBtn.onclick = () => {
    ImageClassificationLayer.style.display = "flex";
    FaceDetectionLayer.style.display = "none";
    FaceDetectionBtn.style.filter = "brightness(30%)";
    ImageClassificationBtn.style.filter = "brightness(100%)";
    isIC = true;
    isFD = false;
    stopWebcamStream();
}
FaceDetectionBtn.onclick = () => {
    ImageClassificationLayer.style.display = "none";
    FaceDetectionLayer.style.display = "flex";
    FaceDetectionBtn.style.filter = "brightness(100%)";
    ImageClassificationBtn.style.filter = "brightness(30%)";
    isIC = false;
    isFD = true;
    liveStream();
}
function ready(){
    console.log("ready.")
}
function empty(){
    return 0;
}
function publishImage(){
    let file = fileInput.files[0];
    if(file.type != "image/jpeg" && file.type != "image/png"){
        alert("Please upload a jpeg or png image file.");
    } else {
        img.src = URL.createObjectURL(file);
        predicting();
    }
}

async function predicting() {
    predictionOutput.innerText = "The model is loading...";
    let utterance1 = new SpeechSynthesisUtterance("The model is loading...");
    speechSynth.speak(utterance1);
    net = await mobilenet.load();
    predictionOutput.innerText = "The model has been successfully loaded.";
    let utterance2 = new SpeechSynthesisUtterance("The model has been successfully loaded.");
    speechSynth.speak(utterance2);
    const results = await net.classify(img);
    predictionOutput.innerText = `I think this is ${results[0].className} with ${Math.round(results[0].probability * 100)}% probability`;
    let utterance3 = new SpeechSynthesisUtterance(`I think this is ${results[0].className} with ${Math.round(results[0].probability * 100)}% probability`);
    speechSynth.speak(utterance3);
}

function liveStream(){
    navigator.getUserMedia({video: {}},
            stream => video.srcObject = stream,
            err => console.log(err)
    )
}

function stopWebcamStream() {
    navigator.getUserMedia({video: {}},
        stream => video.srcObject = stream,
        err => console.log(err)
    );
    stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
        }
    });
}
    
    video.addEventListener('play', () => {
        const canvasMedia = faceapi.createCanvasFromMedia(video);
        document.body.append(canvasMedia);
        const canvasSizes = {width: video.width, height: video.height};
        faceapi.matchDimensions(canvasMedia, canvasSizes);
        setInterval(async () => {
            const faceDetections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            const resizedCanvasDetections = faceapi.resizeResults(faceDetections, canvasSizes);
            canvasMedia.getContext('2d').clearRect(0, 0, canvasMedia.width, canvasMedia.height);
            faceapi.draw.drawDetections(canvasMedia, resizedCanvasDetections);
            faceapi.draw.drawFaceLandmarks(canvasMedia ,resizedCanvasDetections);
            faceapi.draw.drawFaceExpressions(canvasMedia, resizedCanvasDetections); 
        }, 100);
    })

