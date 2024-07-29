<template>
    <div v-bind="$attrs" class="space-y-4">
        <div class="grid gap-2">
            <div class="flex justify-between items-start ">
                <div class="text-pro">tableau de bord</div>
                <div @click="school.link.type == 'owner' && dialog.open()"
                    class="w-fit flex-between gap-4 hover:underline cursor-pointer smooth">
                    <h6 v-if="school.license.end_at < (school.license.date_now + day * 10)" class="hidden sm:block">
                        {{ school.license.end_left }} jours avant la fin de l'abonnement
                    </h6>
                    <icon-app v-if="school.link.type == 'owner'" icon="ep:warning-filled" class="w-3" :class="{ 'text-red-500': 3 >= school.license.end_left }" size="16" />
                </div>
            </div>
            <h6 v-if="school.license.end_at < (school.license.date_now + day * 10)" @click="school.link.type == 'owner' && dialog.open()" class="sm:hidden text-center">
                {{ school.license.end_left }} jours avant la fin de l'abonnement
            </h6>
            <dialog-app :ref="dialog.item" title="information" @close="!creating ? dialog.close() : false" :canClose="!creating">
                <div class="text-center grid gap-2 pt-4 pb-6">
                    <div v-if="editSchool" class="space-y-2">
                        <input-app :value="name == null ? school.name : name" @update="name = $event" icon="solar:square-academic-cap-bold" placeholder="entrez ici le nom de votre école" />
                        <h4 class="uppercase tracking-wider">{{ school.code }}</h4>
                        <div class="space-y-2 pt-4">
                            <btn-app @click="update" text="enregistrer" icon="fluent:add-12-filled" class="mx-auto" dark :loading="creating" />
                            <h6 @click="editSchool = false" class="text-center mini-text cursor-pointer">annuler</h6>
                        </div>
                    </div>
                    <div v-else class="space-y-2">
                        <div class="flex justify-center gap-2 items-start mx-auto">
                            <icon-app icon="fluent:edit-12-filled" class="w-3 opacity-0" />
                            <h2 class="max-w-[80%] font-medium">{{ school.name }}</h2>
                            <icon-app @click="editSchool = true" icon="fluent:edit-12-filled" class="w-3 cursor-pointer" />
                        </div>                        
                        <h4 class="uppercase tracking-wider">{{ school.code }}</h4>
                    </div>
                </div>
                <div v-if="addPayment" class="space-y-2">
                    <div class="space-y-2">
                        <label for="email">durée en mois</label>
                        <div class="flex-between gap-4">
                            <div @click="++subscription.duration" class="btn-mini">
                                <icon-app icon="fluent:add-12-filled" class="w-3" />
                            </div>
                            <input-app :value="subscription.duration" readonly type="number" min="1" center />
                            <div @click="subscription.duration - 1 ? --subscription.duration : 0" class="btn-mini"
                                :class="{ 'opacity-50 hover:opacity-50 cursor-not-allowed': subscription.duration == 1 }">
                                <icon-app icon="ion:minus-round" class="w-3" />
                            </div>
                        </div>
                        <h6 class="mini-text pb-2">
                            l'abonnement expirera le 
                            {{ 
                              toDate((+school.license?.end_left > 0 ? school.license?.end_at : school.license?.date_now) 
                              + 
                              (day * 30 * subscription.duration)) 
                            }}
                        </h6>
                    </div>
                    <div class="w-full border-b-[1px] dark:border-gray-700 pb-1" />
                    <div class="flex-between pt-1">
                        <div>prix mensuel</div>
                        <div>{{ subscription.price }} DA</div>
                    </div>
                    <div class="w-full border-b-[1px] dark:border-gray-700 pb-1" />
                    <div class="flex-between pt-1">
                        <div>prix total</div>
                        <div>{{ subscription.price * subscription.duration }} DA</div>
                    </div>
                    <div class="space-y-2 pt-4">
                        <btn-app text="payer" @click="payment(school.code)" :loading="creating" icon="twemoji:credit-card" class="mx-auto" dark />
                        <h6 @click="() => { addPayment = false; creating = false; }" class="text-center mini-text cursor-pointer">annuler</h6>
                    </div>
                </div>
                <div v-else class="space-y-4">        
                    <div class="flex-between">
                        <label>abonnement</label>
                        <h6 class="mini-text">
                            expire le {{ toDate(school.license.end_at) }}
                        </h6>
                    </div>
                    <btn-app @click="addPayment = true" text="renouveau" icon="fluent:add-12-filled" class="mx-auto" />
                </div>
                <h6 class="text-center mini-text pt-2 space-y-2">école créée à <br> {{ toDate(school.created_at) }}</h6>
            </dialog-app>

        </div>
        <div class="grid gap-4 text-center mx-auto">
            <h2 class="tracking-[.0125rem] ml-[.0125rem]">{{ school.name }}</h2>
            <h5 @click="copy(school.code.toUpperCase())">
                <a class="tracking-[.125rem] ml-[.125rem] font-medium uppercase cursor-pointer">{{ school.code }}</a>
                <br>
                <h6 class="mini-text mt-2 cursor-pointer">appuyez ici pour copier le code de l'école</h6>
            </h5>
        </div>
        <hr>
        <div v-if="school.link?.rules">
            <input-app :value="query" @update="query = $event" icon="iconamoon:search-bold"
                class="w-full sm:w-6/12 md:w-4/12 lg:w-3/12 mx-auto mt-8 mb-12" type="search"
                placeholder="rechercher dans l'application" accessKey="s" />
            <div v-if="search.length" class="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-4">
                <router-link v-for="{ name, description, path, rule, icon } in search" :to="path"
                    :class="{ 'hidden': school.link.type != 'owner' && !school.link.rules[rule] }"
                    class="flex gap-2 bg-v p-4 rounded-v bg-v-hover smooth cursor-pointer">
                    <icon-app :icon="icon" size="24" />
                    <div class="grid gap-2">
                        <div class="font-medium first-letter:uppercase truncate">{{ name }}</div>
                        <h6 class="truncate">{{ description }}</h6>
                    </div>
                </router-link>
            </div>
            <h6 v-else class="h-full flex-center">{{ $t('no data to display') }}</h6>
        </div>
        <h6 v-else class="mt-16 text-center">{{ $t('loading...') }}</h6>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/plugins/axios.js';
