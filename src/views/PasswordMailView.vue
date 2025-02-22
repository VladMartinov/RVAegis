<template>
  <a-flex :style="{ height: '100%' }" justify="center" align="center">
      <a-card :style="{ width: '500px', boxShadow: 'none' }" :bordered="false">
          <a-spin in :spinning="spin" tip="Загрузка...">
              <a-row justify="center">
                  <a-col :style="{ textAlign: 'center' }">
                      <a-typography-title>Восстановление</a-typography-title>
                      <a-typography-paragraph type="secondary">Пожалуйста, укажите email привязанный к пользователю</a-typography-paragraph>
                  </a-col>
              </a-row>

              <a-row>
                  <a-col :span="24">
                      <a-form
                          :model="formState"
                          name="login_form"
                          class="login-form"
                          :rules="rules"
                          :label-col="{ span: 4 }"
                      >
                          <a-form-item
                              label="Почта"
                              label-align="left"
                              name="email"
                              has-feedback
                          >
                              <a-input v-model:value="formState.email" />
                          </a-form-item>
                      </a-form>
                  </a-col>
              </a-row>

              <a-row justify="center">
                  <a-col>
                      <router-link
                              to="/password-mail/sent"
                              custom
                              v-slot="{ navigate }"
                          >
                              <a-button :disabled="disabled" type="primary" @click="handleSentButton(navigate)">
                                  Отправить
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
import { App } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { useAuthStore } from '@/stores/authStore';
import type { AxiosError } from 'axios';

interface FormState {
    email: string;
}

const authStore = useAuthStore();
const { notification } = App.useApp();
const formState = reactive<FormState>({
    email: '',
});
const spin = ref<boolean>(false);

const disabled = computed(() => {
    return !formState.email.trim();
});

const handleSentButton = function(navigate: Function) {
    spin.value = true;

    authStore.sendPasswordResetLink(formState)
        .then(() => {
            navigate();
        })
        .catch((error: AxiosError) => {
            let errorMessage = '';

            switch (error.response?.status) {
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
                message: `Возникла ошибка`,
                description: errorMessage,
                placement: 'bottomRight',
            });
        })
        .finally(() => {
            spin.value = false;
        });
}

const validateEmail = async (_rule: Rule, value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value?.trim()) {
        return Promise.reject('Введите адрес электронной почты');
    }

    if (!emailPattern.test(value)) {
        return Promise.reject('Некорректный формат email');
    }

    return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
    email: [{ required: true, validator: validateEmail, trigger: 'change' }],
};
</script>