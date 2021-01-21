const IPFS = require('ipfs-core')
const ipfsHttpClient = require('ipfs-http-client')
const LibP2P = require('libp2p')
const DelegatedPeerRouter = require('libp2p-delegated-peer-routing')
const DelegatedContentRouter = require('libp2p-delegated-content-routing')
const { default: dagJose } = require('dag-jose')
const os = require('os')
const codecToFormat = require('./codec-to-format')
const multiaddr = require('multiaddr')

function getLibp2p (delegateMultiaddr, { libp2pOptions, peerId }) {
  // turn /dns4/domain/tcp/port/wss/p2p/peerid into /dns4/domain/tcp/port/https
  const delegateHttpAddr = delegateMultiaddr
    .decapsulateCode(multiaddr.protocols.names.p2p.code)
    .decapsulateCode(multiaddr.protocols.names.wss.code)
    .encapsulate('/https')

  const delegateHttpClient = ipfsHttpClient({
    url: delegateHttpAddr
  })

  libp2pOptions.modules.contentRouting = libp2pOptions.modules.contentRouting || []
  libp2pOptions.modules.contentRouting.push(new DelegatedContentRouter(peerId, delegateHttpClient))

  libp2pOptions.modules.peerRouting = libp2pOptions.modules.peerRouting || []
  libp2pOptions.modules.peerRouting.push(new DelegatedPeerRouter(delegateHttpClient))

  return new LibP2P(libp2pOptions)
}

// Start js-ipfs instance with dag-jose enabled
async function ipfsNode (delegateMultiaddr) {
  // setup dag-jose codec
  const format = codecToFormat(dagJose)

  // configure an IPFS node that only bootstraps to the delegate and has no
  // peer discovery mechanisms other than the DHT delegate
  const ipfsOpts = {
    repo: `${os.tmpdir()}/ipfs-${Math.random()}`,
    silent: true,
    ipld: {
      formats: [
        format
      ]
    },
    preload: {
      // make sure we don't accidentally push the dag-jose block to a preload node - not needed
      // in production
      enabled: false
    },
    libp2p: (opts) => getLibp2p(delegateMultiaddr, opts),
    config: {
      Addresses: {
        Swarm: [
          '/ip4/0.0.0.0/tcp/0'
        ],
        Delegates: [
          delegateMultiaddr
        ]
      },
      // disable bootstrap nodes, means we won't accidentally get the block from the preload nodes - not
      // needed in production
      Bootstrap: [
        delegateMultiaddr
      ],
      Discovery: {
        // disable mDNS peer discovery so we can run two nodes on the same machine without
        // them finding each other - not needed in production
        MDNS: {
          Enabled: false
        },
        webRTCStar: {
          Enabled: false
        }
      }
    }
  }

  return IPFS.create(ipfsOpts)
}

module.exports = ipfsNode
