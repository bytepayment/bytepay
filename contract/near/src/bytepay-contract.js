import { call, near, NearBindgen, NearContract, UnorderedMap, view } from 'near-sdk-js'

@NearBindgen
export class BytePayContract extends NearContract {
    /**
     * @type {UnorderedMap}
     * @private
     */
    mapping = new UnorderedMap()

    constructor() {
        super()
        const signerAccountId = near.signerAccountId()
        const signerAccountPk = near.signerAccountPk()
        console.debug(signerAccountId, signerAccountPk)
    }

    serialize() {
        super.serialize()
        this.mapping = new UnorderedMap()
    }

    @call
    transaction(...args) {
        this.mapping.set(near.signerAccountId(), JSON.stringify(args))
    }

    @view
    getState() {
        return JSON.stringify(this.mapping, null, 4)
    }
}
