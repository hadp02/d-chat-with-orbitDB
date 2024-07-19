import { createHelia } from 'helia'
import { identify } from '@libp2p/identify'
import { LevelBlockstore } from "blockstore-level"
import { bitswap } from "@helia/block-brokers"
import { all } from "@libp2p/websockets/filters"
import { createOrbitDB } from "@orbitdb/core"
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import * as filters from "@libp2p/websockets/filters";
import {bootstrap} from "@libp2p/bootstrap";
import {multiaddr} from "@multiformats/multiaddr";
import {dcutr} from "@libp2p/dcutr";

class IPFSService {
    constructor() {
        this.orbitdb = null;
    }

    serializableObject(obj, depth = 0) {
        if (depth > 2) return '[Object]'; // Limit recursion depth
        const seen = new WeakSet();
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) return '[Circular]';
                seen.add(value);
                if (depth > 0) {
                    const newObj = {};
                    for (const k in value) {
                        newObj[k] = this.serializableObject(value[k], depth + 1);
                    }
                    return newObj;
                }
            }
            if (typeof value === 'bigint') return value.toString();
            if (typeof value === 'function') return '[Function]';
            return value;
        }));
    }

    async initOrbitDB({ id, identity, identities, directory } = {}) {
        try {
            const options = this.DefaultLibp2pBrowserOptions;
            console.log("Creating libp2p node with options:", JSON.stringify(options, (key, value) =>
                    typeof value === 'function' ? '[Function]' : value
                , 2));
            const libp2p = await createLibp2p(options);
            console.log("Libp2p node created successfully");

            await libp2p.start();
            console.log("Libp2p node started");

            console.log("Libp2p structure:", Object.keys(libp2p));
            console.log("Libp2p components:", Object.keys(libp2p.components || {}));

            // Kiểm tra và log connectionManager
            const connectionManager = libp2p.connectionManager || libp2p.components?.connectionManager;
            if (connectionManager) {
                console.log("ConnectionManager methods:", Object.keys(connectionManager));
                console.log("ConnectionManager connections:", await connectionManager.getConnections());
            } else {
                console.log("ConnectionManager not found");
            }
            libp2p.addEventListener('peer:discovery', (evt) => {
                console.log('Discovered peer:', evt.detail.id ? evt.detail.id.toString() : 'Unknown ID')
            })

            // Create Helia instance
            const blockstore = new LevelBlockstore(`${directory}/ipfs/blocks`);
            console.log("Creating Helia instance...");
            const ipfs = await createHelia({ libp2p, blockstore, blockBrokers: [bitswap()] });
            console.log("Helia instance created successfully");
            console.log("Pubsub available in libp2p:", !!ipfs.libp2p.pubsub);
            console.log("Creating OrbitDB instance...");
            this.orbitdb = await createOrbitDB({ ipfs, id, identity, identities, directory });
            console.log("OrbitDB instance created successfully");
            this.setupEventListeners();
            this.listenForMessages();
            console.log("Pubsub available in libp2p:", !!this.orbitdb.ipfs.libp2p.services.pubsub);
            console.log("OrbitDB structure:", Object.keys(this.orbitdb));
            // Thêm libp2p vào OrbitDB instance nếu cần
            if (!this.orbitdb.libp2p && this.orbitdb.ipfs && this.orbitdb.ipfs.libp2p) {
                this.orbitdb.libp2p = this.orbitdb.ipfs.libp2p;
                console.log("libp2p added to OrbitDB instance");
            }
            if (this.orbitdb.libp2p) {
                console.log("libp2p initialized in OrbitDB");
            } else {
                console.error("libp2p not initialized in OrbitDB");
                console.log("ipfs structure:", Object.keys(this.orbitdb.ipfs));
                console.log("ipfs.libp2p available:", !!this.orbitdb.ipfs.libp2p);
            }
            // Thử kết nối đến relay server nếu libp2p được khởi tạo
            if (this.orbitdb.libp2p) {
                await this.connectToRelay();
            }
            return this.orbitdb;
        } catch (error) {
            console.error("Error in initOrbitDB:", error);
            console.error("Error stack:", error.stack);
            throw error;
        }
    }

    async stopOrbitDB() {
        if (this.orbitdb) {
            await this.orbitdb.stop();
            await this.orbitdb.ipfs.stop();
            await this.orbitdb.ipfs.blockstore.unwrap().unwrap().child.db.close();
            this.orbitdb = null;
        }
    }

    isInitialized() {
        return !!(this.orbitdb && this.orbitdb.ipfs && this.orbitdb.ipfs.libp2p);
    }

    setupEventListeners() {
        if (this.orbitdb && this.orbitdb.ipfs && this.orbitdb.ipfs.libp2p) {
            this.orbitdb.ipfs.libp2p.addEventListener('peer:connect', (evt) => {
                const remotePeer = evt.detail.remotePeer;
                if (remotePeer) {
                    console.log('Connected to peer:', remotePeer.toString());
                    console.log('Total connections:', this.orbitdb.ipfs.libp2p.connectionManager.connections.size);
                } else {
                    console.log('Connected to unknown peer');
                }
            });

            this.orbitdb.ipfs.libp2p.addEventListener('peer:disconnect', (evt) => {
                const remotePeer = evt.detail.remotePeer;
                if (remotePeer) {
                    console.log('Disconnected from peer:', remotePeer.toString());
                    console.log('Total connections:', this.orbitdb.ipfs.libp2p.connectionManager.connections.size);
                } else {
                    console.log('Disconnected from unknown peer');
                }
            });
            console.log('Event listeners set up successfully');
        } else {
            console.error('OrbitDB, IPFS, or libp2p not initialized');
        }
    }

    async connectToRelay() {
        if (!this.isInitialized()) {
            console.error('OrbitDB, IPFS, or libp2p not initialized');
            return;
        }
        const relayAddress =  '/ip4/172.29.113.190/tcp/57591/ws/p2p/12D3KooWK6817XAJhEMTYu3RQfHWGZV8TFF2rmTszekx3wFvmnmy'
        try {
            console.log(`Dialing relay server at ${relayAddress}`)
            const ma = multiaddr(relayAddress)
            await this.orbitdb.ipfs.libp2p.dial(ma)
            console.log('Connected to relay server')

            // Đăng ký với relay server
            await this.orbitdb.ipfs.libp2p.services.dcutr.start()
            console.log('Registered with relay server')
        } catch (error) {
            console.error('Failed to connect to relay server:', error)
            console.error('Error details:', error.message)
            if (error.stack) {
                console.error('Error stack:', error.stack)
            }
        }
    }

    async subscribeToTopic(topic, callback) {
        if (!this.orbitdb || !this.orbitdb.ipfs || !this.orbitdb.ipfs.libp2p || !this.orbitdb.ipfs.libp2p.services.pubsub) {
            console.error('OrbitDB, IPFS, libp2p or pubsub not initialized');
            return;
        }
        await this.orbitdb.ipfs.libp2p.services.pubsub.subscribe(topic);
        console.log(`Subscribed to topic: ${topic}`);
        this.orbitdb.ipfs.libp2p.services.pubsub.addEventListener('message', (evt) => {
            if (evt.detail.topic === topic) {
                console.log(`Received message on topic ${topic}:`, new TextDecoder().decode(evt.detail.data));
                callback(evt.detail.data);
            }
        });
    }

    async publishToTopic(topic, message) {
        if (!this.orbitdb || !this.orbitdb.ipfs || !this.orbitdb.ipfs.libp2p || !this.orbitdb.ipfs.libp2p.services.pubsub) {
            console.error('OrbitDB, IPFS, libp2p or pubsub not initialized');
            return;
        }
        await this.orbitdb.ipfs.libp2p.services.pubsub.publish(topic, new TextEncoder().encode(message));
        console.log(`Published message to topic ${topic}:`, message);
    }

    async updatePeerList() {
        if (!this.orbitdb || !this.orbitdb.ipfs || !this.orbitdb.ipfs.libp2p) {
            console.error('OrbitDB, IPFS or libp2p not initialized');
            return [];
        }
        const peers = await this.orbitdb.ipfs.libp2p.peerStore.all();
        return peers.map(peer => peer.id.toString());
    }

    async dialPeer(multiaddrString) {
        if (!this.isInitialized()) {
            console.error('OrbitDB, IPFS, or libp2p not initialized');
            return null;
        }
        try {
            console.log(`Dialing '${multiaddrString}'`);
            const ma = multiaddr(multiaddrString);
            const components = ma.toString().split('/');
            const peerIdIndex = components.lastIndexOf('p2p') + 1;
            if (peerIdIndex < components.length) {
                const peerId = components[peerIdIndex];
                await this.orbitdb.ipfs.libp2p.dial(peerId);
                console.log(`Connected to '${peerId}'`);
            } else {
                throw new Error('Invalid multiaddr: no peer ID found');
            }
        } catch (error) {
            console.error('Error dialing peer:', error);
            throw error;
        }
    }

    listenForMessages() {
        if (!this.orbitdb || !this.orbitdb.ipfs || !this.orbitdb.ipfs.libp2p) {
            console.error('OrbitDB, IPFS or libp2p not initialized');
            return;
        }
        this.orbitdb.ipfs.libp2p.services.pubsub.addEventListener('message', event => {
            const topic = event.detail.topic;
            const message = new TextDecoder().decode(event.detail.data);
            console.log(`Message received on topic '${topic}':`, message);
        });
    }

    getOwnMultiaddr() {
        if (!this.isInitialized()) {
            console.error('OrbitDB, IPFS, or libp2p not initialized');
            return null;
        }

        const peerId = this.orbitdb.ipfs.libp2p.peerId.toString();
        const addresses = this.orbitdb.ipfs.libp2p.getMultiaddrs();

        // Ưu tiên địa chỉ WebRTC nếu có
        const webrtcAddr = addresses.find(addr => addr.toString().includes('/webrtc/'));
        if (webrtcAddr) {
            return `${webrtcAddr}/p2p/${peerId}`;
        }

        // Nếu không có WebRTC, sử dụng địa chỉ đầu tiên
        if (addresses.length > 0) {
            return `${addresses[0]}/p2p/${peerId}`;
        }

        return null;
    }

    async getConnectedPeers() {
        if (!this.isInitialized()) {
            console.error('OrbitDB, IPFS, or libp2p not initialized');
            return [];
        }
        const peers = await this.orbitdb.ipfs.libp2p.peerStore.all();
        return peers.map(peer => peer.id.toString());
    }

    async listConnectedPeers() {
        if (!this.orbitdb || !this.orbitdb.libp2p) {
            console.error('OrbitDB or libp2p not initialized');
            return;
        }
        const peers = await this.orbitdb.libp2p.peerStore.all();
        console.log('Connected peers:');
        for (const peer of peers) {
            console.log(` - ${peer.id.toString()}`);
            for (const addr of peer.addresses) {
                console.log(`   ${addr.toString()}`);
            }
        }
    }

    checkOrbitDBStatus() {
        console.log('OrbitDB status:');
        console.log('OrbitDB initialized:', !!this.orbitdb);
        if (this.orbitdb) {
            console.log('IPFS in OrbitDB:', !!this.orbitdb.ipfs);
            if (this.orbitdb.ipfs) {
                console.log('libp2p in IPFS:', !!this.orbitdb.ipfs.libp2p);
                if (this.orbitdb.ipfs.libp2p) {
                    console.log('pubsub in libp2p:', !!this.orbitdb.ipfs.libp2p.pubsub);
                }
            }
        }
    }

    isBrowser() {
        return typeof window !== 'undefined';
    }

    get DefaultLibp2pOptions() {
        return {
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/0/ws']
            },
            transports: [
                webSockets({
                    filter: all
                }),
                webRTC(),
                webRTCDirect(),
                circuitRelayTransport({
                    discoverRelays: 1
                })
            ],
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            connectionGater: {
                denyDialMultiaddr: () => false
            },
            services: {
                identify: identify(),
                pubsub: gossipsub({ allowPublishToZeroTopicPeers: true })
            }
        };
    }

    get DefaultLibp2pBrowserOptions() {
        return {
            addresses: {
                listen: [
                    '/webrtc'
                ]
            },
            transports: [
                webSockets({
                    filter: filters.all
                }),
                webRTC(),
                webRTCDirect(),
                circuitRelayTransport({
                    discoverRelays: 1
                })
            ],
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            connectionGater: {
                denyDialMultiaddr: () => false
            },
            services: {
                identify: identify(),
                pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
                dcutr: dcutr()
            },
            peerDiscovery: [
                bootstrap({
                    list: [
                        ' /ip4/172.29.113.190/tcp/57591/ws/p2p/12D3KooWK6817XAJhEMTYu3RQfHWGZV8TFF2rmTszekx3wFvmnmy'
                    ]
                })
            ],
            connectionManager: {
                minConnections: 1,
                maxConnections: 50,
                autoDialInterval: 20000,
                autoDial: true
            }
        };
    }
}

export default new IPFSService();