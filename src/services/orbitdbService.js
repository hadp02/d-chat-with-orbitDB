import { createOrbitDB, IPFSAccessController } from '@orbitdb/core'
import messageService from './messageService'

class OrbitDBService {
    constructor() {
        this.orbitdb = null;
    }

    async loadMessagesBeforeTimestamp(db, timestamp) {
        const allMessages = await db.all();
        return Object.entries(allMessages)
            .map(([key, value]) => messageService.parseMessage(key, value))
            .filter(message => message.timestamp < timestamp)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);  // Load 20 messages at a time, adjust as needed
    }

    async openDatabase(name) {
        if (!this.orbitdb) {
            throw new Error('OrbitDB not initialized');
        }
        return await this.orbitdb.open(name, {
            type: 'keyvalue',
            AccessController: IPFSAccessController({ write: ['*'] })
        });
    }

    async parseMessage(entry) {
        const { payload } = entry
        if (payload.op === 'PUT') {
            return messageService.parseMessage(payload.key, payload.value)
        }
        return null
    }

    async connectToDatabase(address) {
        if (!this.orbitdb) {
            throw new Error('OrbitDB not initialized');
        }
        return await this.orbitdb.open(address, {
            AccessController: IPFSAccessController({ write: ['*'] })
        });
    }

    async loadMessages(db) {
        const allMessages = await db.all();
        return Object.entries(allMessages)
            .map(([key, value]) => messageService.parseMessage(key, value))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    async sendMessage(db, user, content) {
        const messageData = messageService.createMessageData(user, content);
        await db.put(messageData.timestamp, JSON.stringify(messageData));
    }

    setOrbitDB(orbitdb) {
        this.orbitdb = orbitdb;
    }
}

export default new OrbitDBService();