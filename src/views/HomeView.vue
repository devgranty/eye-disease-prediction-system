<template>
      <div class="space-y-5">
        <div class="py-6 px-4 w-full bg-gray-900">
            <div class="w-full max-w-5xl mx-auto">
                <h1 class="text-gray-50 text-5xl">Eye disease prediction system with Machine learning.</h1>
                <p class="text-right text-xs text-gray-300 font-mono">Ver 1.0.0</p>
            </div>
        </div>

        <div class="pb-28 px-4 w-full max-w-5xl mx-auto space-y-5">
            <div class="flex">
                <div class="ml-auto relative">
                    <button type="button" @click="toggleHelpModal" class="py-1 px-2 flex items-center gap-x-1 border border-blue-400 text-blue-600 text-xs rounded-full">
                        <i class="fa-solid fa-circle-question"></i>
                        <span>Need help?</span>
                    </button>

                    <div v-if="helpModalVisible" @click="closeHelpModal" class="fixed inset-0 w-full h-full z-20"></div>
                    <div v-if="helpModalVisible" class="w-72 absolute z-10 top-8 right-0 bg-gray-900 rounded-2xl shadow-2xl transition-all ease-out after:content-[''] after:absolute after:-top-[5px] after:right-10 after:-ml-[10px] after:border-[7px] after:border-t-transparent after:border-b-transparent after:border-l-transparent after:border-r-gray-900">
                        <div class="py-2 px-4 w-full border-b border-gray-800">
                            <div class="flex items-center gap-x-1 text-gray-400 text-xs">
                                <i class="fa fa-info-circle"></i>
                                <h2>How to use</h2>
                            </div>
                        </div>
                        <div class="p-4">
                            <ol class="pl-4 text-gray-100 text-sm list-decimal space-y-3">
                                <li>
                                    Click on the <span class="px-2 bg-gray-700 font-mono text-white text-xs rounded">Upload Eye Image</span> button and select and upload an image of the eye.
                                    <div>
                                        <img src="/images/sample.png" alt="Sample image" width="150">
                                        <p class="text-gray-300 text-xs italic">(Example of eye image sample to be uploaded)</p>
                                    </div>
                                </li>
                                <li>Click on <span class="px-2 bg-gray-700 font-mono text-white text-xs rounded">Run prediction</span> button to begin processing the image.</li>
                                <li>Wait for few seconds for the model to process and return prediction results.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-10">
                <div class="basis-1/2">
                    <img src="/images/eye-logo.png" alt="Eye image logo"/>
                </div>

                <div class="basis-1/2 space-y-10">
                    <div class="bg-gray-50 rounded-lg shadow-sm">
                        <div class="py-2 px-4 w-full border-b border-gray-200">
                            <h2 class="text-gray-800">Model</h2>
                        </div>
                        <div class="p-5 space-y-5">
                            <div v-if="appStatus">
                                <span class="flex items-center gap-x-1 text-sm text-green-500">
                                    <i class="fa-regular fa-circle-check"></i>
                                    <span>Model loaded successfully.</span>
                                </span>
                            </div>
                            <div v-else>
                                <span class="flex items-center gap-x-1 text-sm text-gray-500">
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                    <span>Wait while model and TensorFlow.js is loading...</span>
                                </span>
                            </div>

                            <div v-show="fileUploadVisible">
                                <form method="post" enctype="multipart/form-data">
                                    <label for="imageInput" class="py-3 px-6 inline-flex items-center gap-x-2 text-white bg-gray-900 text-xs font-medium uppercase rounded-lg shadow-lg cursor-pointer">
                                        <i class="fa-solid fa-upload"></i>
                                        <span>Upload Eye Image</span>
                                    </label>
                                    <input id="imageInput" type="file" class="hidden" @change="getImage" />
                                </form>
                            </div>

                            <div v-show="previewVisible" class="space-y-5">
                                <div class="space-y-2">
                                    <div>
                                        <p class="text-gray-500 text-sm">Image sample:</p>
                                        <img :src="imageURL" ref="imageElement">
                                    </div>

                                    <button @click="startPrediction" v-if="predictionStatus === null" class="py-3 px-6 inline-flex items-center gap-x-2 text-white bg-gray-900 text-xs font-medium uppercase rounded-lg shadow-lg cursor-pointer disabled:bg-gray-400 disabled:text-white disabled:shadow-none disabled:cursor-default">
                                        <i class="fa-regular fa-eye fa-shake"></i>
                                        <span>Run Prediction</span>
                                    </button>
                                    <div v-else-if="predictionStatus === 'started'">
                                        <span class="flex items-center gap-x-1 text-sm text-gray-500">
                                            <i class="fa-solid fa-spinner fa-spin"></i>
                                            <span>Analyzing image...</span>
                                        </span>
                                    </div>
                                    <div v-else-if="predictionStatus === 'ended'">
                                        <span class="flex items-center gap-x-1 text-sm text-green-500">
                                            <i class="fa-regular fa-circle-check"></i>
                                            <span>Prediction result is ready</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="resultStr" class="bg-gray-50 rounded-lg shadow-sm">
                        <div class="py-2 px-4 w-full border-b border-gray-200">
                            <h2 class="text-gray-800">Prediction results</h2>
                        </div>
                        <div class="p-5 space-y-2">
                            <ul v-html="resultStr" class="space-y-4"></ul>
                            <button @click="resetPrediction" class="py-3 px-6 inline-flex items-center gap-x-2 text-white bg-gray-900 text-xs font-medium uppercase rounded-lg shadow-lg cursor-pointer">
                                <i class="fa-solid fa-arrow-rotate-left"></i>
                                <span>Run another Prediction</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="py-2 px-4 fixed z-50 inset-x-0 bottom-0 bg-gray-50">
            <p class="text-xs md:text-sm text-center text-gray-700">Made with <i class="fa fa-heart text-red-600"></i> by <a href="https://devgranty.netlify.app" target="_blank" class="text-red-400">Grant Adiele</a></p>
        </footer>
    </div>
