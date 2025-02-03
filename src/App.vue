<template>
    <a-config-provider :locale="ruRU">
        <a-app :style="{ height: 'inherit' }">
            <RouterView />
        </a-app>
    </a-config-provider>
</template>

<script setup lang="ts">
import ruRU from 'ant-design-vue/es/locale/ru_RU';

import { RouterView } from 'vue-router';
</script>

<style lang="less">
#app {
    height: 100vh;
}
</style>
