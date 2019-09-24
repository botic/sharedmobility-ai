<template>
    <v-container class="station-list-container">

        <!-- if Geolocation API is available, show the locate me button -->
        <div v-if="geolocationAvailable" class="top-actions mt-2">
            <v-btn :disabled="geolocationActive || watchID !== null" outlined color="#10bfbf" @click="getPosition">
                <v-icon left>mdi-navigation</v-icon> Nach Distanz sortieren
            </v-btn>
            <p v-if="geolocationError">{{ geolocationError }}</p>
        </div>

        <v-expansion-panels accordion popout class="mt-4">
            <v-expansion-panel v-for="station in stations" :key="station.id">
                <v-expansion-panel-header class="header-row">
                    <div>
                        <h2 class="subtitle-1">
                            {{ station.internalName }}
                            <v-chip
                                v-if="geolocationActive"
                                class="ml-1 text--secondary"
                                outlined
                                label
                                x-small
                            >
                                {{ formatDistance(currentDistance(station)) }}&thinsp;m
                            </v-chip>
                        </h2>
                        <div class="description caption text--secondary">{{ station.description }}</div>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <Prediction :station="station" />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-container>
</template>

<script>
    import { getDistance } from "geolib";
    import Prediction from "./Prediction";

    const numFormat = new Intl.NumberFormat("de-DE", { style: "decimal" });
    const stationListUrl = "https://storage.googleapis.com/smai-public-datasets/_metadata/smai_station_export.json";

    /**
     * Renders a list of expandable stations.
     */
    export default {
        components: {Prediction},
        data: () => ({
            geolocationAvailable: ("geolocation" in navigator) ? true : false,
            geolocationError: "",
            geolocationLatitude: null,
            geolocationLongitude: null,
            watchID: null,
            stations: []
        }),
        computed: {
            /**
             * Checks if the geolocation watcher is active and sends valid data.
             * @return {boolean} true if the navigation sends geolocation updates
             */
            geolocationActive() {
                return this.geolocationAvailable && this.watchID !== null && this.stations.length > 0 &&
                    this.geolocationLatitude !== null && this.geolocationLongitude !== null;
            }
        },
        created() {
            fetch(stationListUrl)
                .then((response) => response.json())
                .then(json => {
                    this.stations = json
                        .filter(station => station.serviceId === 2); // only use Citybike Wien stations for now
                }).catch(function(ex) {
                    console.error("Loading station list failed", ex)
                });
        },
        methods: {
            /**
             * Asks the browser to allow geolocation and and a watch on location updates.
             */
            getPosition() {
                if (!navigator.geolocation) {
                    return;
                }

                // clears any existing watch (should not happen, button must be disabled ...)
                if (this.watchID) {
                    navigator.geolocation.clearWatch(this.watchID);
                }

                // creates a new geolocation watch and sorts the station list on every update by distances
                this.watchID = navigator.geolocation.watchPosition((position) => {
                    this.geolocationLatitude  = position.coords.latitude;
                    this.geolocationLongitude = position.coords.longitude;

                    this.stations = this.stations.sort((a, b) => {
                        const aDistance = getDistance(
                            {latitude: a.latitude, longitude: a.longitude},
                            {latitude: position.coords.latitude, longitude: position.coords.longitude }
                        );

                        const bDistance = getDistance(
                            {latitude: b.latitude, longitude: b.longitude},
                            {latitude: position.coords.latitude, longitude: position.coords.longitude }
                        );

                        return aDistance - bDistance;
                    })
                }, (error) => {
                    this.geolocationError = "Position konnte nicht geladen werden.";
                    console.error(error);
                });
            },
            /**
             * Returns the distance of the station to the current location.
             * @param station a SMAI station
             * @return {number} distance in meter of the given station
             */
            currentDistance(station) {
                if (this.geolocationActive && station.latitude && station.longitude) {
                    return getDistance(
                        {latitude: this.geolocationLatitude, longitude: this.geolocationLongitude},
                        {latitude: station.latitude, longitude: station.longitude }
                    );
                }

                return -1;
            },
            /**
             * Formats the given distance with the Intl.NumberFormat API with a German number format.
             * @param meters {number} distance in meter
             * @return {string} formatted decimal distance
             */
            formatDistance(meters) {
                return numFormat.format(meters);
            }
        },
        beforeDestroy() {
            // any existing geolocation watch must be cleared before we leave ...
            if (this.watchID) {
                navigator.geolocation.clearWatch(this.watchID);
            }
        }
    };
</script>

<style lang="scss">
    .station-list-container {
        max-width: 900px;

        .top-actions {
            text-align: center;
        }

        .header-row {
            h2 {
                display: block;
                width: 100%;
            }

            .description {
                display: block;
                width: 100%;
            }
        }
    }
</style>
