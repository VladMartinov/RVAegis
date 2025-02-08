import api from '@/api';
import { defineStore } from 'pinia';
import type { UserCDto, UserRDto, UserRoleDto, UserStatusDto, UserUDto } from '@/api/interfaces';
import type { AxiosResponse } from 'axios';
import { UserStatusEnum } from '@/utils/enum';

interface UserState {
    users: UserRDto[];
    roles: UserRoleDto[];
    statuses: UserStatusDto[];
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        users: [],
        roles: [],
        statuses: [],
    }),

    actions: {
        fetchData() {
            return Promise.all([
                api.user.getAllUsers(),
                api.user.getAllUsersRoles(),
                api.user.getAllUsersStatuses(),
            ]).then(([users, roles, statuses]) => {
                if (users?.data) this.users = users.data;
                if (roles?.data) this.roles = roles.data;
                if (statuses?.data) this.statuses = statuses.data;
            });
        },
        createUser(data: UserCDto) {
            return api.user.createUser(data).then((response: AxiosResponse<UserRDto>) => {
                this.users.push(response.data);
            });
        },
        updateUser(userId: number, data: UserUDto) {
            return api.user.updateUser(userId, data).then((response: AxiosResponse<UserRDto>) => {
                if (!response.data) return;

                const userIndex = this.users.findIndex((user) => user.userId === response.data.userId);
                this.users.splice(userIndex, 1, response.data);
            });
        },
        updateUserStatus(userId: number, userStatus: number) {
            return api.user.updateUserStatus(userId, userStatus).then((response: AxiosResponse<UserRDto>) => {
                if (!response.data) return;

                const userIndex = this.users.findIndex((user) => user.userId === response.data.userId);
                this.users.splice(userIndex, 1, response.data);
            });
        },
        deleteUser(userId: number) {
            return api.user.deleteUser(userId).then((response: AxiosResponse<void>) => {
                const userIndex = this.users.findIndex((user) => user.userId === userId);
                this.users[userIndex].userStatusId = UserStatusEnum.Removed;
            });
        },
    }
});