import { toDate } from '@/utilities/date';
import store from '@/store';

const { school } = defineProps([ "school" ]);

const Routes = ref([
    {
        name: 'Nouvel Élève',
        icon: 'fluent:person-32-filled',
        path: `/school/${school.code}/students?new=true`,
        rule: 'students:create',
        description: 'ajouter un nouvel élève à l\'école'
    },
    {
        name: 'Liste des Élèves',
        icon: 'fluent:people-12-filled',
        path: `/school/${school.code}/students`,
        rule: 'students:access',
        description: 'liste des élèves de l\'école'
    },
    {
        name: 'Nouveau Cours',
        icon: 'solar:document-bold',
        path: `/school/${school.code}/courses?new=true`,
        rule: 'courses:create',
        description: 'ajouter un nouveau cours à l\'école'
    },
    {
        name: 'Liste des Cours',
        icon: 'solar:documents-bold',
        path: `/school/${school.code}/courses`,
        rule: 'courses:access',
        description: 'liste des cours de l\'école'
    },
    {
        name: 'Liste des profs',
        icon: 'fluent:person-accounts-20-filled',
        path: `/school/${school.code}/teachers`,
        rule: 'teachers:access',
        description: 'liste des profs de l\'école'
    },
    {
        name: 'Emploi du Temps',
        icon: 'fluent:calendar-ltr-24-filled',
        path: `/school/${school.code}/timetable`,
        rule: 'timetable:access',
        description: 'gérer l\'emploi du temps de l\'école'
    },
    {
        name: 'Finance',
        icon: 'fa6-solid:money-check-dollar',
        path: `/school/${school.code}/finance`,
        rule: 'finance:access',
        description: 'gérer les finances de l\'école'
    },
    {
        name: 'Statistiques',
        icon: 'majesticons:chart-pie',
        path: `/school/${school.code}/statistics`,
        rule: 'settings:statistics:access',
        description: 'gérer les statistiques de l\'école'
    },
    {
        name: 'Paramètres',
        icon: 'fluent:settings-48-filled',
        path: `/school/${school.code}/settings`,
        rule: 'settings:access',
        description: 'gérer les paramètres de l\'école'
    },
    {
        name: 'Utilisateurs',
        icon: 'fluent:people-12-filled',
        path: `/school/${school.code}/settings/users`,
        rule: 'settings:users:access',
        description: 'gérer les utilisateurs de l\'école'
    },
    // {
    //     name: 'nouvel utilisateur',
    //     icon: 'fluent:person-32-filled',
    //     path: `/school/${school.code}/settings/users/new`,
    //     rule: 'settings:users:link',
    //     description: 'ajouter un nouvel utilisateur à l\'école'
    // }
]);

