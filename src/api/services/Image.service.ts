import type { ImageCDto, ImageRUDto } from "@/api/interfaces";

export default (api: any) => {
    api.image = {
        getImages(): Promise<{ data: ImageRUDto[] }> {
            return api.instance.get("/images");
        },

        getImageById(id: number): Promise<{ data: ImageRUDto }> {
            return api.instance.get(`/images/${id}`);
        },

        createImage(data: ImageCDto): Promise<{ data: ImageRUDto }> {
            return api.instance.post("/images", data);
        },

        updateImage(id: number, data: ImageRUDto): Promise<{ data: ImageRUDto }> {
            return api.instance.put(`/images/${id}`, data);
        },

        deleteImage(id: number): Promise<void> {
            return api.instance.delete(`/images/${id}`);
        }
    };
};