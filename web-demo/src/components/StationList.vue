<template>
    <v-container class="station-list-container">
        <v-row wrap>
            <v-col>
                <v-expansion-panels accordion popout>
                    <v-expansion-panel v-for="station in stations" :key="station.id">
                        <v-expansion-panel-header class="header-row">
                            <div>
                                <h2 class="subtitle-1">{{ station.internalName }}</h2>
                                <div class="description caption text--secondary">{{ station.description }}</div>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <Prediction :station="station" />
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import Prediction from "./Prediction";
    const stationListUrl = "https://storage.googleapis.com/smai-public-datasets/_metadata/smai_station_export.json";

    /**
     * Renders a list of expandable stations.
     */
    export default {
        components: {Prediction},
        data: () => ({
            stations: []
        }),
        created() {
            fetch(stationListUrl)
                .then((response) => response.json())
                .then(json => {
                    this.stations = json
                        .filter(station => station.serviceId === 2); // only use Citybike Wien stations for now
                }).catch(function(ex) {
                    console.error("Loading station list failed", ex)
                });
        }
    };
</script>

<style lang="scss">
    .station-list-container {
        max-width: 900px;

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