const query = ref("");
const name = ref(null);
const creating = ref();
const editSchool = ref();
const addPayment = ref();
const day = 1000 * 60 * 60 * 24;

const dialog = {
    item: ref(null),
    open: () => dialog.item.value.open(),
    close: () => dialog.item.value.close()
};

const subscription = ref({
    price: 2500,
    duration: 1, // month
});

const search = computed(() => Routes.value.filter(item =>
    item.name.toLowerCase().includes(query.value.toLowerCase()) ||
    item.description.toLowerCase().includes(query.value.toLowerCase())
));

const copy = text => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

const update = async () => {
    if (name.value && window.confirm("Voulez-vous changer le nom de l'école ?")) {
        try {
            creating.value = true;
            addPayment.value = false;
            const result = await api.post("/v1/schools/update", { school: school.code, name: name.value });
            // console.log(result);
            const newSchools = store.state.schools.map(item => 
                item.code == school.code ? { ...item, name: name.value } : item
            );
            store.commit("set", { key: "school", value: { ...school, name: name.value } });
            store.commit("set", { key: "schools", value: newSchools });
            creating.value = false;
            editSchool.value = false;
        } catch (error) {
            console.log(error);
        }
    }
};

const payment = async code => {
    try {
        creating.value = true;
        editSchool.value = false;
        const result = await api.post("/v1/subscriptions/create", { school: code, subscription: subscription.value });
        //console.log(result);
        const popup = window.open(result.data.checkout_url, 'popup', 'width=400,height=600');
        if (!popup) {
            window.location.href = result.data.checkout_url;
        } else {
            const checkPopupClosed = setInterval(async () => {
                if (popup.closed) {
                    clearInterval(checkPopupClosed);
                    if (result.data.id) {
                        const response = await api.get("/v1/subscriptions/check/" + result.data.id);
                        // console.log(response);
                        const newLicense = {
                            end_at: Date.now() + (day * school.license.end_left) + (day * 30 * subscription.value.duration),
                            date_now: Date.now()
                        }
                        // console.log({
                        //     ...newLicense,
                        //     end_left: +(((newLicense.end_at - Date.now()) / day).toFixed())
                        // });
                        store.commit("set", { key: "school", value: 
                        {
                            ...school,
                            license_end: new Date(newLicense.end_at).toISOString(),
                            license: {
                                ...newLicense,
                                end_left: +(((newLicense.end_at - Date.now()) / day).toFixed())
                            }
                        }});
                        response.data.data.status == 'paid' && alert('Le paiement a été effectué avec succès');
                        creating.value = false;
                        addPayment.value = false;
                        // console.log(school);
                    } else {
                        creating.value = false;
                    }
                }
            }, 500);
        }
    } catch (error) {
        console.log(error);
    }
};
</script>
