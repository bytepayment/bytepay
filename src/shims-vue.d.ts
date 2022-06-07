import { RuleItem } from 'async-validator'

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_GITHUB_OAUTH_CLIENT_ID: string
    readonly VITE_SUBSCAN_BASE_URL: string
    readonly VITE_APP_ID: string
    readonly VITE_BUCKET_URL: string
    // more environment var...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

/**
 * 表单验证规则
 */
type FormValidationRules<T> = Partial<Record<keyof T, Array<RuleItem>>>
