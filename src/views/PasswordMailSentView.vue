<template>
  <a-flex :style="{ height: '100%' }" justify="center" align="center">
      <a-card :style="{ width: '700px', boxShadow: 'none' }" :bordered="false">
          
          <a-result
            status="success"
            title="Письмо отправлено"
            sub-title="Если аккаунт с указанным Email зарегистрирован, на него будет отправлено письмо со ссылкой для восстановления пароля"
          >
              <template #extra>
                  <router-link
                          to="/login"
                          custom
                          v-slot="{ navigate }"
                      >
                          <a-button type="primary" @click="navigate">
                              Вернуться
                          </a-button>
                  </router-link>
              </template>
          </a-result>
      </a-card>
  </a-flex>
</template>