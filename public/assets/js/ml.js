const path = require('path');
const fs = require('fs');
const tf = require('@tensorflow/tfjs');
var getPixels = require("get-pixels");

const DATA_DIRECTORY = '../eye_diseases/';

// const STATUS = document.getElementById('status');
// const TRAIN_BUTTON = document.getElementById('startTraining');
const FIXED_IMAGE_WIDTH = 224;
const FIXED_IMAGE_HEIGHT = 224;
const CLASS_NAMES = ['Bulging eyes', 'Cataracts', 'Crossed eyes', 'Glaucoma', 'Uveitis'];

let mobilenet = undefined;
let trainingDataInputs = [];
let trainingDataOutputs = [];

// TRAIN_BUTTON.addEventListener('click', trainAndPredict);



/**
 * Loads the MobileNet model and warms it up so ready for use.
 **/
async function loadMobileNetFeatureModel() {
    const URL = 
        'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

    mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
    // STATUS.innerText = 'MobileNet v3 loaded successfully!';

    // Warm up the model by passing zeros through it once.
    tf.tidy(function () {
        let answer = mobilenet.predict(tf.zeros([1, FIXED_IMAGE_HEIGHT, FIXED_IMAGE_WIDTH, 3]));
        console.log(answer.shape);
    });
}
// Call the function immediately to start loading.
loadMobileNetFeatureModel();



/**
 * Create model head
 * 
 **/
let model = tf.sequential();
model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
model.add(tf.layers.dense({units: CLASS_NAMES.length, activation: 'softmax'}));

model.summary();

// Compile the model with the defined optimizer and specify a loss function to use.
model.compile({
  // Adam changes the learning rate over time which is useful.
  optimizer: 'adam',
  // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
  // Else categoricalCrossentropy is used if more than 2 classes.
  loss: (CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy', 
  // As this is a classification problem you can record accuracy in the logs too!
  metrics: ['accuracy']  
});


/**
 * Get training dataset
 * 
 **/
function getFiles(data_directory) {
    fs.readdir(data_directory, (err, directory) => {
        directory.forEach(dir => {
            if (fs.lstatSync(path.resolve(data_directory, dir)).isDirectory()) {
                fs.readdir(path.resolve(data_directory, dir), (err, files) => {
                    files.forEach(file => {
                        getPixels(path.resolve(data_directory, dir, file), function(err, pixels) {
                            // dataGatherLoop(pixels);
                            console.log(pixels)
                        });
                    })
                })
            }
        });
    });
}


function dataGatherLoop(image) {
    let imageFeatures = tf.tidy(function() {
        let imageAsTensor = tf.browser.fromPixels(image);
        let resizedTensorFrame = tf.image.resizeBilinear(imageAsTensor, [FIXED_IMAGE_HEIGHT, FIXED_IMAGE_WIDTH], true);
        let normalizedTensorFrame = resizedTensorFrame.div(255);
        return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
    });

    trainingDataInputs.push(imageFeatures);

    console.log(trainingDataInputs);
}


getFiles(DATA_DIRECTORY);




/**
 * Train model with new dataset
 * 
 **/
async function trainAndPredict() {
    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);

    let results = await model.fit(inputsAsTensor, oneHotOutputs, { shuffle: true, batchSize: 5, epochs: 10, 
        callbacks: {onEpochEnd: logProgress} });

    outputsAsTensor.dispose();
    oneHotOutputs.dispose();
    inputsAsTensor.dispose();
}

function logProgress(epoch, logs) {
    console.log('Data for epoch ' + epoch, logs);
}