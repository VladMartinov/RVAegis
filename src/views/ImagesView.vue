<template>
  <a-space direction="vertical" :style="{ width: '100%' }" :size="15">
      <a-collapse v-model:activeKey="collapseItems" ghost>
          <a-collapse-panel key="1" header="Фильтр">
              <a-flex gap="middle" justify="space-between">
                  <a-space direction="vertical" :style="{ maxWidth: '400px', flexGrow: '1' }">
                      <a-typography-text>Наименование:</a-typography-text>

                      <a-input-search
                          v-model:value="searchIntermediateValue"
                          placeholder="Input search text"
                          @search="handleSearchClick"
                      />
                  </a-space>

                  <a-space direction="vertical" :style="{ maxWidth: '400px', flexGrow: '1' }">
                      <a-typography-text>Дата создания:</a-typography-text>

                      <a-range-picker v-model:value="selectedDateRange" show-time />
                  </a-space>
              </a-flex>
          </a-collapse-panel>
      </a-collapse>

      <a-flex justify="space-between" align="center">
        <a-typography-title :level="4" :style="{ margin: '0px' }">Изображения</a-typography-title>

        <a-space>
            <a-button type="primary" @click="handleAddImageButton">
                <template #icon><plus-outlined /></template>
                Добавить изображение
            </a-button>
  
            <a-button v-if="selectedTableRows.length" danger @click="handleDeleteSelectedImagesButton">
                <template #icon><delete-outlined /></template>
                Удалить выбранные изображения
            </a-button>
        </a-space>
      </a-flex>

      <a-table
          :pagination="{ position: ['bottomLeft'], showSizeChanger: true, showQuickJumper: true }"
          :columns="tableColumns"
          :data-source="tableData"
          :row-selection="{ selectedRowKeys: selectedTableRows, onChange: onTableSelectChange }"
      >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'imagePhoto'">
                <a-avatar :src="record.imagePhoto" shape="square" :size="200">
                    <template #icon><file-image-outlined /></template>
                </a-avatar>
            </template>

            <template v-if="column.key === 'imageName'">
                {{ record.imageName }}
            </template>

            <template v-if="column.key === 'dateCreate'">
                {{ record.dateCreate }}
            </template>

            <template v-if="column.key === 'actions'">
                <span>
                    <a-button type="link" @click="handleUpdateImageButton(record.key)">Обновить</a-button>
                    <a-divider type="vertical" />
                    <a-button type="link" @click="handleDeleteImageButton(record.key)">Удалить</a-button>
                </span>
            </template>
          </template>
      </a-table>
  </a-space>

  <a-modal v-model:open="modalOpen" :title="isUpdateModal ? 'Обновить изображение' : 'Добавить изображение'">
      <template #footer>
          <a-button key="back" @click="handleCancelButton">Отмена</a-button>
          <a-button key="submit" type="primary" :disabled="isUpdateModal ? !validateUpdateFields : !validateCreateFields" @click="isUpdateModal ? handleOkUpdateButton() : handleOkCreateButton()">{{ isUpdateModal ? 'Обновить' : 'Создать' }}</a-button>
      </template>
      <a-form ref="formRef" :model="formState" layout="vertical">
          <!-- Загрузка фото -->
          <a-form-item label="Фото">
              <a-upload
                  name="image"
                  list-type="picture-card"
                  class="image-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  accept="image/*"
              >
                  <img 
                      v-if="formState.photoPreview || formState.photoBlob"
                      :src="formState.photoPreview || formState.photoBlob"
                      alt="Image"
                      style="width: 100%; height: auto; max-height: 400px; object-fit: contain;"
                  />
                  <div v-else style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
                      <plus-outlined />
                      <div style="margin-top: 8px">Загрузить</div>
                  </div>
              </a-upload>
          </a-form-item>

          <!-- ФИО -->
          <a-form-item 
              label="ФИО" 
              name="imageName"
              :rules="[{ required: true, message: 'Пожалуйста, введите ФИО' }]"
          >
              <a-input v-model:value="formState.imageName" />
          </a-form-item>
      </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, createVNode, reactive, ref } from 'vue';
import { App, Modal, type Form, type UploadProps } from 'ant-design-vue';
import { PlusOutlined, FileImageOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useImageStore } from '@/stores/imageStore';
import { getMimeType } from '@/utils/helper';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { ImageCDto, ImageUDto } from '@/api/interfaces';

interface TableData {
    key: number;
    imagePhoto: string;
    imageName: string;
    dateCreate: string;
}

interface FormState {
    imageId?: number;
    imageName: string;
    photoFile?: File;
    photoPreview?: string;
    photoBlob?: string;
}

type RangeValue = [Dayjs, Dayjs];

const { notification } = App.useApp();
const imageStore = useImageStore();
const collapseItems = ref([]);

const searchValue = ref<string>('');
const searchIntermediateValue = ref<string>('');
const selectedDateRange = ref<RangeValue>();
const selectedTableRows = ref<Key[]>([]);

const modalOpen = ref<boolean>();
const isUpdateModal = ref<boolean>();
const formRef = ref<InstanceType<typeof Form>>();
const formState = reactive<FormState>({
    imageName: '',
    photoPreview: undefined
});

const tableColumns = computed(() => {
    const columns = [
        {
            title: 'Фото',
            dataIndex: 'imagePhoto',
            key: 'imagePhoto',
        },
        {
            title: 'Наименование',
            dataIndex: 'imageName',
            sorter: {
                compare: (a: TableData, b: TableData) => {
                    if (!a.imageName && !b.imageName) return 0;
                    if (!a.imageName) return -1;
                    if (!b.imageName) return 1;
                    return a.imageName.localeCompare(b.imageName);
                },
                multiple: 1,
            },
            key: 'imageName',
        },
        {
            title: 'Дата создания',
            dataIndex: 'dateCreate',
            sorter: {
                compare: (a: TableData, b: TableData) => {
                    const dateA = dayjs(a.dateCreate);
                    const dateB = dayjs(b.dateCreate);

                    if (dateA.isAfter(dateB, 'second')) return 1;
                    if (dateA.isBefore(dateB, 'second')) return -1;
                    return 0;
                },
                multiple: 2,
            },
            key: 'dateCreate',
        },
        {
            title: 'Действия',
            dataIndex: 'actions',
            key: 'actions',
        }
    ];

    return columns;
});

const tableData = computed(() => {
    let images = [...imageStore.images];

    images = images.filter((image) => image.photo);
    if (searchValue.value.length) images = images.filter((image) => image.fullName!.includes(searchValue.value));
    if (selectedDateRange.value?.[0] || selectedDateRange.value?.[1]) {
        images = images.filter((image) =>
            (!selectedDateRange.value?.[0] || (dayjs(image.dateCreate).isAfter(selectedDateRange.value[0])))
            && (!selectedDateRange.value?.[1] || (dayjs(image.dateCreate).isBefore(selectedDateRange.value[1])))
        );
    }

    return images.map((image) => {
        let photo = image.photo;
        if (photo && !photo.startsWith('data:image')) {
            const mimeType = getMimeType(photo);
            photo = `data:${mimeType};base64,${photo}`;
        }

        return {
            key: image.imageId,
            imagePhoto: photo || '',
            imageName: image?.fullName || '',
            dateCreate: dayjs(image?.dateCreate).format('DD.MM.YYYY HH:mm:ss'),
        } as TableData;
    });
});

const validateCreateFields = computed(() => {
    return (
        !!formState.photoFile
        && !!formState.imageName.trim()
    );
});

const validateUpdateFields = computed(() => {
    return (
        !!(formState.photoFile || formState.photoBlob)
        && !!formState.imageName.trim()
    );
});

const handleSearchClick = () => {
    if (searchIntermediateValue.value !== searchValue.value) searchValue.value = searchIntermediateValue.value;
};

const onTableSelectChange = (selectedRowKeys: Key[]) => {
    selectedTableRows.value = selectedRowKeys;
};

// Обработка загрузки фото
const beforeUpload: UploadProps['beforeUpload'] = file => {
    formState.photoFile = file;
    formState.photoPreview = URL.createObjectURL(file);
    return false;
};

// Открытие модалки добавления
const handleAddImageButton = () => {
    resetModalFields();
    modalOpen.value = true;
};

// Заполение полей модального окна
const fillModalFields = (imageId: number) => {
    const image = imageStore.images.find((image) => image.imageId === imageId);

    if (!image) return;

    formState.imageId = image.imageId;
    formState.imageName = image.fullName;

    let photo = image.photo;
    if (photo && !photo.startsWith('data:image')) {
        const mimeType = getMimeType(photo);
        photo = `data:${mimeType};base64,${photo}`;
    }

    formState.photoBlob = photo || undefined;
};

// Открытие модалки редактирования
const handleUpdateImageButton = (imageId: number) => {
    resetModalFields();
    fillModalFields(imageId);

    isUpdateModal.value = true;
    modalOpen.value = true;
};

// Закрытие модалки
const handleCancelButton = () => {
    modalOpen.value = false;
    isUpdateModal.value = false;
    resetModalFields();
}

// Сброс полей формы
const resetModalFields = () => {
    formState.imageName = '';

    formState.photoPreview = undefined;
    formState.photoFile = undefined;
}

// Обработка создания изображения
const handleOkCreateButton = async () => {
    try {
        let base64Photo: string | null = null;
        if (formState.photoFile) {
            base64Photo = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(formState.photoFile!);
                reader.onload = () => resolve((reader.result as string).split(",")[1]);
                reader.onerror = error => reject(error);
            });
        }

        if (!base64Photo) throw new Error('Изображение отсутствует');

        const imageData: ImageCDto = {
            fullName: formState.imageName,
            photo: base64Photo
        };

        await imageStore.createImage(imageData);

        notification.success({
            message: 'Изображение создано',
            description: 'Изображение успешно создано.',
            placement: 'bottomRight',
        });

        modalOpen.value = false;
        resetModalFields();
    } catch (error) {
        notification.error({
            message: 'Ошибка создания',
            description: 'Произошла ошибка при попытке создать изображение. Пожалуйста, попробуйте снова.',
            placement: 'bottomRight',
        });
    }
};

// Обработка обновления изображения
const handleOkUpdateButton = async () => {
    try {
        let base64Photo: string | null = null;
        if (formState.photoFile) {
            base64Photo = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(formState.photoFile!);
                reader.onload = () => resolve((reader.result as string).split(",")[1]);
                reader.onerror = error => reject(error);
            });
        } else if (formState.photoBlob) {
            base64Photo = formState.photoBlob.split(",")[1];
        }

        if (!base64Photo) throw new Error('Изображение отсутствует');

        const imageData: ImageUDto = {
            fullName: formState.imageName,
            photo: base64Photo
        };

        await imageStore.updateImage(formState.imageId!, imageData);

        notification.success({
            message: 'Изображение обновлено',
            description: 'Изображение успешно обновлено.',
            placement: 'bottomRight',
        });

        modalOpen.value = false;
        resetModalFields();
    } catch (error) {
        notification.error({
            message: 'Ошибка обновления',
            description: 'Произошла ошибка при попытке обновить изображение. Пожалуйста, попробуйте снова.',
            placement: 'bottomRight',
        });
    }
};

const handleDeleteImageButton = (imageId: number) => {
    Modal.confirm({
        title: 'Удаление изображение',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Вы уверены, что хотите удалить это изображение? Это действие невозможно отменить.',
        onOk() {
            return imageStore.deleteImage(imageId).then(() => {
                if (selectedTableRows.value.includes(imageId)) {
                    const imageIndex = selectedTableRows.value.findIndex((item) => item === imageId);
                    selectedTableRows.value.splice(imageIndex, 1);
                }

                notification.success({
                    message: 'Изображение удалено',
                    description: 'Изображение успешно удалено из системы.',
                    placement: 'bottomRight',
                });
            }).catch(() => {
                notification.error({
                    message: 'Ошибка удаления',
                    description: 'Произошла ошибка при попытке удалить изображение. Пожалуйста, попробуйте снова.',
                    placement: 'bottomRight',
                });
            });
        },
        onCancel() {},
    });
};

const handleDeleteSelectedImagesButton = () => {
    Modal.confirm({
        title: 'Удаление изображений',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Вы уверены, что хотите удалить эти изображения? Это действие невозможно отменить.',
        onOk() {
            return Promise.all(selectedTableRows.value.map((imageId) => imageStore.deleteImage(Number(imageId)))).then(() => {
                selectedTableRows.value = [];

                notification.success({
                    message: 'Изображения удалены',
                    description: 'Изображения успешно удалены из системы.',
                    placement: 'bottomRight',
                });
            }).catch(() => {
                notification.error({
                    message: 'Ошибка удаления',
                    description: 'Произошла ошибка при попытке удалить изображения. Пожалуйста, попробуйте снова.',
                    placement: 'bottomRight',
                });
            });
        },
        onCancel() {},
    });
};
</script>

<style scoped lang="less">
.image-uploader:deep(.ant-upload.ant-upload-select.ant-upload-select-picture-card) {
    width: 100%;
    height: auto;
}
</style>