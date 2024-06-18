<template>
  <div v-bind="$attrs" class="space-y-4">
    <h4 class="font-bold">informations</h4>
    <div class="space-y-4 w-fit">
      <input-app label="school name" :value="school.name" readonly />
    </div>
    <div>license will end at : {{ toDate(school.license_end) }}</div>
    <btn-app text="pay" @click="dialog.open()" :loading="creating" icon="twemoji:credit-card" dark />
    <dialog-app :ref="dialog.item" title="subscription" @close="dialog.close()" :canClose="!creating">
      <div class="text-center grid gap-2 pt-4 pb-6">
        <h2 class="font-medium">{{ school.name }}</h2>
        <h4 class="uppercase tracking-wider">{{ school.code }}</h4>
      </div>
      <div class="space-y-2">
        <label for="email">duration in months</label>
        <div class="flex-between gap-4">
          <div @click="++subscription.duration" class="btn-mini">
            <icon-app icon="fluent:add-12-filled" class="w-3" />
          </div>
          <input-app :value="subscription.duration" readonly type="number" min="1" center />
          <div @click="subscription.duration - 1 ? --subscription.duration : 0" class="btn-mini" :class="{ 'opacity-50 hover:opacity-50 cursor-not-allowed': subscription.duration == 1 }">
            <icon-app icon="ion:minus-round" class="w-3" />
          </div>
        </div>
        <h6 class="mini-text">subscription will expire in {{ toDate((+license_end_left > 0 ? license_end : date_now) +
    (1000 * 60 * 60 * 24 * 30 * subscription.duration)) }}</h6>
      </div>
      <div class="w-full border-b-[1px] dark:border-gray-700 pb-1" />
      <div class="flex-between pt-1">
        <div>unit price</div>
        <div>{{ subscription.price }} DA</div>
      </div>
      <div class="w-full border-b-[1px] dark:border-gray-700 pb-1" />
      <div class="flex-between pt-1">
        <div>total price</div>
        <div>{{ subscription.price * subscription.duration }} DA</div>
      </div>
      <div class="flex-center pt-4">
        <btn-app text="pay" click="create(student)" :loading="creating" icon="twemoji:credit-card" dark />
      </div>
    </dialog-app>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toDate } from '@/utilities/date';
const { school } = defineProps(["school"]);

const creating = ref(false);

const license_end = computed(() => toDate(school.license_end, 'milliseconds'));
const date_now = computed(() => toDate('now', 'milliseconds'));
const license_end_left = computed(() => ((license_end.value - date_now.value) / (1000 * 60 * 60 * 24)).toFixed());

const dialog = {
  item: ref(null),
  open: () => dialog.item.value.open(),
  close: () => dialog.item.value.close()
};

const subscription = ref({
  price: 2500,
  duration: 1,
});

onMounted(() => {
  if (useRoute().query.subscription == 'true') {
    dialog.open();
  }
}); 
</script>