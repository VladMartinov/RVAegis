import type { UserCDto, UserRDto, UserUDto, UserRoleDto, UserStatusDto } from "@/api/interfaces";

export default (api: any) => {
    api.user = {
        getAllUsers(): Promise<{ data: UserRDto[] }> {
            return api.instance.get("/users");
        },

        getAllUsersRoles(): Promise<{ data: UserRoleDto[] }> {
            return api.instance.get("/users/users-roles");
        },

        getAllUsersStatuses(): Promise<{ data: UserStatusDto[] }> {
            return api.instance.get("/users/users-statuses");
        },

        createUser(userData: UserCDto): Promise<{ data: UserCDto }> {
            return api.instance.post("/users", userData);
        },

        getCurrentUser(): Promise<{ data: UserRDto }> {
            return api.instance.get("/users/current-user");
        },

        getUserById(id: number): Promise<{ data: UserRDto }> {
            return api.instance.get(`/users/${id}`);
        },

        updateUser(id: number, data: UserUDto): Promise<{ data: UserRDto }> {
            return api.instance.put(`/users/${id}`, data);
        },

        deleteUser(id: number): Promise<void> {
            return api.instance.delete(`/users/${id}`);
        },

        updateUserStatus(id: number, status: number): Promise<{ data: UserRDto }> {
            return api.instance.put(`/users/${id}/status?status=${status}`);
        }
    };
};