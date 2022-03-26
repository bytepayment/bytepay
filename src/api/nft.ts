import { NFTClass } from '@/entity'
import { getToken, getUser } from '@/utils/auth'
import { cloud } from "./cloud"

// ========================================================================================
// ======================================== Chain =========================================
// ========================================================================================

/**
 * 
 */
export async function nft_buy() {
    return await cloud.invokeFunction("nft_buy", {})
}

/**
 * 
 */
export async function nft_create_class() {
    return await cloud.invokeFunction("nft_create_class", {})
}

/**
 * 
 */
export async function nft_get_bytechain_accountinfo(address: string) {

    return await cloud.invokeFunction("nft_get_bytechain_accountinfo", { address })
}

/**
 * 
 */
export async function nft_get_bytechain_keyring() {
    const user = getUser()
    return await cloud.invokeFunction("nft_get_bytechain_keyring", {
        id: user.id
    })
}

/**
 * 
 */
export async function nft_get_classes() {
    return await cloud.invokeFunction("nft_get_classes", {})
}

/**
 * 
 */
export async function nft_get_detail() {
    return await cloud.invokeFunction("nft_get_detail", {})
}

/**
 * 
 */
export async function nft_get_list() {
    return await cloud.invokeFunction("nft_get_list", {})
}

/**
 * 
 */
export async function nft_mint() {
    return await cloud.invokeFunction("nft_mint", {})
}

/**
 * 
 */
export async function nft_upload() {
    return await cloud.invokeFunction("nft_upload", {})
}
