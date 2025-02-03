export interface UserCDto {
    userRole: number;
    userStatus: number;
    fullName?: string | null;
    photo?: string | null;
    login?: string | null;
    password?: string | null;
}

export interface UserRDto {
    userId: number;
    userRole: number;
    userStatus: number;
    fullName?: string | null;
    photo?: string | null;
}

export interface UserUDto {
    userRole?: number;
    userStatus?: number;
    fullName?: string | null;
    photo?: string | null;
}