</template>

<script>
export default {
  data() {
    return {
      model: undefined,
      maxPredictions: undefined,
      appStatus: false,
      fileUploadVisible: false,
      imageURL: '',
      previewVisible: false,
      predictionStatus: null,
      resultStr: '',
      helpModalVisible: false
    };
  },
  methods: {
    sleep(ms) {
      return new Promise(function(resolve) {
        setTimeout(resolve, ms);
      });
    },

    async loadModel() {
      try {
        const modelURL = '/data/model.json';
        const metadataURL = '/data/metadata.json';

        /* eslint-disable */ 
        this.model = Object.freeze(await tmImage.load(modelURL, metadataURL));
        /* eslint-enable */ 
        this.maxPredictions = this.model.getTotalClasses();
        this.appStatus = true;
        this.fileUploadVisible = true;
      } catch (error) {
        throw new Error(error);
      }
    },

    getImage(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        if (!file) {
            throw new Error("Image not found");
        }

        reader.onload = () => {
            this.imageURL = reader.result;
            this.previewVisible = true;
            this.fileUploadVisible = false;
        };

        reader.readAsDataURL(file);
    },

    async makePrediction(htmlElement) {
        try {
            const predictions = await this.model.predict(htmlElement);

            for (var i = 0; i < this.maxPredictions; i++) {
                const className = predictions[i].className;
                const probability = (predictions[i].probability * 100).toFixed(2);
                this.resultStr += `<li>
                <span class="text-xs text-blue-700 font-medium uppercase whitespace-nowrap">${className}: </span>
                <div class="py-0.5 w-full bg-gray-100 rounded-md">
                    <div class="h-full w-[66%] bg-slate-600 text-center rounded-md" style="width:${probability}%">
                    <span class="text-xs text-gray-900 whitespace-nowrap">${probability}%</span>
                    </div>
                </div>
                </li>`;
            }
        } catch (error) {
            console.error("Prediction error:", error);
        }
    },
    
    startPrediction() {
        console.log('Started prediction');
        this.predictionStatus = 'started';
        this.sleep(1000).then(async () => {
            await this.makePrediction(this.$refs.imageElement);
            console.log('ended prediction');
            this.predictionStatus = 'ended';
        });
    },

    resetPrediction() {
        this.imageURL = '';
        this.previewVisible = false;
        this.fileUploadVisible = true;
        this.resultStr = '';
        this.predictionStatus = null;
    },

    toggleHelpModal() {
      this.helpModalVisible = !this.helpModalVisible;
    },

    closeHelpModal() {
      this.helpModalVisible = false;
    }
  },
  mounted() {
    // Initialize your component when it's mounted
    this.loadModel()
      .then(() => {
        console.log('Model is ready!');
      })
      .catch((error) => {
        console.log("Error loading the model:", error);
      });
  },
};
</script>
