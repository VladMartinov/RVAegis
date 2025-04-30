<template>
    <a-space direction="vertical" :style="{ width: '100%' }">
        <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane :key="HistoryTabEnum.SystemOperation" tab="Операции системы" />
            <a-tab-pane :key="HistoryTabEnum.Recognition" tab="Детекция лиц" />
        </a-tabs>

        <a-collapse v-model:activeKey="collapseItems" ghost>
            <a-collapse-panel key="1" header="Фильтр">
                <a-flex v-if="activeTab === HistoryTabEnum.SystemOperation" gap="middle" justify="space-between">
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

                        <a-range-picker v-model:value="selectedOperationDateRange" show-time />
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

                <a-flex v-else-if="activeTab === HistoryTabEnum.Recognition" gap="middle" justify="space-between">
                    <a-space direction="vertical" :style="{ maxWidth: '300px', flexGrow: '1' }">
                        <a-typography-text>ФИО:</a-typography-text>

                        <a-select
                            v-model:value="selectedFullNames"
                            mode="multiple"
                            style="width: 100%"
                            placeholder="Please select"
                            :options="fullNameOptions"
                        />
                    </a-space>

                    <a-space direction="vertical" :style="{ maxWidth: '340px', flexGrow: '1' }">
                        <a-typography-text>Период:</a-typography-text>

                        <a-range-picker v-model:value="selectedRecognitionDateRange" show-time />
                    </a-space>

                    <a-space direction="vertical" :style="{ maxWidth: '300px', flexGrow: '1' }">
                        <a-typography-text>Камера:</a-typography-text>

                        <a-select
                            v-model:value="selectedCameras"
                            mode="multiple"
                            style="width: 100%"
                            placeholder="Please select"
                            :options="cameraOptions"
                        />
                    </a-space>
                </a-flex>
            </a-collapse-panel>
        </a-collapse>

        <a-table :pagination="{ position: ['topLeft', 'bottomLeft'], showSizeChanger: true, showQuickJumper: true }" :columns="tableColumns" :data-source="tableData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'image'">
                    <a-avatar :src="record.image" shape="square" :size="200">
                        <template #icon><file-image-outlined /></template>
                    </a-avatar>
                </template>
            </template>
        </a-table>
    </a-space>
</template>

<script setup lang="ts">
import { FileImageOutlined } from '@ant-design/icons-vue';
import { computed, ref } from 'vue';
import { useHistoryStore } from '@/stores/historyStore';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { HistoryTabEnum } from '@/utils/enum';
import _ from 'lodash';

interface SelectRecord {
    value: number | string;
    label: string;
}

interface OperationTableData {
    user: string;
    actionType: string;
    date: string;
}

interface RecognitionTableData {
    image: string;
    fullName: string;
    date: string;
    camera: string;
}

type RangeValue = [Dayjs, Dayjs];

const historyStore = useHistoryStore();
const collapseItems = ref([]);
const selectedUsers = ref<number[]>([]);
const selectedActionsTypes = ref<number[]>([]);
const selectedFullNames = ref<string[]>([]);
const selectedCameras = ref<number[]>([]);
const selectedOperationDateRange = ref<RangeValue>();
const selectedRecognitionDateRange = ref<RangeValue>();
const activeTab = ref<HistoryTabEnum>(HistoryTabEnum.SystemOperation);

const usersRecords = computed(() => historyStore.users.map((user) => ({ value: user.userId, label: user.fullName } as SelectRecord)));
const actionsTypesRecords = computed(() => historyStore.actionsTypes.map((actionType) => ({ value: actionType.actionId, label: actionType.actionDescription } as SelectRecord)));

const fullNameOptions = computed(() => _.uniqBy(historyStore.recognitionRecords.map((record) => ({ value: record.label, label: record.label } as SelectRecord)), 'value'));
const cameraOptions = computed(() => _.uniqBy(historyStore.recognitionRecords.map((record) => ({ value: record.cameraIndex, label: `Камера №${record.cameraIndex}` } as SelectRecord)), 'value'));

