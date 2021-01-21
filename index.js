'use strict'

const send = require('./send')
const receive = require('./receive')
const multiaddr = require('multiaddr')

// Public delegate nodes - just servers running go-IPFS
// You should not use these in production as there are no availability guarantees
// instead stand up your own go-IPFS nodes
const DELEGATES = [
  multiaddr('/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic'),
  multiaddr('/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6'),
  multiaddr('/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS'),
  multiaddr('/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN')
]

async function main () {
  // Choose delegates to use - for the sake of this PoC they must be different
  // for the send and receive ends, otherwise we can't be sure we're actually
  // using the DHT to find content
  const sendDelegate = 0
  const receiveDelegate = 3

  // start an IPFS node, add a dag-jose block and use a delegate node to publish a
  // DHT provider record for that block, then stop the node
  const cid = await send(DELEGATES[sendDelegate])

  console.info('---- sending done, a DHT provider record has been published using a DHT delegate')

  // start another IPFS node and use a different DHT delegate to retrieve the block
  await receive(cid, DELEGATES[receiveDelegate])
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
