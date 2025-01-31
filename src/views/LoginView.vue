<template>
    <a-flex :style="{ height: '100%' }" justify="center" align="center">
        <a-card :style="{ width: '400px' }">
            <a-spin :spinning="false" tip="Загрузка...">
                <a-form
                    :model="formState"
                    name="normal_login"
                    class="login-form"
                    @finish="onFinish"
                    @finishFailed="onFinishFailed"
                >
                    <a-form-item
                        label="Логин"
                        name="username"
                        :rules="[{ required: true, message: 'Пожалуйста, введите свой логин!' }]"
                    >
                        <a-input v-model:value="formState.username" />
                    </a-form-item>

                    <a-form-item
                        label="Пароль"
                        name="password"
                        :rules="[{ required: true, message: 'Пожалуйста, введите свой пароль!' }]"
                    >
                        <a-input-password v-model:value="formState.password" />
                    </a-form-item>

                    <a-form-item>
                        <a-flex justify="space-between" align="center">
                            <a-form-item name="remember" no-style>
                                <a-checkbox v-model:checked="formState.remember">Запомни меня</a-checkbox>
                            </a-form-item>

                            <a class="login-form-forgot" href="">Забыл пароль</a>
                        </a-flex>
                    </a-form-item>

                    <a-form-item>
                        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button">
                            Войти
                        </a-button>
                    </a-form-item>
                </a-form>
            </a-spin>
        </a-card>
    </a-flex>
</template>

<script setup lang="ts">
import { reactive, computed, inject } from 'vue';

interface FormState {
    username: string;
    password: string;
    remember: boolean;
}

const api = inject('$api');
const formState = reactive<FormState>({
    username: '',
    password: '',
    remember: false,
});

const disabled = computed(() => {
    return !(formState.username.trim() && formState.password.trim());
});

const onFinish = (values: any) => {
    console.log('Success:', values);
};
const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};
</script>