const tableData = computed(() => {
    let records;

    switch (activeTab.value) {
        case HistoryTabEnum.SystemOperation:
            records = [...historyStore.operationRecords];

            if (selectedUsers.value.length) records = records.filter((record) => selectedUsers.value.includes(record.userId));
            if (selectedActionsTypes.value.length) records = records.filter((record) => selectedActionsTypes.value.includes(record.typeActionId));
            if (selectedOperationDateRange.value?.[0] || selectedOperationDateRange.value?.[1]) {
                records = records.filter((record) =>
                    (!selectedOperationDateRange.value?.[0] || (dayjs(record.dateAction).isAfter(selectedOperationDateRange.value[0])))
                    && (!selectedOperationDateRange.value?.[1] || (dayjs(record.dateAction).isBefore(selectedOperationDateRange.value[1])))
                );
            }

            return records.map((record) => {
                const user = historyStore.users.find((user) => user.userId === record.userId);
                const actionType = historyStore.actionsTypes.find((actionType) => actionType.actionId === record.typeActionId);

                return {
                    user: user?.fullName || '',
                    actionType: actionType?.actionDescription || '',
                    date: dayjs(record.dateAction).format('DD.MM.YYYY HH:mm:ss'),
                } as OperationTableData;
            });
        case HistoryTabEnum.Recognition:
            records = [...historyStore.recognitionRecords];

            if (selectedFullNames.value.length) records = records.filter((record) => selectedFullNames.value.includes(record.label));
            if (selectedCameras.value.length) records = records.filter((record) => selectedCameras.value.includes(record.cameraIndex));
            if (selectedRecognitionDateRange.value?.[0] || selectedRecognitionDateRange.value?.[1]) {
                records = records.filter((record) =>
                    (!selectedRecognitionDateRange.value?.[0] || (dayjs(record.recognitionTime).isAfter(selectedRecognitionDateRange.value[0])))
                    && (!selectedRecognitionDateRange.value?.[1] || (dayjs(record.recognitionTime).isBefore(selectedRecognitionDateRange.value[1])))
                );
            }

            return records.map((record) => {
                return {
                    image: `data:image/jpeg;base64,${record.imageData}`,
                    fullName: record.label,
                    date: dayjs(record.recognitionTime).format('DD.MM.YYYY HH:mm:ss'),
                    camera: `Камера №${record.cameraIndex}`,
                } as RecognitionTableData;
            });
        default:
            return records;
    }
});

const tableColumns = computed(() => {
    switch (activeTab.value) {
        case HistoryTabEnum.SystemOperation:
            return [
                {
                    title: 'Пользователь',
                    dataIndex: 'user',
                    key: 'user',
                    sorter: {
                        compare: (a: OperationTableData, b: OperationTableData) => {
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
                    key: 'actionType',
                    sorter: {
                        compare: (a: OperationTableData, b: OperationTableData) => {
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
                    key: 'date',
                    sorter: {
                        compare: (a: OperationTableData, b: OperationTableData) => {
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
        case HistoryTabEnum.Recognition:
            return [
                {
                    title: 'Изображение',
                    dataIndex: 'image',
                    key: 'image',
                },
                {
                    title: 'ФИО',
                    dataIndex: 'fullName',
                    key: 'fullName',
                    sorter: {
                        compare: (a: RecognitionTableData, b: RecognitionTableData) => {
                            if (!a.fullName && !b.fullName) return 0;
                            if (!a.fullName) return -1;
                            if (!b.fullName) return 1;
                            return a.fullName.localeCompare(b.fullName);
                        },
                        multiple: 1,
                    },
                },
                {
                    title: 'Дата',
                    dataIndex: 'date',
                    key: 'date',
                    sorter: {
                        compare: (a: RecognitionTableData, b: RecognitionTableData) => {
                            const dateA = dayjs(a.date);
                            const dateB = dayjs(b.date);
            
                            if (dateA.isAfter(dateB, 'second')) return 1;
                            if (dateA.isBefore(dateB, 'second')) return -1;
                            return 0;
                        },
                        multiple: 2,
                    },
                },
                {
                    title: 'Камера',
                    dataIndex: 'camera',
                    key: 'camera',
                    sorter: {
                        compare: (a: RecognitionTableData, b: RecognitionTableData) => {
                            if (!a.camera && !b.camera) return 0;
                            if (!a.camera) return -1;
                            if (!b.camera) return 1;
                            return a.camera > b.camera
                                ? -1
                                : a.camera < b.camera
                                    ? 1
                                    : 0;
                        },
                        multiple: 3,
                    },
                }
            ];
    }
});
</script>