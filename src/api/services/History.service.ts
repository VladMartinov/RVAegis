import type { HistoryRecordDto, TypeActionDto } from "@/api/interfaces";

export default (api: any) => {
    api.history = {
        getAllHistoryRecords(): Promise<{ data: HistoryRecordDto[] }> {
            return api.instance.get("/logs");
        },

        getAllTypeActions(): Promise<{ data: TypeActionDto }> {
            return api.instance.get("/logs/type-actions");
        },
    };
};