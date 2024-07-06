<template>
    <div class="flex flex-col gap-4">
        <div class="text-pro">paramètres</div>
        <div class="h-full space-y-4 overflow-y-auto gap-4">
            <router-link v-if="$store.getters.permission('settings:users:access')" :to="`/school/${school.code}/settings/users`" class="flex-between bg-v py-2 px-4 rounded-v bg-v-hover smooth cursor-pointer">
                <div class="space-2">
                    <h3>utilisateurs</h3>
                    <h6 class="text-micro text-gray-600 dark:text-gray-400 mx-4 truncate">
                        ajouter, supprimer, nommer, règles gérer les utilisateurs de l'école
                    </h6>
                </div>
                <icon-app icon="ion:chevron-forward-outline" size="24" />
            </router-link>
        </div>
    </div>
</template>

<script setup>
const { school } = defineProps({
  school: Object
});
</script>