<template>
  <a-flex :style="{ height: '100%' }" justify="center" align="center">
      <a-card :style="{ width: '600px', boxShadow: 'none' }" :bordered="false">
          <a-spin in :spinning="spin" tip="Загрузка...">
              <a-row justify="center">
                  <a-col :style="{ textAlign: 'center' }">
                      <a-typography-title>Новый пароль</a-typography-title>
                  </a-col>
              </a-row>

              <a-row>
                  <a-col :span="24">
                      <a-form
                          :model="formState"
                          name="login_form"
                          class="login-form"
                          :rules="rules"
                          :label-col="{ span: 8 }"
                      >
                          <a-form-item
                              label="Новый пароль"
                              label-align="left"
                              name="newPassword"
                          >
                              <a-popover trigger="focus" placement="right" :overlayStyle="{ maxWidth: '250px' }">
                                  <template #title>
                                      <a-typography-title :level="5" :style="{ marginBottom: '1.5rem' }">Требования к паролю:</a-typography-title>
                                  </template>
                                  <template #content>
                                      <a-timeline>
                                          <a-timeline-item :color="passwordStrength.minLength ? 'green' : 'red'">
                                              Пароль должен содержать минимум 8 символов
                                          </a-timeline-item>
                                          <a-timeline-item :color="passwordStrength.hasNumber ? 'green' : 'red'">
                                              Пароль должен содержать цифру
                                          </a-timeline-item>
                                          <a-timeline-item :color="passwordStrength.hasUpperCase ? 'green' : 'red'">
                                              Пароль должен содержать заглавную букву
                                          </a-timeline-item>
                                          <a-timeline-item :color="passwordStrength.hasSpecialChar ? 'green' : 'red'">
                                              Пароль должен содеражть специальный символ
                                          </a-timeline-item>
                                      </a-timeline>

                                      <a-progress :percent="passwordStrengthProgress" />
                                  </template>
                                  <a-input-password v-model:value="formState.newPassword" />
                              </a-popover>
                          </a-form-item>

                          <a-form-item
                              label="Подтвердите пароль"
                              label-align="left"
                              name="confirmPassword"
                          >
                              <a-input-password v-model:value="formState.confirmPassword" />
                          </a-form-item>
                      </a-form>
                  </a-col>
              </a-row>

              <a-row justify="center">
                  <a-col>
                      <router-link
                              to="/login"
                              custom
                              v-slot="{ navigate }"
                          >
                              <a-button :disabled="disabled" type="primary" @click="handleUpdateButton(navigate)">
                                  Обновить
                              </a-button>
                      </router-link>
                  </a-col>
              </a-row>
          </a-spin>
      </a-card>
  </a-flex>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';
import { App } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { AxiosError } from 'axios';

interface FormState {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

const { notification } = App.useApp();
const route = useRoute()
const authStore = useAuthStore();
const formState = reactive<FormState>({
    token: '',
    newPassword: '',
    confirmPassword: ''
});
const spin = ref<boolean>(false);

const disabled = computed(() => {
    return !formState.newPassword.trim() ||
        !formState.confirmPassword.trim() ||
        formState.newPassword !== formState.confirmPassword ||
        !isPasswordValid.value
});

const passwordStrength = computed(() => {
    const pass = formState.newPassword;
    return {
        minLength: pass.length >= 8,
        hasNumber: /\d/.test(pass),
        hasUpperCase: /[A-Z]/.test(pass),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };
});

const passwordStrengthProgress = computed(() => {
    const array = [
        passwordStrength.value.minLength,
        passwordStrength.value.hasNumber,
        passwordStrength.value.hasUpperCase,
        passwordStrength.value.hasSpecialChar
    ]

    return ((array.filter(Boolean).length / array.length) * 100);
})

const isPasswordValid = computed(() => 
    Object.values(passwordStrength.value).every(v => v)
);

const validatePasswordStrength = async (_rule: any, value: string) => {
    return isPasswordValid.value ? Promise.resolve() : Promise.reject('Пароль небезопасен');
};

const checkPass = async (_rule: any, value: string) => {
    return value === formState.newPassword 
        ? Promise.resolve() 
        : Promise.reject('Пароли не совпадают');
};

const rules: Record<string, Rule[]> = {
    newPassword: [{ required: true, validator: validatePasswordStrength, trigger: 'change' }],
    confirmPassword: [{ required: true, validator: checkPass, trigger: 'change' }]
};

const handleUpdateButton = function(navigate: Function) {
    spin.value = true;
    formState.token = Array.isArray(route.query.token) ? route.query.token[0] || '' : route.query.token?.toString() || '';

    authStore.resetPassword(formState)
        .then(() => {
            notification.success({
                message: 'Обновление пароля',
                description: 'Пароль успешно обновлён. Теперь вы можете использовать новые данные для учетной записи, чтобы войти в нее.',
                placement: 'bottomRight',
            });

            navigate();
        })
        .catch((error: AxiosError) => {
            let errorMessage = '';

            switch (error.response?.status || 500) {
                case 400:
                    errorMessage = 'Произошла ошибка. Недействительный токен восстановления';
                    break;
                case 500:
                    errorMessage = 'Ошибка на сервере. Пожалуйста, попробуйте позже';
                    break;
                case 429:
                    errorMessage = 'Слишком много запросов. Повторите через 1 минуту';
                    break;
                default:
                    errorMessage = 'Произошла ошибка. Обновите страницу и повторите действие';
                    break;
            }

            notification.error({
                message: 'Возникла ошибка',
                description: errorMessage,
                placement: 'bottomRight',
            });
        })
        .finally(() => {
            spin.value = false;
        });
}
</script>