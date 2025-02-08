<template>
    <a-space direction="vertical" :style="{ width: '100%' }">
        <a-collapse v-model:activeKey="collapseItems" ghost>
            <a-collapse-panel key="1" header="Фильтр">
                <a-flex gap="middle" justify="space-between">
                    <a-space direction="vertical" :style="{ maxWidth: '300px', flexGrow: '1' }">
                        <a-typography-text>Пользователь:</a-typography-text>

                        <a-select
                            v-model:value="selectedUsers"
                            mode="multiple"
                            style="width: 100%"
                            placeholder="Please select"
                            :options="usersRecords"
                        />
                    </a-space>

                    <a-space direction="vertical" :style="{ maxWidth: '340px', flexGrow: '1' }">
                        <a-typography-text>Период:</a-typography-text>

                        <a-range-picker v-model:value="selectedDateRange" show-time />
                    </a-space>

                    <a-space direction="vertical" :style="{ maxWidth: '300px', flexGrow: '1' }">
                        <a-typography-text>Тип действия:</a-typography-text>

                        <a-select
                            v-model:value="selectedActionsTypes"
                            mode="multiple"
                            style="width: 100%"
                            placeholder="Please select"
                            :options="actionsTypesRecords"
                        />
                    </a-space>
                </a-flex>
            </a-collapse-panel>
        </a-collapse>

        <a-table :pagination="{ position: ['topLeft', 'bottomLeft'], showSizeChanger: true, showQuickJumper: true }" :columns="tableColumnts" :data-source="tableData" />
    </a-space>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useHistoryStore } from '@/stores/historyStore';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface SelectRecord {
    value: number;
    label: string;
}

interface TableData {
    user: string;
    actionType: string;
    date: string;
}

type RangeValue = [Dayjs, Dayjs];

const tableColumnts = [
    {
        title: 'Пользователь',
        dataIndex: 'user',
        sorter: {
            compare: (a: TableData, b: TableData) => {
                if (!a.user && !b.user) return 0;
                if (!a.user) return -1;
                if (!b.user) return 1;
                return a.user.localeCompare(b.user);
            },
            multiple: 1,
        },
    },
    {
        title: 'Тип действия',
        dataIndex: 'actionType',
        sorter: {
            compare: (a: TableData, b: TableData) => {
                if (!a.actionType && !b.actionType) return 0;
                if (!a.actionType) return -1;
                if (!b.actionType) return 1;
                return a.actionType.localeCompare(b.actionType);
            },
            multiple: 2,
        },
    },
    {
        title: 'Дата',
        dataIndex: 'date',
        sorter: {
            compare: (a: TableData, b: TableData) => {
                const dateA = dayjs(a.date);
                const dateB = dayjs(b.date);

                if (dateA.isAfter(dateB, 'second')) return 1;
                if (dateA.isBefore(dateB, 'second')) return -1;
                return 0;
            },
            multiple: 3,
        },
    }
];

const historyStore = useHistoryStore();
const collapseItems = ref([]);
const selectedUsers = ref<number[]>([]);
const selectedActionsTypes = ref<number[]>([]);
const selectedDateRange = ref<RangeValue>();

const usersRecords = computed(() => historyStore.users.map((user) => ({ value: user.userId, label: user.fullName } as SelectRecord)));
const actionsTypesRecords = computed(() => historyStore.actionsTypes.map((actionType) => ({ value: actionType.actionId, label: actionType.actionDescription } as SelectRecord)));

const tableData = computed(() => {
    let records = [...historyStore.records];

    if (selectedUsers.value.length) records = records.filter((record) => selectedUsers.value.includes(record.userId));
    if (selectedActionsTypes.value.length) records = records.filter((record) => selectedActionsTypes.value.includes(record.typeActionId));
    if (selectedDateRange.value?.[0] || selectedDateRange.value?.[1]) {
        records = records.filter((record) =>
            (!selectedDateRange.value?.[0] || (dayjs(record.dateAction).isAfter(selectedDateRange.value[0])))
            && (!selectedDateRange.value?.[1] || (dayjs(record.dateAction).isBefore(selectedDateRange.value[1])))
        );
    }

    return records.map((record) => {
        const user = historyStore.users.find((user) => user.userId === record.userId);
        const actionType = historyStore.actionsTypes.find((actionType) => actionType.actionId === record.typeActionId);

        return {
            user: user?.fullName || '',
            actionType: actionType?.actionDescription || '',
            date: dayjs(record.dateAction).format('DD.MM.YYYY HH:mm:ss'),
        } as TableData;
    });
});
</script>