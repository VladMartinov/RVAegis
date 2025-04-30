import api from '@/api';
import { defineStore } from 'pinia';
import type { UserRDto, HistoryRecordDto, TypeActionDto, RecognitionLogDto } from '@/api/interfaces';

interface HistoryState {
    users: UserRDto[];
    operationRecords: HistoryRecordDto[];
    actionsTypes: TypeActionDto[];
    recognitionRecords: RecognitionLogDto[];
}

export const useHistoryStore = defineStore('history', {
    state: (): HistoryState => ({
        users: [],
        operationRecords: [],
        actionsTypes: [],
        recognitionRecords: [],
    }),

    actions: {
        fetchData() {
            return Promise.all([
                api.user.getAllUsers(),
                api.history.getAllHistoryRecords(),
                api.history.getAllTypeActions(),
                api.history.getAllRecognitionLogs(),
            ]).then(([users, operationRecords, actionsTypes, recognitionRecords]) => {
                if (users?.data) this.users = users.data;
                if (operationRecords?.data) this.operationRecords = operationRecords.data;
                if (actionsTypes?.data) this.actionsTypes = actionsTypes.data;
                if (recognitionRecords?.data) this.recognitionRecords = recognitionRecords.data;
            });
        }
    }
});