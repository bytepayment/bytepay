// noinspection JSUnusedGlobalSymbols

declare module '@/cloud-sdk' {
    import { Cloud } from 'laf-client-sdk'
    type cloud = Cloud & {shared: Map<string, any>}
    export default new Cloud() as cloud;
}


declare global {
    type FunctionContext = {
        body: Record<string, any>,
        auth: Record<string, any>,
        method: string,
        query: Record<string, any>
    }
}
