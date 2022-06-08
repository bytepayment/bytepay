import Router from '@/router/index'
import { computed, ref, Ref } from 'vue'
import { useRoute } from 'vue-router'
import BytepayOverview from './overview/bytepay-overview.md'
import BytepayOverview_zh from './overview/bytepay-overview_zh.md'
import BytepayContract from './workflow/bytepay-ink!-contract.md'
import BytepayContract_zh from './workflow/bytepay-ink!-contract_zh.md'
import BytepayUserGuide from './workflow/user-guide.md'
import BytepayUserGuide_zh from './workflow/user-guide_zh.md'
import InteractWithIssue from './workflow/interact-with-issue.md'
import InteractWithIssue_zh from './workflow/interact-with-issue_zh.md'

const fileMapping = {
    BytepayOverview,
    BytepayUserGuide,
    BytepayContract,
    BytepayOverview_zh,
    BytepayContract_zh,
    BytepayUserGuide_zh,
    InteractWithIssue,
    InteractWithIssue_zh,
}

type FileKey = keyof typeof fileMapping

type DocItem = {
    id: string,
    title: string,
    page?: FileKey,
    children?: Array<DocItem>
}

/**
 * 页面数据定义
 */
export const pageConfig: Array<DocItem> = [
    {
        id: '00',
        title: 'Overview',
        children: [
            {id: '01', title: 'Overview', page: 'BytepayOverview'},
            {id: '02', title: 'Interact with Issue', page: 'InteractWithIssue'},
        ],
    },
    {
        id: '10',
        title: 'Work Flow',
        children: [
            {id: '11', title: 'User Guide', page: 'BytepayUserGuide'},
            {id: '12', title: 'Ink! Contract', page: 'BytepayContract'},
        ],
    },
]

export const AllDocItemId = treeCollect(pageConfig)

/**
 * 页面逻辑
 */
export class DocPage {
    private activeMdName: Ref<FileKey> = ref('BytepayOverview')

    public language: Ref<string> = ref('')

    public component = computed(() => {
        let key = this.activeMdName.value + this.language.value
        const has = Object.keys(fileMapping).includes(key)
        return has ? fileMapping[key as FileKey] : fileMapping[this.activeMdName.value]
    })

    constructor() {
        this.activeMdName.value = useRoute().params.name as FileKey ?? 'BytepayOverview'
    }

    public setActiveName(name: FileKey) {
        this.activeMdName.value = name
        // noinspection JSIgnoredPromiseFromCall
        Router.push({name: 'docs', params: {name}})
    }

}

function treeCollect(list: Array<DocItem>): Array<string> {
    if (list.length <= 0) {
        return []
    }

    return list.reduce((pv, cv) => {
        pv.push(cv.id)
        if (cv.children && cv.children.length > 0) {
            pv.push(...treeCollect(cv.children))
        }

        return pv
    }, [] as Array<string>)
}
