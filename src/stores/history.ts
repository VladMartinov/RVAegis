import api from '@/api';
import { defineStore } from 'pinia';
import type { UserRDto, HistoryRecordDto, TypeActionDto } from '@/api/interfaces';

interface HistoryState {
    users: UserRDto[];
    records: HistoryRecordDto[];
    actionsTypes: TypeActionDto[];
}

export const useHistoryStore = defineStore('history', {
    state: (): HistoryState => ({
        users: [],
        records: [],
        actionsTypes: [],
    }),

    actions: {
        fetchData() {
            return Promise.all([
                api.user.getAllUsers(),
                api.history.getAllHistoryRecords(),
                api.history.getAllTypeActions(),
            ]).then(([users, records, actionsTypes]) => {
                if (users?.data) this.users = users.data;
                if (records?.data) this.records = records.data;
                if (actionsTypes?.data) this.actionsTypes = actionsTypes.data;
            });
        }
    }
});