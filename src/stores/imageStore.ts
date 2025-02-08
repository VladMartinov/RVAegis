import api from '@/api';
import { defineStore } from 'pinia';
import type { ImageCDto, ImageRDto, ImageUDto, UserCDto, UserRDto, UserRoleDto, UserStatusDto, UserUDto } from '@/api/interfaces';
import type { AxiosResponse } from 'axios';
import { UserStatusEnum } from '@/utils/enum';

interface ImageState {
    images: ImageRDto[];
}

export const useImageStore = defineStore('image', {
    state: (): ImageState => ({
        images: [],
    }),

    actions: {
        fetchData() {
            return Promise.all([
                api.image.getImages(),
            ]).then(([images]) => {
                if (images?.data) this.images = images.data;
            });
        },
        createImage(data: ImageCDto) {
            return api.image.createImage(data).then((response: AxiosResponse<ImageRDto>) => {
                this.images.push(response.data);
            });
        },
        updateImage(imageId: number, data: ImageUDto) {
            return api.image.updateImage(imageId, data).then((response: AxiosResponse<ImageRDto>) => {
                if (!response.data) return;

                const imageIndex = this.images.findIndex((image) => image.imageId === response.data.imageId);
                this.images.splice(imageIndex, 1, response.data);
            });
        },
        deleteImage(imageId: number) {
            return api.image.deleteImage(imageId).then((response: AxiosResponse<void>) => {
                const imageIndex = this.images.findIndex((image) => image.imageId === imageId);
                this.images.splice(imageIndex, 1);
            });
        },
    }
});