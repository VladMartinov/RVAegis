import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { UserRoleEnum } from '@/utils/enum';
import LoginView from '@/views/LoginView.vue';

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
            component: import("@/views/LayoutView.vue"),
            redirect: "/cameras",
            children: [
                //{
                //    path: "/cameras",
                //    name: "cameras",
                //    component: import("@/views/CamerasView.vue"),
                //},
                //{
                //    path: "/images",
                //    name: "images",
                //    component: import("@/views/ImagesView.vue"),
                //},
                //{
                //    path: "/users",
                //    name: "users",
                //    component: import("@/views/UsersView.vue"),
                //    meta: {
                //        accessRole: [UserRoleEnum.Observer, UserRoleEnum.Admin],
                //    },
                //},
                //{
                //    path: "/history",
                //    name: "history",
                //    component: import("@/views/HistoryView.vue"),
                //    meta: {
                //        accessRole: [UserRoleEnum.Observer, UserRoleEnum.Admin],
                //    },
                //},
            ],
        },
    ],
})

export default router;
