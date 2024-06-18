<template>
    <div class="md:flex md:flex-col space-y-4 bg-cover bg-[url(https://cdn.dribbble.com/userupload/11942631/file/original-aedf154e37b85a763d981b7e19a8e6a8.jpg)]">
        <!-- <div class="flex flex-col space-y-6 min-h-[96px]">
            <div class="flex-between">
                <div class="text-pro">statistics</div>
                <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
            </div>
        </div> -->
        <!-- <h5 class="md:h-full flex-center">
            no data to display
        </h5> -->
        <!-- <img src="https://cdn.dribbble.com/userupload/11942631/file/original-aedf154e37b85a763d981b7e19a8e6a8.jpg" class="h-full w-full" alt="" srcset=""> -->
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(false);
</script>