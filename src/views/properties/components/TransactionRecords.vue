<script lang="ts" setup>
import moment from 'moment'

const baseUrl = import.meta.env.VITE_SUBSCAN_BASE_URL
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

function addressFormat(address: string) {
    if (!address) {
        return '不存在'
    }
    return address.substring(0, 7) + '...' + address.substring(address.length - 5, address.length)
}
</script>

<template>
<el-table :data="list" class="txs" height="450" stripe style="width: 100%">
    <el-table-column label="Extrinsic Index" prop="extrinsic_index" width="150" />
    <el-table-column label="Block" prop="block_num" width="120" />
    <el-table-column label="Time" prop="block_timestamp" width="140">
        <template #default="scope">{{ moment.unix(scope.row.block_timestamp).fromNow() }}</template>
    </el-table-column>
    <el-table-column label="From">
        <template #default="scope">
            <a v-if="scope.row.from !== address"
               :href="`${baseUrl}/account/${scope.row.from}`"
               target="_blank">{{ addressFormat(scope.row.from) }}
            </a>
            <span v-else>{{ addressFormat(scope.row.from) }}</span>
        </template>
    </el-table-column>
    <el-table-column label="To">
        <template #default="scope">
            <a v-if="scope.row.to !== address" :href="`${baseUrl}/account/${scope.row.to}`" target="_blank">{{ addressFormat(scope.row.to) }}</a>
            <span v-else>{{ addressFormat(scope.row.to) }}</span>
        </template>
    </el-table-column>
    <el-table-column label="Status" width="100">
        <template #default="scope">
            <el-tag v-if="scope.row.success" type="success">Success</el-tag>
            <el-tag v-else type="danger">Failed</el-tag>
        </template>
    </el-table-column>
    <el-table-column label="Amount" width="120">
        <template #default="scope">{{ scope.row.amount }} {{ platform }}</template>
    </el-table-column>
    <el-table-column label="Hash">
        <template #default="scope">
            <a :href="`${baseUrl}/extrinsic/${scope.row.hash}`" target="_blank">{{ addressFormat(scope.row.hash) }}</a>
        </template>
    </el-table-column>
</el-table>
</template>

<style scoped>

</style>
