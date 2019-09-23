<template>
    <div class="prediction">
        <div v-if="loaded">
            <v-row no-gutters class="body-2 py-2 prediction-row" v-for="(prediction, index) in predictions" :key="prediction.timestamp">

                <!-- click on the time field reveals the absolute time, not just a human readable diff -->
                <v-col v-if="showTime" @click="showTime = false" class="time-details" cols="3">
                    {{ prediction.dt.toFormat("HH:mm") }} Uhr
                </v-col>
                <v-col v-else @click="showTime = true" cols="3" class="text-left time-details" align-self="center">
                    <span v-if="index === 0">Jetzt</span>
                    <span v-else>&plus;&thinsp;{{ index * 15 }}&thinsp;min</span>
                </v-col>

                <!-- the prediction itself -->
                <v-col cols="9">
                    <div class="prediction-class text-center" v-for="clazz of prediction.forecast.classes" :key="clazz">
                        <template v-if="clazz === 0">🚲🚲 voller Räder 🚲🚲</template>
                        <template v-if="clazz === 1">🚲 ausreichend Räder 🚲</template>
                        <template v-if="clazz === 2">🚲 wenige Räder </template>
                        <template v-if="clazz === 3">🚳 kaum&thinsp;/&thinsp;keine Räder</template>
                    </div>
                    <div v-if="prediction.forecast.state !== 0" class="text--secondary text-center">
                        <template v-if="prediction.forecast.state === -2">😢 Prognose schwankt zu stark</template>
                        <template v-if="prediction.forecast.state === -1">🚨 Prognose fehlerhaft</template>
                        <template v-if="prediction.forecast.state === 1">
                            🔮 Prognose schwankt
                        </template>
                        <template v-if="prediction.forecast.state === 2">⚠️ Prognose divergiert</template>
                    </div>
                </v-col>

            </v-row>

            <h2 class="title mt-9 mb-2 text-center">Echtzeit-Daten</h2>
            <div class="text-center">
                <div>
                    <template v-if="currentClass === 0">🚲🚲 voller Räder 🚲🚲</template>
                    <template v-if="currentClass === 1">🚲 ausreichend Räder 🚲</template>
                    <template v-if="currentClass === 2">🚲 wenige Räder </template>
                    <template v-if="currentClass === 3">🚳 kaum&thinsp;/&thinsp;keine Räder</template>
                </div>
                <div class="text--secondary caption">
                    (Station zu {{ formatPercent(currentLoad) }}&thinsp;% gefüllt)
                </div>
            </div>

            <h2 class="title mt-8 mb-5 text-center">Details zur Prognose</h2>
            <v-divider></v-divider>
            <v-row class="my-4" no-gutters>
                <v-col class="weather">&#127774; {{ context.sunshine }}&thinsp;%</v-col>
                <v-col class="weather">&#9748; {{ context.rain }}&thinsp;ml</v-col>
                <v-col class="weather">&#127777; {{ context.temperature }}&thinsp;°C</v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row class="mt-4 text--secondary" no-gutters>
                <v-col class="pd overline">Zeit</v-col>
                <v-col class="pd overline">[100, 80)</v-col>
                <v-col class="pd overline">[80, 50)</v-col>
                <v-col class="pd overline">[50, 20)</v-col>
                <v-col class="pd overline">[20, 0]</v-col>
            </v-row>
            <v-row class="text--secondary" no-gutters v-for="prediction in predictions" :key="prediction.timestamp">
                <v-col class="pd overline">{{ prediction.dt.toFormat("HH:mm") }}</v-col>
                <v-col class="pd overline">{{ formatPrediction(prediction.rawPrediction[0]) }}</v-col>
                <v-col class="pd overline">{{ formatPrediction(prediction.rawPrediction[1]) }}</v-col>
                <v-col class="pd overline">{{ formatPrediction(prediction.rawPrediction[2]) }}</v-col>
                <v-col class="pd overline">{{ formatPrediction(prediction.rawPrediction[3]) }}</v-col>
            </v-row>
        </div>
        <v-row v-else>
            <v-col class="text-center pt-12 pb-12" sm12>
                <v-progress-circular
                    indeterminate
                    color="#10bfbf"
                    width="5"
                    size="50"
                ></v-progress-circular>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import { DateTime } from "luxon";

    export default {
        data: () => ({
            loadedPrediction: false,
            loadedRealtime: false,
            showTime: false,
            predictions: [],
            context: {},
            realtime: []
        }),
        props: {
            station: {
                type: Object,
                required: true
            }
        },
        computed: {
            loaded() {
                return this.loadedPrediction && this.loadedRealtime;
            },
            realtimeStation() {
                if (!this.realtime || this.realtime.length === 0) {
                    return null;
                }
                return this.realtime.find(cbs => cbs.extra.internal_id === this.station.internalIdentifier);
            },
            currentLoad() {
                return this.realtimeStation.free_bikes / (this.realtimeStation.empty_slots + this.realtimeStation.free_bikes);
            },
            currentClass() {
                if (this.currentLoad > 0.8) {
                    return 0;
                } else if (this.currentLoad > 0.5) {
                    return 1;
                } else if (this.currentLoad > 0.2) {
                    return 2;
                } else {
                    return 3;
                }
            }
        },
        created() {
            const {id, serviceId} = this.station;
            fetch(`https://api.sharedmobility.ai/v1/predict/${serviceId}/${id}`)
                .then((response) => response.json())
                .then(json => {
                    this.context = json.context;
                    this.predictions = json.predictions.map(p => {
                        return {
                            dt: DateTime.fromISO(p.timestamp),
                            rawPrediction: p.prediction,
                            forecast: this.analyzePrediction(p.prediction)
                        }
                    });

                    this.loadedPrediction = true;
                }).catch(function(ex) {
                    console.error("Prediction failed", ex);
                });

            // load the realtime data
            fetch(`https://api.citybik.es/v2/networks/citybike-wien`)
                .then((response) => response.json())
                .then(json => {
                    this.realtime = json.network.stations;
                    this.loadedRealtime = true;
                }).catch(function(ex) {
                    console.error("Loading citybikes failed", ex);
                });
        },
        methods: {
            /**
             * Quick function to format the probability for the detailed prediction output.
             *
             * @param {number} y probability in float format
             * @return {string} percent-like formatted probability
             */
            formatPrediction(y) {
                return (y * 100).toFixed(2);
            },
            /**
             * Quick helper function to format a float as percent without any decimal places.
             *
             * @param {number} y probability in float format
             * @return {string}
             */
            formatPercent(y) {
                return String(Math.round(y * 100));
            },
            /**
             * Take a raw prediction for all four result classes and returns a object that makes it easy to display it
             * in the interface.
             *
             * @param {Array.<number>} prediction the prediction's four result classes in an array
             * @return {{classes: *, state: *}} object containing a state
             * (0 = everything is okay, >= 1 = some issues with the prediction itself; <= -1 = error state),
             * the classes to display as an array
             */
            analyzePrediction(prediction) {
                let state = 0;
                const sortedPrediction = prediction
                    .map((y, index) => { return { y, index } })
                    .filter(p => p.y > 0.33)  // drops very unarguable values
                    .sort((a, b) => b.y - a.y);

                //
                // Step 1: Check if the prediction is usable
                //

                // no prediction has been possible
                if (sortedPrediction.length === 0) {
                    return { state: -1, classes: [] };
                }

                // the prediction is more or less random
                // note: this should never occur with the "best" model for each station
                if (sortedPrediction[0].y < 0.5 && sortedPrediction.every(p => p.y >= 0.2)) {
                    return { state: -2, classes: [] };
                }

                //
                // Step 2: Analyze the predicted classes
                //

                // collects all predicted result classes
                const classes = [];

                // only one likely result found => return it
                if (sortedPrediction.length === 1) {
                    // the prediction is not very solid ...
                    if (sortedPrediction[0].y <= 0.75) {
                        state = 1;
                    }

                    return { state, classes: [sortedPrediction[0].index] };
                }

                // assertion: length must be >= 2 at this point ...
                if (sortedPrediction.length < 2) {
                    throw new Error(`Invalid code state! Must have at least two predictions at this point.`);
                }

                // diverged = the probable classes are not next to each other, e.g. full and empty
                let diverged = false;

                // always push the class with the highest probability to the result message
                classes.push(sortedPrediction[0].index);

                // checks if other classes should be included in the result of the prediction
                for (let i = 0; i < sortedPrediction.length - 1; i++) {
                    if ((sortedPrediction[i].y - sortedPrediction[i + 1].y) <= 0.2 &&
                        (sortedPrediction[i].y + sortedPrediction[i + 1].y) >= 0.85) {

                        // so check if both are around the same class => if not, the prediction spreads
                        if (Math.abs(sortedPrediction[i].index - sortedPrediction[i + 1].index) !== 1) {
                            diverged = true;
                        }

                        // this class is also with a fairly high probability => include it in the result message
                        classes.push(sortedPrediction[i + 1].index);
                    }
                }

                // states > 0 indicate a valid prediction, but with some inconsistencies / pitfalls
                if (diverged) {
                    // if diverged (probable classes are not next to each other),
                    // the UI will show a warning
                    state = 2;
                } else if (sortedPrediction[0].y <= 0.75) {
                    // the class with the highest probability is still under 0.75 likelihood =>
                    // UI will show a warning to be careful with the result
                    state = 1;
                }

                return { state, classes };
            }
        }
    };
</script>

<style lang="scss">
    .prediction {
        .time-details {
            cursor: pointer;
        }

        .weather {
            text-align: center;
        }

        .pd {
            text-align: center;
        }

        .prediction-row {
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }

        .prediction-class {
            margin: 0;
            padding: 0;

            & + .prediction-class:before {
                content: " oder ";
            }
        }
    }
</style>
