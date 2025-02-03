<template>
    <a-flex :style="{ height: '100%' }" justify="center" align="center">
        <a-card :style="{ width: '500px', boxShadow: 'none' }" :bordered="false">
            <a-spin in :spinning="spin" tip="Загрузка...">
                <a-row justify="center">
                    <a-col>
                        <a-typography-title>Вход</a-typography-title>
                    </a-col>
                </a-row>

                <a-row>
                    <a-col :span="24">
                        <a-form
                            :model="formState"
                            name="login_form"
                            class="login-form"
                            :label-col="{ span: 4 }"
                        >
                            <a-form-item
                                label="Логин"
                                label-align="left"
                                name="login"
                                :rules="[{ required: true, message: 'Пожалуйста, введите свой логин!' }]"
                            >
                                <a-input v-model:value="formState.login" />
                            </a-form-item>

                            <a-form-item
                                label="Пароль"
                                label-align="left"
                                name="password"
                                :rules="[{ required: true, message: 'Пожалуйста, введите свой пароль!' }]"
                            >
                                <a-input-password v-model:value="formState.password" />
                            </a-form-item>
                        </a-form>
                    </a-col>
                </a-row>

                <a-row v-if="errorMessage" justify="center" :style="{ textAlign: 'center' }">
                    <a-col>
                        <a-typography-paragraph type="danger" :content="errorMessage" />
                    </a-col>
                </a-row>

                <a-row justify="end">
                    <a-col>
                        <router-link
                            to="/password-mail"
                            custom
                            v-slot="{ href, navigate }"
                        >
                            <a-typography-link :href="href" @click="navigate">
                                Забыл пароль?
                            </a-typography-link>
                        </router-link>
                    </a-col>
                </a-row>

                <a-row justify="center">
                    <a-col>
                        <a-button :disabled="disabled" type="primary" @click="handleLogInClick">
                            Войти
                        </a-button>
                    </a-col>
                </a-row>
            </a-spin>
        </a-card>
    </a-flex>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

interface FormState {
    login: string;
    password: string;
}

const authStore = useAuthStore();
const formState = reactive<FormState>({
    login: '',
    password: '',
});
const spin = ref<boolean>(false);
const errorMessage = ref<string>('');

const disabled = computed(() => {
    return !(formState.login.trim() && formState.password.trim());
});

const handleLogInClick = function() {
    errorMessage.value = '';
    spin.value = true;

    authStore.authenticate(formState)
        .catch((error) => {
            switch (error.response.status) {
                case 401:
                    errorMessage.value = 'Неверный логин или пароль. Проверьте данные и повторите попытку';
                    break;
                case 403:
                    errorMessage.value = 'Доступ запрещён. Обратитесь к администратору';
                    break;
                case 500:
                    errorMessage.value = 'Ошибка на сервере. Пожалуйста, попробуйте позже';
                    break;
                case 429:
                    errorMessage.value = 'Слишком много запросов. Повторите через 1 минуту';
                    break;
                default:
                    errorMessage.value = 'Произошла ошибка. Обновите страницу и повторите действие';
                    break;
            }
        })
        .finally(() => {
            spin.value = false;
        })
}

const onFinish = (values: any) => {
    console.log('Success:', values);
};
const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};
</script>