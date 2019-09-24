<template>
    <v-app>
        <v-toolbar>
            <div :class="{ 'smai-toolbar-header': true, 'vtfy-small': $vuetify.breakpoint.smAndDown, 'vtfy-xs': $vuetify.breakpoint.xsOnly }">
                <span class="smai-toolbar-logo">
                    <img alt="SharedMobility.ai" :src="require('./assets/logo.svg')" />
                </span>
                <span class="smai-toolbar-title hidden-xs-only">
                    Citybike Wien Demo
                </span>
            </div>
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
    .smai-toolbar-header {
        display: flex;
        margin: 0 auto;
        width: 100%;
        max-width: 844px;
        height: 64px;
        justify-content: space-between;

        > span {
            padding: 8px 0;
            flex: 1 1 auto;
            max-width: 100%;

            display: flex;
            align-items: center;
        }

        &.vtfy-small {
            height: 58px;
        }

        &.vtfy-xs {
            .smai-toolbar-logo {
                justify-content: space-around;
            }
        }

        .smai-toolbar-logo {
            img {
                display: block;
                width: auto;
                height: 45px;
            }
        }

        .smai-toolbar-title {
            justify-content: flex-end;
        }
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
