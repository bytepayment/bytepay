<script lang="ts" setup>
import { Blockchain } from '@/api/Api'
import BindAddress from '@/views/settings/components/BindAddress.vue'</script>

<template>
<BindAddress :chain="Blockchain.NEAR">
    <template #title>
        Near Account
    </template>
    <template #body>
        <span>
            <strong>Notice: Just For Developer</strong>
        </span>
        <p>When you authorized your github account to Crypto Pay Lab, we will generate an Acala Account by default, you can withdraw the dot you eraned anytime.</p>
        <p>Also We support bind your own account here, after you finished task, author will pay into your own account directly.</p>
    </template>
</BindAddress>
</template>
