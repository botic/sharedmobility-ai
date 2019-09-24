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

        <div class="netidee-footer">
            <a href="https://netidee.at/"><img src="./assets/netidee-general-logo.svg" alt="Netidee"></a>
            <p class="caption text--secondary">Supported by Netidee Call 13</p>
        </div>

        <v-footer class="font-weight-medium">
            <v-col class="text-center" cols="12">
                <ul class="footer-navi-links">
                    <li><a href="https://sharedmobility.ai/">SharedMobility.ai</a></li>
                    <li><a href="https://sharedmobility.ai/about/">Impressum</a></li>
                    <li><a href="https://github.com/botic/sharedmobility-ai">Code @ Github</a></li>
                </ul>
            </v-col>
        </v-footer>
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

    .netidee-footer {
        margin: 1.75rem auto 1rem;

        p {
            opacity: 0.85;
            margin: 4px 0 0;
            padding: 0;
            display: block;
            text-align: center;
        }

        img  {
            display: block;
            max-width: 250px;
            height: auto;
        }
    }
</style>
