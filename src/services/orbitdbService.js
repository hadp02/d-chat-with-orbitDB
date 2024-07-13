import { createOrbitDB, IPFSAccessController } from '@orbitdb/core'
import { parseMessage, createMessageData } from './messageService'

export const openDatabase = async (orbitdb, name) => {
    return await orbitdb.open(name, {
        type: 'keyvalue',
        AccessController: IPFSAccessController({ write: ['*'] })
    })
}

export const connectToDatabase = async (orbitdb, address) => {
    return await orbitdb.open(address, {
        AccessController: IPFSAccessController({ write: ['*'] })
    })
}

export const loadMessages = async (db) => {
    const allMessages = await db.all()
    return Object.entries(allMessages)
        .map(([key, value]) => parseMessage(key, value))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export const sendMessage = async (db, user, content) => {
    const messageData = createMessageData(user, content)
    await db.put(messageData.timestamp, JSON.stringify(messageData))
}