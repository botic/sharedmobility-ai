<template>
    <v-app>
        <v-toolbar>
            <v-row class="toolbar-header">
                <v-col class="pl-8 d-flex">
                    <img class="toolbar-logo" alt="SharedMobility.ai" :src="require('./assets/logo.svg')" />
                </v-col>
                <v-col class="text-right pr-8 hidden-xs-only" align-self="center">
                    Citybike Wien Demo
                </v-col>
            </v-row>
        </v-toolbar>

        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
    export default {
        name: "App",
        data: () => ({
            //
        }),
    };
</script>

<style lang="scss">
    .toolbar-header {
        max-width: 900px;
        margin: 0 auto;
    }
    .toolbar-logo {
        display: inline-block;
        width: auto;
        max-height: 38px;
    }
</style>
