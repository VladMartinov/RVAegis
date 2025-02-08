<template>
    <a-space direction="vertical" :style="{ width: '100%' }" :size="15">
        <a-collapse v-model:activeKey="collapseItems" ghost>
            <a-collapse-panel key="1" header="Фильтр">
                <a-flex gap="middle" justify="space-between">
                    <a-space direction="vertical" :style="{ maxWidth: '300px', flexGrow: '1' }">
                        <a-typography-text>Роль:</a-typography-text>

                        <a-select
                            v-model:value="selectedRoles"
                            mode="multiple"
                            style="width: 100%"
                            placeholder="Please select"
                            :options="usersRolesRecords"
                        />
                    </a-space>

                    <a-space direction="vertical" :style="{ maxWidth: '300px', flexGrow: '1' }">
                        <a-typography-text>Статус:</a-typography-text>

                        <a-select
                            v-model:value="selectedStatuses"
                            mode="multiple"
                            style="width: 100%"
                            placeholder="Please select"
                            :options="usersStatusesRecords"
                        />
                    </a-space>
                </a-flex>
            </a-collapse-panel>
        </a-collapse>

        <a-flex justify="space-between" align="center">
          <a-typography-title :level="4" :style="{ margin: '0px' }">Пользователи</a-typography-title>

          <a-space>
              <a-button v-if="authStore.currentUser?.userRoleId === UserRoleEnum.Admin" type="primary" @click="handleAddUserButton">
                  <template #icon><plus-outlined /></template>
                  Добавить пользователя
              </a-button>
    
              <a-button v-if="authStore.currentUser?.userRoleId === UserRoleEnum.Admin && selectedTableRows.length" danger @click="handleDeleteSelectedUsersButton">
                  <template #icon><delete-outlined /></template>
                  Удалить выбранных пользователей
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
              <template v-if="column.key === 'userPhoto'">
                  <a-avatar :src="record.userPhoto" shape="square" size="large">
                      <template #icon><user-outlined /></template>
                  </a-avatar>
              </template>

              <template v-if="column.key === 'userName'">
                  {{ record.userName }}
              </template>

              <template v-if="column.key === 'userRole'">
                  {{ record.userRole }}
              </template>

              <template v-if="column.key === 'userStatus'">
                  {{ record.userStatus }}
              </template>

              <template v-if="column.key === 'actions'">
                  <span>
                      <a-button type="link" @click="handleUpdateUserButton(record.key)">Обновить</a-button>
                      <a-divider type="vertical" />
                      <a-button v-if="record.userStatus === 'Активен'" type="link" @click="handleBlockUserButton(record.key)">Заблокировать</a-button>
                      <a-button v-else type="link" @click="handleUnblockUserButton(record.key)">Разблокировать</a-button>
                      <a-divider type="vertical" />
                      <a-button type="link" @click="handleDeleteUserButton(record.key)">Удалить</a-button>
                  </span>
              </template>
            </template>
        </a-table>
    </a-space>

    <a-modal v-model:open="modalOpen" :title="isUpdateModal ? 'Обновить пользователя' : 'Добавить пользователя'">
        <template #footer>
            <a-button key="back" @click="handleCancelButton">Отмена</a-button>
            <a-button key="submit" type="primary" :disabled="isUpdateModal ? !validateUpdateFields : !validateCreateFields" @click="isUpdateModal ? handleOkUpdateButton() : handleOkCreateButton()">{{ isUpdateModal ? 'Обновить' : 'Создать' }}</a-button>
        </template>
        <a-form ref="formRef" :model="formState" layout="vertical">
            <!-- ФИО -->
            <a-form-item 
                label="ФИО" 
                name="fullName"
                :rules="[{ required: true, message: 'Пожалуйста, введите ФИО' }]"
            >
                <a-input v-model:value="formState.fullName" />
            </a-form-item>

            <!-- Логин -->
            <a-form-item 
                v-if="!isUpdateModal"
                label="Логин" 
                name="login"
                :rules="[{ required: true, message: 'Пожалуйста, введите логин' }]"
            >
                <a-input v-model:value="formState.login" />
            </a-form-item>

            <!-- Пароль -->
            <a-form-item 
                v-if="!isUpdateModal"
                label="Пароль" 
                name="password"
                :rules="[{ required: true, message: 'Пожалуйста, введите пароль' }]"
            >
                <a-input-password v-model:value="formState.password" />
                <div class="password-strength">
                    <div>
                        <check-circle-filled v-if="passwordStrength.minLength" style="color: #52c41a;" />
                        <close-circle-filled v-else style="color: #ff4d4f;" />
                        Минимум 8 символов
                    </div>
                    <div>
                        <check-circle-filled v-if="passwordStrength.hasNumber" style="color: #52c41a;" />
                        <close-circle-filled v-else style="color: #ff4d4f;" />
                        Содержит цифры
                    </div>
                    <div>
                        <check-circle-filled v-if="passwordStrength.hasUpperCase" style="color: #52c41a;" />
                        <close-circle-filled v-else style="color: #ff4d4f;" />
                        Содержит заглавные буквы
                    </div>
                    <div>
                        <check-circle-filled v-if="passwordStrength.hasSpecialChar" style="color: #52c41a;" />
                        <close-circle-filled v-else style="color: #ff4d4f;" />
                        Содержит спецсимволы
                    </div>
                </div>
            </a-form-item>

            <!-- Email -->
            <a-form-item 
                label="Email" 
                name="email"
                :rules="[
                    { type: 'email', message: 'Некорректный email' },
                    { required: true, message: 'Пожалуйста, введите email' }
                ]"
            >
                <a-input v-model:value="formState.email" type="email" />
            </a-form-item>

            <!-- Роль -->
            <a-form-item 
                label="Роль" 
                name="userRoleId"
                :rules="[{ required: true, message: 'Пожалуйста, выберите роль' }]"
            >
                <a-select 
                    v-model:value="formState.userRoleId" 
                    :options="usersRolesRecords" 
                />
            </a-form-item>

            <!-- Загрузка фото -->
            <a-form-item label="Фото">
                <a-upload
                    name="avatar"
                    list-type="picture-card"
                    class="avatar-uploader"
                    :show-upload-list="false"
                    :before-upload="beforeUpload"
                    accept="image/*"
                >
                    <img 
                        v-if="formState.photoPreview || formState.photoBlob"
                        :src="formState.photoPreview || formState.photoBlob"
                        alt="Avatar"
                        style="width: 100%; height: 100%; object-fit: cover;"
                    />
                    <div v-else>
                        <plus-outlined />
                        <div style="margin-top: 8px">Загрузить</div>
                    </div>
                </a-upload>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { computed, createVNode, reactive, ref } from 'vue';
