<template>
    <div>
        <v-row wrap v-if="loaded">
            <v-col sm12>
                <div v-for="prediction in predictions" :key="prediction.timestamp">
                    <v-row no-gutters>
                        <v-col>{{ prediction.dt.toFormat("HH:mm") }} Uhr</v-col>
                        <v-col>{{ getText(prediction.forecast) }}</v-col>
                    </v-row>
                </div>

                <h2>Details</h2>
                <v-row no-gutters>
                    <v-flex class="weather" sm4>&#127774; {{ context.sunshine }}&thinsp;%</v-flex>
                    <v-flex class="weather" sm4>&#9748; {{ context.rain }}&thinsp;ml</v-flex>
                    <v-flex class="weather" sm4>&#127777; {{ context.temperature }}&thinsp;°C</v-flex>
                </v-row>
                <v-row no-gutters>
                    <v-col sm4 class="pd overline">Zeit</v-col>
                    <v-col sm2 class="pd overline">[100, 80)</v-col>
                    <v-col sm2 class="pd overline">[80, 50)</v-col>
                    <v-col sm2 class="pd overline">[50, 20)</v-col>
                    <v-col sm2 class="pd overline">[20, 0]</v-col>
                </v-row>
                <div v-for="prediction in predictions" :key="prediction.timestamp">
                    <v-row no-gutters>
                        <v-col sm4 class="pd overline">{{ prediction.dt.toFormat("HH:mm") }} Uhr</v-col>
                        <v-col sm2 class="pd overline">{{ formatPrediction(prediction.forecast[0]) }}</v-col>
                        <v-col sm2 class="pd overline">{{ formatPrediction(prediction.forecast[1]) }}</v-col>
                        <v-col sm2 class="pd overline">{{ formatPrediction(prediction.forecast[2]) }}</v-col>
                        <v-col sm2 class="pd overline">{{ formatPrediction(prediction.forecast[3]) }}</v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col class="text-center pt-8 pb-8" sm12>
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
                            forecast: p.prediction
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
            getText(prediction) {
                const THRESHOLD = 0.8;
                if (prediction.filter(val => val >= THRESHOLD).length > 1) {
                    return "indecisive";
                }

                const messages = [];

                if (prediction[0] >= THRESHOLD) {
                    messages.push("voll \uD83D\uDEB2\u202F\uD83D\uDEB2\u202F\uD83D\uDEB2\u202F\uD83D\uDEB2");

                    if (prediction.slice(1).some(val => val >= 0.5)) {
                        messages.push("very uncertain");
                    } else if (prediction.slice(1).some(val => val >= 0.3)) {
                        messages.push("uncertain");
                    }
                } else if (prediction[1] >= THRESHOLD) {
                    messages.push("gut gefüllt \uD83D\uDEB2\u202F\uD83D\uDEB2\u202F");

                    if (prediction.filter((val, index) => index !== 1).some(val => val >= 0.5)) {
                        messages.push("very uncertain");
                    } else if (prediction.filter((val, index) => index !== 1).some(val => val >= 0.3)) {
                        messages.push("uncertain");
                    }
                } else if (prediction[2] >= THRESHOLD) {
                    messages.push("gering \uD83D\uDEB2");

                    if (prediction.filter((val, index) => index !== 2).some(val => val >= 0.5)) {
                        messages.push("very uncertain");
                    } else if (prediction.filter((val, index) => index !== 2).some(val => val >= 0.3)) {
                        messages.push("uncertain");
                    }
                } else if (prediction[3] >= THRESHOLD) {
                    messages.push("Station leer");

                    if (prediction.slice(0, 3).some(val => val >= 0.5)) {
                        messages.push("very uncertain");
                    } else if (prediction.slice(0, 3).some(val => val >= 0.3)) {
                        messages.push("uncertain");
                    }
                }

                return messages.join(", ");
            }
        }
    };
</script>

<style lang="scss">
    .weather {
        text-align: center;
    }

    .pd {
        text-align: center;
    }
</style>
