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
            console.error('OrbitDB not initialized');
            throw new Error('OrbitDB not initialized');
        }
        console.log('Opening database:', name);
        const db = await this.orbitdb.open(name, {
            type: 'keyvalue',
            AccessController: IPFSAccessController({ write: ['*'] })
        });
        console.log('Database opened:', db ? 'Success' : 'Failed');
        return db;
    }

    async parseMessage(entry) {
        const { payload } = entry
        if (payload.op === 'PUT') {
            return messageService.parseMessage(payload.key, payload.value)
        }
        return null
    }

    async subscribeToTopic(topic, callback) {
        if (!this.orbitdb || !this.orbitdb.libp2p || !this.orbitdb.libp2p.pubsub) {
            console.error('OrbitDB, libp2p, or pubsub not initialized');
            return;
        }
        this.orbitdb.libp2p.pubsub.subscribe(topic)
        this.orbitdb.libp2p.pubsub.addEventListener('message', (evt) => {
            if (evt.detail.topic === topic) {
                callback(evt.detail.data)
            }
        })
    }

    async publishToTopic(topic, message) {
        if (!this.orbitdb || !this.orbitdb.libp2p || !this.orbitdb.libp2p.pubsub) {
            console.error('OrbitDB, libp2p, or pubsub not initialized');
            return;
        }
        await this.orbitdb.libp2p.pubsub.publish(topic, message)
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
        console.log("OrbitDB set in OrbitDBService:", !!this.orbitdb);
        if (this.orbitdb && this.orbitdb.ipfs && this.orbitdb.ipfs.libp2p) {
            console.log("libp2p available in OrbitDBService");
            this.libp2p = this.orbitdb.ipfs.libp2p;

            // Add event listeners for peer discovery and connection
            this.libp2p.addEventListener('peer:discovery', (evt) => {
                console.log('Discovered peer:', evt.detail.id.toString());
            });

            this.libp2p.addEventListener('peer:connect', (evt) => {
                const remotePeer = evt.detail.remotePeer;
                console.log('Connected to peer:', remotePeer.toString());
                console.log('Peer details:', {
                    id: remotePeer.id.toString(),
                    protocols: remotePeer.protocols,
                    addresses: remotePeer.addresses.map(addr => addr.toString())
                });
            });
        } else {
            console.error("libp2p not available in OrbitDBService");
        }
    }
}

export default new OrbitDBService();