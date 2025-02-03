export interface ImageCDto {
    fullName?: string | null;
    photo?: string | null;
}

export interface ImageRUDto {
    imageId: number;
    fullName?: string | null;
    photo?: string | null;
    dateCreate: string;               // ISO date-time
    dateUpdate?: string | null;       // ISO date-time
}