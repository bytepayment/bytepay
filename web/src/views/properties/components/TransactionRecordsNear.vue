<script lang="ts" setup>
import moment from 'moment'

defineProps({
    list: {
        type: Array,
    },
    address: {
        type: String,
    },
    platform: {
        type: String,
    },
})
</script>

<template>
<el-table :data="list" class="txs" height="450" stripe style="width: 100%">
    <el-table-column label="Time" prop="block_timestamp" width="140">
        <template #default="{row}">{{ moment.unix(row.date / 1000).fromNow() }}</template>
    </el-table-column>
    <el-table-column label="From">
        <template #default="{row}">
            <!--suppress JSUnresolvedVariable -->
            <span>{{ row.fromAddress }}</span>
        </template>
    </el-table-column>
    <el-table-column label="To">
        <template #default="{row}">
            <!--suppress JSUnresolvedVariable -->
            <span>{{ row.toAddress }}</span>
        </template>
    </el-table-column>
    <el-table-column label="Amount" width="120">
        <template #default="{row}">{{ row.amount }} {{ row.unit }}</template>
    </el-table-column>
    <el-table-column label="Hash">
        <template #default="{row}">
            <a :href="`https://explorer.near.org/transactions/${row.hash}`" target="_blank">{{ row.hash }}</a>
        </template>
    </el-table-column>
</el-table>
</template>

<style scoped>

</style>
