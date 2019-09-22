<template>
    <div>
        <StationList />
        <v-footer class="font-weight-medium">
            <v-col class="text-center" cols="12">
                <ul class="footer-navi-links">
                    <li><a href="https://sharedmobility.ai/">SharedMobility.ai</a></li>
                    <li><a href="https://sharedmobility.ai/about/">Impressum</a></li>
                    <li><a href="https://github.com/botic/sharedmobility-ai">Code @ Github</a></li>
                </ul>
            </v-col>
        </v-footer>
    </div>
</template>

<script>
    import StationList from '../components/StationList';

    export default {
        components: {
            StationList,
        }
    };
</script>

<style lang="scss">
    .footer-navi-links {
        list-style: none;
        margin: 0;
        padding: 0;

        li {
            display: inline-block;
            margin: 0;
            padding: 0;
        }

        li + li:before {
            content: " ";
            margin: 0 12px;
        }
    }
</style>
