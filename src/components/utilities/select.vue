<template>
    <label v-if="label || subText" class="text-clip truncate">
        {{ label }}
        <Transition>
            <h6 v-if="subText" :style="`color: ${subTextColor};`" class="inline">{{ subText }}</h6>
        </Transition>
    </label>
    <div v-else v-bind="$attrs"
        class="w-full h-9 flex items-center bg-v rounded-v gap-[0.375rem] sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 py-2 border-pro smooth cursor-pointer"
        :class="{'border-red-500': invalid, 'bg-opacity-70 cursor-default': loading || readonly }">
        <icon-app v-if="icon" :icon="loading ? 'svg-spinners:ring-resize' : icon" class="w-7" :class="{ 'flip-if-rtl': fliped.includes(icon) }" />
        <select class="bg-transparent w-full placeholder:text-sm placeholder:tracking-normal truncate cursor-pointer" 
        @:change="readonly ? '' : emits('update', $event.target.value)" :value="value"
        >
            <option disabled value class="text-gray-800">{{ placeholder || 'Select an option' }}</option>
            <option v-for="(option, index) in list" :value="option.value == undefined ? index : option.value" class="text-gray-800">{{ option.text == undefined ? option : option.text }}</option>
        </select>
    </div>
</template>
  
<script setup>
    defineProps({
        value: String | Number | Boolean,
        icon: String,
        invalid: Boolean,
        loading: Boolean,
        readonly: Boolean,
        label: String,
        subText: String | Boolean,
        subTextColor: String,
        list: Array,
        placeholder: String,
    });

    const emits = defineEmits(["update"]);

    const fliped = ['fluent:call-24-filled', 'fluent:chevron-right-12-filled'];
</script>