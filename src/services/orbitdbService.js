import { createOrbitDB, IPFSAccessController } from '@orbitdb/core'

export const openDatabase = async (orbitdb, name) => {
    return await orbitdb.open(name, {
        type: 'keyvalue',
        AccessController: IPFSAccessController({ write: ['*'] })  // Cho phép tất cả các người dùng ghi
    })
}

export const connectToDatabase = async (orbitdb, address) => {
    return await orbitdb.open(address, {
        AccessController: IPFSAccessController({ write: ['*'] })
    })
}