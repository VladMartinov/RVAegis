<template>
    <a-layout :style="{ minHeight: '100vh' }">
        <a-layout-header :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }">
            <div :style="{ width: '40px', height: '40px' }" />

            <a-menu
                v-model:selectedKeys="selectedKeys"
                mode="horizontal"
                :style="{ lineHeight: '64px', justifyContent: 'center' }"
            >
                <a-menu-item key="cameras">
                    <router-link to="/cameras">Камеры</router-link>
                </a-menu-item>
                <a-menu-item key="images" v-if="displayImageRoute">
                    <router-link to="/images">Изображения</router-link>
                </a-menu-item>
                <a-menu-item key="users" v-if="displayUserRoute">
                    <router-link to="/users">Пользователи</router-link>
                </a-menu-item>
                <a-menu-item key="history" v-if="displayHistoryRoute">
                    <router-link to="/history">Журнал</router-link>
                </a-menu-item>
            </a-menu>

            <a-dropdown :overlayStyle="{ maxWidth: '250px' }">
                <a-avatar :src="avatarLink" shape="square" size="large">
                    <template #icon><user-outlined /></template>
                </a-avatar>
                <template #overlay>
                    <a-menu :style="{ textAlign: 'right' }">
                        <a-menu-item>
                            <a-typography-text>{{ authStore.currentUser?.fullName }}</a-typography-text>
                        </a-menu-item>

                        <a-menu-divider />

                        <a-button danger type="text" @click="authStore.terminateSession">Выход</a-button>
                    </a-menu>
                </template>
            </a-dropdown>
        </a-layout-header>

        <a-layout-content :style="{ padding: '25px 50px', maxWidth: '1440px', margin: '0 auto', width: '100%' }">
            <RouterView />
        </a-layout-content>

        <a-layout-footer :style="{ textAlign: 'center', backgroundColor: '#ffffff' }">
            RVAegis ©2025 Created by Martynov Vladislav, DonGU
        </a-layout-footer>
    </a-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { getMimeType } from '@/utils/helper';
import { UserRoleEnum } from '@/utils/enum';

const route = useRoute();
const authStore = useAuthStore();
const selectedKeys = ref<string[]>([route.name as string]);

const avatarLink = computed(() => {
    const photo = authStore.currentUser?.photo;
    if (!photo) return '';
    
    if (photo.startsWith('data:image')) return photo;
    
    const mimeType = getMimeType(photo);
    return `data:${mimeType};base64,${photo}`;
});

const displayImageRoute = computed(() => true);
const displayUserRoute = computed(() => [UserRoleEnum.Observer, UserRoleEnum.Admin].includes(authStore.currentUser?.userRoleId as UserRoleEnum));
const displayHistoryRoute = computed(() => [UserRoleEnum.Observer, UserRoleEnum.Admin].includes(authStore.currentUser?.userRoleId as UserRoleEnum));
</script>