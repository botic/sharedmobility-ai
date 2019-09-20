<template>
    <div class="prediction">
        <div v-if="loaded">
            <v-row no-gutters class="body-2 py-2 prediction-row" v-for="(prediction, index) in predictions" :key="prediction.timestamp">
                <v-col cols="3" v-if="showTime">
                    {{ prediction.dt.toFormat("HH:mm") }} Uhr
                </v-col>
                <v-col cols="3" v-else class="text-left" align-self="center">
                    <span v-if="index === 0">Jetzt</span>
                    <span v-else>&plus;&thinsp;{{ index * 15 }}&thinsp;min</span>
                </v-col>
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
                            🔮 Prognose unsicher,<br class="hidden-sm-and-up">
                            nur {{ formatPercent(prediction.forecast.highest.y) }}&thinsp;% Wahrscheinlichkeit
                        </template>
                        <template v-if="prediction.forecast.state === 2">⚠️ Prognose divergiert</template>
                    </div>
                </v-col>
            </v-row>

            <h2 class="subtitle-1 mt-8 mb-5 text-center">Details zur Prognose</h2>
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
            loaded: false,
            showTime: false,
            predictions: [],
            context: {}
        }),
        props: {
            station: {
                type: Object,
                required: true
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

                    this.loaded = true;
                }).catch(function(ex) {
                    console.error("Prediction failed", ex);
                });
        },
        methods: {
            formatPrediction(y) {
                return (y * 100).toFixed(2);
            },
            formatPercent(y) {
                return Math.round(y * 100);
            },
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
                    return { state: -1, classes: [], highest: null };
                }

                // the prediction is more or less random
                if (sortedPrediction[0].y < 0.5 && sortedPrediction.every(p => p.y >= 0.2)) {
                    return { state: -2, classes: [], highest: sortedPrediction[0] };
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

                    return { state, classes: [sortedPrediction[0].index], highest: sortedPrediction[0] };
                }

                // assertion: length must be >= 2 at this point ...
                if (sortedPrediction.length < 2) {
                    throw new Error(`Invalid code state! Must have at least two predictions at this point.`);
                }

                let diverged = false;
                classes.push(sortedPrediction[0].index);
                for (let i = 0; i < sortedPrediction.length - 1; i++) {
                    if ((sortedPrediction[i].y - sortedPrediction[i + 1].y) <= 0.15 &&
                        (sortedPrediction[i].y + sortedPrediction[i + 1].y) >= 0.85) {
                        // so check if both are around the same class => if not, the prediction spreads
                        if (Math.abs(sortedPrediction[i].index - sortedPrediction[i + 1].index) !== 1) {
                            diverged = true;
                        }

                        classes.push(sortedPrediction[i + 1].index);
                    }
                }

                if (diverged) {
                    state = 2;
                } else if (sortedPrediction[0].y <= 0.75) {
                    state = 1;
                }

                return { state, classes, highest: sortedPrediction[0] };
            }
        }
    };
</script>

<style lang="scss">
    .prediction {
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
