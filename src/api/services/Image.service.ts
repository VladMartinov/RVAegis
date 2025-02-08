import type { ImageCDto, ImageRDto, ImageUDto } from "@/api/interfaces";

export default (api: any) => {
    api.image = {
        getImages(): Promise<{ data: ImageRDto[] }> {
            return api.instance.get("/images");
        },

        getImageById(id: number): Promise<{ data: ImageRDto }> {
            return api.instance.get(`/images/${id}`);
        },

        createImage(data: ImageCDto): Promise<{ data: ImageCDto }> {
            return api.instance.post("/images", data);
        },

        updateImage(id: number, data: ImageUDto): Promise<{ data: ImageRDto }> {
            return api.instance.put(`/images/${id}`, data);
        },

        deleteImage(id: number): Promise<void> {
            return api.instance.delete(`/images/${id}`);
        }
    };
};