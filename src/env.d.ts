/// <reference types="vite/client" />
import { RuleItem } from 'async-validator'

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

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