import { App, Modal, type Form, type UploadProps } from 'ant-design-vue';
import { PlusOutlined, UserOutlined, CheckCircleFilled, CloseCircleFilled, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import type { Key } from 'ant-design-vue/es/table/interface';
import type { UserCDto, UserUDto } from '@/api/interfaces';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { UserRoleEnum, UserStatusEnum } from '@/utils/enum';
import { getMimeType } from '@/utils/helper';

interface SelectRecord {
    value: number;
    label: string;
}

interface TableData {
    key: number;
    userPhoto: string;
    userName: string;
    userRole: string;
    userStatus: string;
}

interface FormState {
    fullName: string;
    login: string;
    password: string;
    email: string;
    userId?: number;
    userStatusId?: number;
    userRoleId?: number;
    photoFile?: File;
    photoPreview?: string;
    photoBlob?: string;
}

const { notification } = App.useApp();
const userStore = useUserStore();
const authStore = useAuthStore();
const collapseItems = ref([]);
const selectedRoles = ref<number[]>([]);
const selectedStatuses = ref<number[]>([]);
const selectedTableRows = ref<Key[]>([]);
const modalOpen = ref<boolean>();
const isUpdateModal = ref<boolean>();
const formRef = ref<InstanceType<typeof Form>>();
const formState = reactive<FormState>({
    fullName: '',
    login: '',
    password: '',
    email: '',
    photoPreview: undefined
});

const usersRolesRecords = computed(() => userStore.roles.map((role) => ({ value: role.roleId, label: role.roleTitle } as SelectRecord)));
const usersStatusesRecords = computed(() => userStore.statuses.map((status) => ({ value: status.statusId, label: status.statusTitle } as SelectRecord)));

const tableColumns = computed(() => {
    const columns = [
        {
            title: 'Фото',
            dataIndex: 'userPhoto',
            key: 'userPhoto',
        },
        {
            title: 'Пользователь',
            dataIndex: 'userName',
            sorter: {
                compare: (a: TableData, b: TableData) => {
                    if (!a.userName && !b.userName) return 0;
                    if (!a.userName) return -1;
                    if (!b.userName) return 1;
                    return a.userName.localeCompare(b.userName);
                },
                multiple: 1,
            },
            key: 'userName',
        },
        {
            title: 'Роли',
            dataIndex: 'userRole',
            sorter: {
                compare: (a: TableData, b: TableData) => {
                    if (!a.userRole && !b.userRole) return 0;
                    if (!a.userRole) return -1;
                    if (!b.userRole) return 1;
                    return a.userRole.localeCompare(b.userRole);
                },
                multiple: 2,
            },
            key: 'userRole',
        },
        {
            title: 'Статус',
            dataIndex: 'userStatus',
            sorter: {
                compare: (a: TableData, b: TableData) => {
                    if (!a.userStatus && !b.userStatus) return 0;
                    if (!a.userStatus) return -1;
                    if (!b.userStatus) return 1;
                    return a.userStatus.localeCompare(b.userStatus);
                },
                multiple: 3,
            },
            key: 'userStatus',
        },
    ];

    if (authStore.currentUser?.userRoleId === UserRoleEnum.Admin) {
        columns.push({
            title: 'Действия',
            dataIndex: 'actions',
            key: 'actions',
        })
    }

    return columns;
});

const tableData = computed(() => {
    let users = [...userStore.users];

    users = users.filter((user) => user.userStatusId !== UserStatusEnum.Removed);
    if (selectedRoles.value.length) users = users.filter((user) => selectedRoles.value.includes(user.userRoleId));
    if (selectedStatuses.value.length) users = users.filter((user) => selectedStatuses.value.includes(user.userStatusId));

    return users.map((user) => {
        const userRole = userStore.roles.find((role) => role.roleId === user.userRoleId);
        const userStatus = userStore.statuses.find((status) => status.statusId === user.userStatusId);

        let photo = user.photo;
        if (photo && !photo.startsWith('data:image')) {
            const mimeType = getMimeType(photo);
            photo = `data:${mimeType};base64,${photo}`;
        }

        return {
            key: user.userId,
            userPhoto: photo || '',
            userName: user?.fullName || '',
            userRole: userRole?.roleTitle || '',
            userStatus: userStatus?.statusTitle || '',
        } as TableData;
    });
});

// Валидация пароля
const passwordStrength = computed(() => {
    const pass = formState.password;
    return {
        minLength: pass.length >= 8,
        hasNumber: /\d/.test(pass),
        hasUpperCase: /[A-Z]/.test(pass),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };
});

const validateCreateFields = computed(() => {
    const { minLength, hasNumber, hasUpperCase, hasSpecialChar } = passwordStrength.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
        !!formState.userRoleId
        && !!formState.fullName.trim()
        && !!formState.login.trim()
        && !!formState.password.trim() && minLength && hasNumber && hasUpperCase && hasSpecialChar
        && !!formState.email.trim() && emailPattern.test(formState.email)
    );
});

