<template>
    <label v-if="label || subText" class="text-clip truncate">
        {{ label }}
        <Transition>
            <h6 v-if="subText" :style="`color: ${subTextColor};`" class="inline">{{ subText }}</h6>
        </Transition>
    </label>
    <div v-bind="$attrs"
        class="w-full h-9 border-pro flex items-center bg-v rounded-v gap-[0.375rem] sm:gap-2 md:gap-3 px-2 sm:px-3 md:px-4 py-2 smooth"
        :class="{'border-red-500': invalid, 'cursor-text': !loading && !readonly, 'bg-opacity-70 cursor-default': loading || readonly }">
        <icon-app v-if="icon" :icon="loading ? 'svg-spinners:ring-resize' : icon" class="w-7" :class="{ 'flip-if-rtl': fliped.includes(icon) }" />
        <input dir="auto" :autocomplete="'randomstring' || autocomplete" :name="name || label" class="w-full placeholder:text-sm placeholder:tracking-normal truncate" :readonly="readonly" @:input="emits('update', $event.target.value)"
            :value="value" :type="type" :min="min" :max="max" :maxlength="maxlength" :minlength="minlength" :placeholder="placeholder || 'enter text here'"
            :class="{ 'text-center placeholder:text-center': center, 'cursor-default': loading || readonly }" :required="required" :accessKey="accessKey" />
        <icon-app v-if="btnIcon || (icon && center)" @click="emits('btn')" :icon="btnIcon || center" :class="{ 'w-7': type != 'date', 'w-2': type == 'date', 'flip-if-rtl': fliped.includes(icon) }" />    
    </div>
</template>
  
<script setup>
defineProps({
    value: String | Number | Boolean,
    icon: String,
    type: String,
    invalid: Boolean,
    loading: Boolean,
    readonly: Boolean,
    placeholder: String,
    btnIcon: String,
    label: String,
    name: String,
    subText: String | Boolean,
    subTextColor: String,
    minlength: String,
    maxlength: String,
    min: String,
    max: String,
    accessKey: String,
    center: Boolean,
    required: Boolean,
    autocomplete: String | Boolean,
});

const emits = defineEmits(["update", "btn"]);

const fliped = ['fluent:call-24-filled', 'fluent:chevron-right-12-filled'];
</script>

<style>
.holder::placeholder {
    text-align: start;
}
</style>