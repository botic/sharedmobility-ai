<template>
    <div>
        <StationList />
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