const validateUpdateFields = computed(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
        !!formState.userRoleId
        && !!formState.fullName.trim()
        && !!formState.email.trim() && emailPattern.test(formState.email)
    );
});

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
const handleAddUserButton = () => {
    resetModalFields();
    modalOpen.value = true;
};

// Заполение полей модального окна
const fillModalFields = (userId: number) => {
    const user = userStore.users.find((user) => user.userId === userId);

    if (!user) return;

    formState.fullName = user.fullName;
    formState.email = user.email;
    formState.userStatusId = user.userStatusId;
    formState.userRoleId = user.userRoleId;
    formState.userId = user.userId;

    let photo = user.photo;
    if (photo && !photo.startsWith('data:image')) {
        const mimeType = getMimeType(photo);
        photo = `data:${mimeType};base64,${photo}`;
    }

    formState.photoBlob = photo || undefined;
};

// Открытие модалки редактирования
const handleUpdateUserButton = (userId: number) => {
    resetModalFields();
    fillModalFields(userId);

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
    formState.fullName = '';
    formState.login = '';
    formState.password = '';
    formState.email = '';

    formState.photoPreview = undefined;
    formState.photoFile = undefined;
}

// Обработка создания пользователя
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

        const userData: UserCDto = {
            userRoleId: formState.userRoleId!,
            userStatusId: UserStatusEnum.Active!,
            fullName: formState.fullName,
            login: formState.login,
            password: formState.password,
            email: formState.email,
            photo: base64Photo || null
        };

        await userStore.createUser(userData);

        notification.success({
            message: 'Пользователь создан',
            description: 'Пользователь успешно создан.',
            placement: 'bottomRight',
        });
 
        modalOpen.value = false;
        resetModalFields();
    } catch (error) {
        notification.error({
            message: 'Ошибка создания',
            description: 'Произошла ошибка при попытке создать пользователя. Пожалуйста, попробуйте снова.',
            placement: 'bottomRight',
        });
    }
};

