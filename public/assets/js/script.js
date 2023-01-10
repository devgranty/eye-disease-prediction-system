/**
 * ------------------------------------
 * @author Adiele Obioma Grant
 * @date 1/12/2022
 * @lib Tensorflow.js
 * ------------------------------
 * **/ 

const URL = './data/';
const HELP_MODAL = document.getElementById('helpModal');
const APP_STATUS = document.getElementById('appStatus');
const UPLOAD_IMAGE = document.getElementById('uploadImg');
const VIEW_SAMPLE = document.getElementById('viewSample');
const VIEW_RESULT = document.getElementById('viewResult');
const IMAGE_INPUT_LABEL = document.getElementById('imageInputLabel');
const IMAGE_INPUT = document.getElementById('imageInput');
const IMAGE_ELEMENT = document.getElementById('imageElement');
const PREDICTIONS_LIST = document.getElementById('predictionsList');
const HELP_BTN = document.getElementById('helpBtn');
const PREDICT_BTN = document.getElementById('predictBtn');
const RESET_BTN = document.getElementById('resetBtn');
const MOBILE_NET_INPUT_HEIGHT = 224;
const MOBILE_NET_INPUT_WIDTH = 224;

let model, maxPreditions;

/**
 *  Let's load our pretrained model and weights
 **/
async function loadModel() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPreditions = model.getTotalClasses();

    APP_STATUS.innerHTML = `<span class="text-green-500">
        <i class="fa-regular fa-circle-check"></i>
        <span>Model loaded successfully.</span>
    </span>`;

    IMAGE_INPUT_LABEL.classList.remove('pointer-events-none');
}

// Call the function immediately to start loading.
loadModel().then(() => {
    console.log('Model is ready!');
    IMAGE_INPUT.addEventListener('change', getImage);
});


/**
 * Load and display selected image
 **/ 
function getImage() {
    if(!IMAGE_INPUT.files[0]) throw new Error("Image not found");
    const file = IMAGE_INPUT.files[0];

    const fileReader = new FileReader();

    fileReader.onload = (event) => {
        const imageURL = event.target.result;

        IMAGE_ELEMENT.setAttribute('src', imageURL);

        VIEW_SAMPLE.classList.remove('hidden');

        UPLOAD_IMAGE.classList.add('hidden');
    };

    fileReader.readAsDataURL(file);
}


/**
 *  Make predictions with our model.
 **/ 
async function makePrediction(htmlElement) {
    // check if image src is empty before prediction
    // results are displayed & model is ready.
    const prediction = await model.predict(htmlElement);
    var resultStr = '';
    for (let i = 0; i < maxPreditions; i++){
        resultStr += `<li>
            <span class="text-xs text-blue-700 font-medium uppercase">${prediction[i].className}: </span>
            <span>${(prediction[i].probability * 100).toFixed(2)}%</span>
        </li>`;
    }
    PREDICTIONS_LIST.innerHTML = resultStr;

    // display view results after prediction results
    // have been appended
    VIEW_RESULT.classList.remove('hidden');
}


// Make predictions
PREDICT_BTN.onclick = () => {
    PREDICT_BTN.classList.add('hidden');
    makePrediction(IMAGE_ELEMENT);
}

// Reset the UI
RESET_BTN.onclick = () => {
    window.location.href = '/';
}

HELP_BTN.onclick = () => {
    HELP_MODAL.classList.remove('opacity-0');
    HELP_MODAL.classList.add('opacity-100');
}

window.onmouseup = (event) => {
    if(!HELP_MODAL.contains(event.target)){
        HELP_MODAL.classList.remove('opacity-100');
        HELP_MODAL.classList.add('opacity-0');
    }
}