export interface ImageCDto {
    fullName: string;
    photo: string ;
}

export interface ImageRDto {
    imageId: number;
    fullName: string;
    photo: string;
    dateCreate: string;               // ISO date-time
    dateUpdate?: string | null;       // ISO date-time
}

export interface ImageUDto {
    fullName?: string | null;
    photo?: string | null;
}