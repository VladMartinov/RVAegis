<template>
    <a-flex gap="15" vertical align="flex-end">
        <a-space>
            <a-select v-model:value="selectedCamera" :disabled="!cameras.length" placeholder="Выберите камеру" style="width: 200px">
                <a-select-option v-for="camera in cameras" :key="camera" :value="camera">
                    Камера {{ camera }}
                </a-select-option>
            </a-select>

            <a-button type="primary" @click="startStream">Запуск потока</a-button>
            <a-button type="primary" @click="endStream">Остановка потока</a-button>
        </a-space>

        <div style="position: relative; width: 100%; height: 100%;">
            <canvas 
                ref="frame" 
                :style="{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: '#000000', 
                    borderRadius: '6px' 
                }"
            ></canvas>
            <div 
                v-if="!(isStreamActive || (selectedCamera && selectedCamera >= 0))"
                style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                "
            >
                Подключение отсутствует
            </div>
        </div>
    </a-flex>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue';

interface WebSocketState {
    core: WebSocket | null;
    fpsUpdate: number | null;
}

const websocket = reactive<WebSocketState>({
    core: null,
    fpsUpdate: null
});

const fps = ref(0);
const fpsToView = ref(0);
const frame = ref<HTMLCanvasElement | null>(null);
const isStreamActive = ref(false);
const selectedCamera = ref<number | null>(null);
const cameras = ref<number[]>([]);

const startStream = () => {
    if (websocket.core) return;

    isStreamActive.value = true;
    websocket.core = new WebSocket("wss://localhost:7194/");
    websocket.fpsUpdate = window.setInterval(() => {
        fpsToView.value = fps.value;
        fps.value = 0;
    }, 1000);

    websocket.core.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!(data.cameraIndex || data.cameraIndex === 0) || !(data.images && data.images.length)) return;

        cameras.value = data.cameras;

        if (selectedCamera.value && !cameras.value.includes(selectedCamera.value)) selectedCamera.value = null;
        if (data.cameraIndex !== selectedCamera.value) return;

        fps.value++;
        displayImage(data.images[0]);
    };

    websocket.core.onerror = (error) => {
        console.error('WebSocket error:', error);
        endStream();
    };
};

const displayImage = (base64String: string) => {
    if (!frame.value) return;

    const ctx = frame.value.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.onload = () => {
        ctx.clearRect(0, 0, frame.value!.width, frame.value!.height);
        ctx.drawImage(image, 0, 0, frame.value!.width, frame.value!.height);
    };
    image.src = `data:image/jpeg;base64,${base64String}`;
};

const endStream = () => {
    if (!websocket.core) return;

    if (frame.value) {
        const ctx = frame.value.getContext('2d');
        ctx?.clearRect(0, 0, frame.value.width, frame.value.height);
    }

    websocket.core.close();
    websocket.core = null;
    isStreamActive.value = false;

    if (websocket.fpsUpdate) {
        clearInterval(websocket.fpsUpdate);
        websocket.fpsUpdate = null;
    }
};

onBeforeUnmount(() => {
    endStream();
});
</script>