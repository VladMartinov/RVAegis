import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { UserRoleEnum } from '@/utils/enum';
import LoginView from '@/views/LoginView.vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useUserStore } from '@/stores/userStore';
import { useImageStore } from '@/stores/imageStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/login",
            name: "login",
            component: () => LoginView,
        },
        {
            path: "/password-mail",
            children: [
                {
                    path: "",
                    name: "password-mail",
                    component: () => import("@/views/PasswordMailView.vue"),
                },
                {
                    path: "sent",
                    name: "password-mail-sent",
                    component: () => import("@/views/PasswordMailSentView.vue"),
                },
            ]
        },
        {
            path: "/reset-password",
            name: "reset-password",
            component: () => import("@/views/ResetPasswordView.vue"),
        },
        {
            beforeEnter: (to, from, next) => {
                const authStore = useAuthStore();

                authStore.fetchCurrentUser()
                    .then(() => {
                        next();
                    })
                    .catch(() => {});
            },
            path: "/",
            name: "Layout",
            component: () => import("@/views/LayoutView.vue"),
            redirect: "/cameras",
            children: [
                {
                    path: "/cameras",
                    name: "cameras",
                    component: () => import("@/views/CamerasView.vue"),
                },
                {
                  beforeEnter: (to, from, next) => {
                      const imageStore = useImageStore();

                      imageStore.fetchData()
                          .then(() => {
                              next();
                          })
                          .catch(() => {});
                  },
                    path: "/images",
                    name: "images",
                    component: () => import("@/views/ImagesView.vue"),
                },
                {
                    beforeEnter: (to, from, next) => {
                        const userStore = useUserStore();

                        userStore.fetchData()
                            .then(() => {
                                next();
                            })
                            .catch(() => {});
                    },
                    path: "/users",
                    name: "users",
                    component: () => import("@/views/UsersView.vue"),
                    meta: {
                        accessRole: [UserRoleEnum.Observer, UserRoleEnum.Admin],
                    },
                },
                {
                    beforeEnter: (to, from, next) => {
                        const historyStore = useHistoryStore();

                        historyStore.fetchData()
                            .then(() => {
                                next();
                            })
                            .catch(() => {});
                    },
                    path: "/history",
                    name: "history",
                    component: () => import("@/views/HistoryView.vue"),
                    meta: {
                        accessRole: [UserRoleEnum.Observer, UserRoleEnum.Admin],
                    },
                },
            ],
        },
    ],
})

export default router;
