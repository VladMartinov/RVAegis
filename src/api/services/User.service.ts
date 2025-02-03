import type { UserCDto, UserRDto, UserUDto } from "@/api/interfaces";

export default (api: any) => {
    api.user = {
        getAllUsers(): Promise<{ data: UserRDto[] }> {
            return api.instance.get("/users");
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