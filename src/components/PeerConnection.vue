<template>
  <div>
    <h2>Peer Connection</h2>
    <div>
      <h3>Your Multiaddr:</h3>
      <p>{{ ownMultiaddr }}</p>
    </div>
    <input v-model="peerMultiaddr" placeholder="Peer multiaddr" />
    <button @click="dialPeer">Connect to Peer</button>
    <p v-if="connectionError" class="error">{{ connectionError }}</p>
    <h3>Connected Peers</h3>
    <ul>
      <li v-for="peer in connectedPeers" :key="peer">{{ peer }}</li>
    </ul>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue';
import { useChatStore } from '../stores/chatStore';
import ipfsService from '../services/ipfsService';

const chatStore = useChatStore();
const peerMultiaddr = ref('');
const connectedPeers = ref([]);
const ownMultiaddr = ref('');
const connectionError = ref('');

const updateOwnMultiaddr = () => {
  ownMultiaddr.value = ipfsService.getOwnMultiaddr() || 'Not available';
};

const dialPeer = async () => {
  try {
    connectionError.value = '';
    if (!peerMultiaddr.value.includes('/p2p/')) {
      connectionError.value = 'Invalid peer address. It should include a peer ID.';
      return;
    }
    console.log('Attempting to dial:', peerMultiaddr.value);
    await ipfsService.dialPeer(peerMultiaddr.value);
    console.log('Successfully connected to peer');
    peerMultiaddr.value = '';
    await updateConnectedPeers();
  } catch (error) {
    connectionError.value = `Error connecting to peer: ${error.message}`;
    console.error('Error connecting to peer:', error);
  }
};


const updateConnectedPeers = async () => {
  connectedPeers.value = await ipfsService.getConnectedPeers();
};

let interval;

onMounted(() => {
  updateConnectedPeers();
  updateOwnMultiaddr();
  interval = setInterval(() => {
    updateConnectedPeers();
    updateOwnMultiaddr();
  }, 5000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>