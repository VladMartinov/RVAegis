<template>
    <a-flex gap="15" vertical align="flex-end">
        <a-space>
            <a-button type="primary" @click="startStream">Запуск потока</a-button>
            <a-button type="primary" @click="endStream">Остановка потока</a-button>
        </a-space>

        <canvas ref="frame" :style="{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#000000', 
            borderRadius: '6px' 
        }"></canvas>
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

const startStream = () => {
    if (websocket.core) return;

    websocket.core = new WebSocket("wss://localhost:7194/");
    websocket.fpsUpdate = window.setInterval(() => {
        fpsToView.value = fps.value;
        fps.value = 0;
    }, 1000);

    websocket.core.onmessage = (event) => {
        if (event.data instanceof Blob && frame.value) {
            fps.value++;

            const blob = event.data;
            const image = new Image();
            const ctx = frame.value.getContext('2d');

            if (!ctx) return;

            const reader = new FileReader();
            reader.onload = () => {
                image.onload = () => {
                    ctx.clearRect(0, 0, frame.value!.width, frame.value!.height);
                    ctx.drawImage(image, 0, 0, frame.value!.width, frame.value!.height);
                };
                image.src = reader.result as string;
            };
            reader.readAsDataURL(blob);
        }
    };

    websocket.core.onerror = (error) => {
        console.error('WebSocket error:', error);
        endStream();
    };
};

const endStream = () => {
    if (!websocket.core) return;

    if (frame.value) {
        const ctx = frame.value.getContext('2d');
        ctx?.clearRect(0, 0, frame.value.width, frame.value.height);
    }

    websocket.core.close();
    websocket.core = null;

    if (websocket.fpsUpdate) {
        clearInterval(websocket.fpsUpdate);
        websocket.fpsUpdate = null;
    }
};

onBeforeUnmount(() => {
    endStream();
});
</script>