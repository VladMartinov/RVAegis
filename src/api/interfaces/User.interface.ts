export interface UserCDto {
    userRoleId: number;
    userStatusId: number;
    fullName: string;
    photo?: string | null;
    login: string;
    password: string;
    email: string;
}

export interface UserRDto {
    userId: number;
    userRoleId: number;
    userStatusId: number;
    fullName: string;
    email: string;
    photo?: string | null;
}

export interface UserUDto {
    userRoleId: number;
    userStatusId: number;
    fullName: string;
    email: string;
    photo?: string | null;
}