// Обработка обновления пользователя
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

        const userData: UserUDto = {
            userRoleId: formState.userRoleId!,
            userStatusId: formState.userStatusId!,
            fullName: formState.fullName,
            email: formState.email,
            photo: base64Photo || null
        };

        await userStore.updateUser(formState.userId!, userData);

        notification.success({
            message: 'Пользователь обновлён',
            description: 'Пользователь успешно обновлён.',
            placement: 'bottomRight',
        });
 
        modalOpen.value = false;
        resetModalFields();
    } catch (error) {
        notification.error({
            message: 'Ошибка обновления',
            description: 'Произошла ошибка при попытке обновить пользователя. Пожалуйста, попробуйте снова.',
            placement: 'bottomRight',
        });
    }
};

const handleBlockUserButton = (userId: number) => {
    Modal.confirm({
        title: 'Блокировка пользователя',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Вы уверены, что хотите заблокировать этого пользователя? После блокировки пользователь не сможет войти в систему.',
        onOk() {
            return userStore.updateUserStatus(userId, UserStatusEnum.Blocked).then(() => {
                notification.success({
                    message: 'Пользователь заблокирован',
                    description: 'Пользователь успешно заблокирован и больше не сможет войти в систему.',
                    placement: 'bottomRight',
                });
            }).catch(() => {
                notification.error({
                    message: 'Ошибка блокировки',
                    description: 'Произошла ошибка при попытке заблокировать пользователя. Пожалуйста, попробуйте снова.',
                    placement: 'bottomRight',
                });
            });
        },
        onCancel() {},
    });
};

const handleUnblockUserButton = (userId: number) => {
    Modal.confirm({
        title: 'Разблокировка пользователя',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Вы уверены, что хотите разблокировать этого пользователя? После разблокировки пользователь сможет снова войти в систему.',
        onOk() {
            return userStore.updateUserStatus(userId, UserStatusEnum.Active).then(() => {
                notification.success({
                    message: 'Пользователь разблокирован',
                    description: 'Пользователь успешно разблокирован и теперь может войти в систему.',
                    placement: 'bottomRight',
                });
            }).catch(() => {
                notification.error({
                    message: 'Ошибка разблокировки',
                    description: 'Произошла ошибка при попытке разблокировать пользователя. Пожалуйста, попробуйте снова.',
                    placement: 'bottomRight',
                });
            });
        },
        onCancel() {},
    });
};

const handleDeleteUserButton = (userId: number) => {
    Modal.confirm({
        title: 'Удаление пользователя',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Вы уверены, что хотите удалить этого пользователя? Это действие невозможно отменить, и учётная запись станет недоступной.',
        onOk() {
            return userStore.deleteUser(userId).then(() => {
                if (selectedTableRows.value.includes(userId)) {
                    const userIndex = selectedTableRows.value.findIndex((item) => item === userId);
                    selectedTableRows.value.splice(userIndex, 1);
                }

                notification.success({
                    message: 'Пользователь удалён',
                    description: 'Пользователь успешно удалён из системы.',
                    placement: 'bottomRight',
                });
            }).catch(() => {
                notification.error({
                    message: 'Ошибка удаления',
                    description: 'Произошла ошибка при попытке удалить пользователя. Пожалуйста, попробуйте снова.',
                    placement: 'bottomRight',
                });
            });
        },
        onCancel() {},
    });
};

const handleDeleteSelectedUsersButton = () => {
    Modal.confirm({
        title: 'Удаление пользователей',
        icon: createVNode(ExclamationCircleOutlined),
        content: 'Вы уверены, что хотите удалить этих пользователей? Это действие невозможно отменить, и учётные записи станут недоступны.',
        onOk() {
            return Promise.all(selectedTableRows.value.map((userId) => userStore.deleteUser(Number(userId)))).then(() => {
                selectedTableRows.value = [];

                notification.success({
                    message: 'Пользователи удалены',
                    description: 'Пользователи успешно удалены из системы.',
                    placement: 'bottomRight',
                });
            }).catch(() => {
                notification.error({
                    message: 'Ошибка удаления',
                    description: 'Произошла ошибка при попытке удалить пользователей. Пожалуйста, попробуйте снова.',
                    placement: 'bottomRight',
                });
            });
        },
        onCancel() {},
    });
};
</script>

<style scoped lang="less">
.password-strength {
    margin-top: 8px;

    & > div {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 4px 0;
    }
}
</style>