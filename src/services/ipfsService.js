import { createHelia } from 'helia'
import { createLibp2p } from 'libp2p'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { identify } from '@libp2p/identify'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { LevelBlockstore } from "blockstore-level"
import { bitswap } from "@helia/block-brokers"
import { all } from "@libp2p/websockets/filters"
import { createOrbitDB } from "@orbitdb/core"
import { multiaddr } from '@multiformats/multiaddr'
import { WebRTC as WebRTCMatcher } from '@multiformats/multiaddr-matcher'
import pRetry from 'p-retry'
import delay from 'delay'

class IPFSService {
    constructor() {
        this.orbitdb = null;
    }

    async initOrbitDB({ id, identity, identities, directory } = {}) {
        const options = this.isBrowser() ? this.DefaultLibp2pBrowserOptions : this.DefaultLibp2pOptions;
        const libp2p = await createLibp2p({ ...options });
        directory = directory || '.';
        const blockstore = new LevelBlockstore(`${directory}/ipfs/blocks`);
        const ipfs = await createHelia({ libp2p, blockstore, blockBrokers: [bitswap()] });
        this.orbitdb = await createOrbitDB({ ipfs, id, identity, identities, directory });
        return this.orbitdb;
    }

    async stopOrbitDB() {
        if (this.orbitdb) {
            await this.orbitdb.stop();
            await this.orbitdb.ipfs.stop();
            await this.orbitdb.ipfs.blockstore.unwrap().unwrap().child.db.close();
            this.orbitdb = null;
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
                listen: ['/webrtc']
            },
            transports: [
                webSockets({
                    filter: all
                }),
                webRTC(),
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
}

export default new IPFSService();