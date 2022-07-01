
interface SharedFun {
    hash(content: string): string

    aesEncrypt(text: string): string

    aesDecrypt(text: string): string
}
