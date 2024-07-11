import { createHelia } from 'helia'
import { createLibp2p } from 'libp2p'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { identify } from '@libp2p/identify'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import {LevelBlockstore} from "blockstore-level";
import {bitswap} from "@helia/block-brokers";
import {all} from "@libp2p/websockets/filters";
import {createOrbitDB} from "@orbitdb/core";

const isBrowser = () => typeof window !== 'undefined'

export const startOrbitDB = async ({ id, identity, identities, directory } = {}) => {
    const options = isBrowser() ? DefaultLibp2pBrowserOptions : DefaultLibp2pOptions
    const libp2p = await createLibp2p({ ...options })
    directory = directory || '.'
    const blockstore = new LevelBlockstore(`${directory}/ipfs/blocks`);
    const ipfs = await createHelia({ libp2p, blockstore, blockBrokers: [bitswap()] })
    const orbitdb = await createOrbitDB({ ipfs, id, identity, identities, directory })
    return orbitdb
}

const stopOrbitDB = async (orbitdb) => {
    await orbitdb.stop()
    await orbitdb.ipfs.stop()
    await orbitdb.ipfs.blockstore.unwrap().unwrap().child.db.close()
}

export const DefaultLibp2pOptions = {
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
}

/**
 * A basic Libp2p configuration for browser nodes.
 */
export const DefaultLibp2pBrowserOptions = {
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
}