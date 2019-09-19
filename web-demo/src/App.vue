<template>
    <v-app>
        <v-app-bar app clipped-left clipped-right>
            <v-img
                alt="SharedMobility.ai"
                :src="require('./assets/logo.svg')"
                contain
                height="38px"
                width="38px"
            />
            <v-toolbar-title class="hidden-xs-only">Citybike Wien Demo</v-toolbar-title>
            <v-spacer/>
        </v-app-bar>

        <v-content>
            <StationList/>
        </v-content>
    </v-app>
</template>

<script>
    import StationList from "./components/StationList";

    export default {
        name: "App",
        components: {
            StationList,
        },
        data: () => ({
            //
        }),
    };
</script>
