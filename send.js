const ipfsNode = require('./ipfs-node')
const {
  encodePayload
} = require('dag-jose-utils')
const {
  EllipticSigner,
  createJWS
} = require('did-jwt')
const u8a = require('uint8arrays')

module.exports = async (delegateMultiaddr) => {
  // Start js-ipfs instance with dag-jose enabled and with DHT delegates
  console.info('---->> starting the sending node')
  const ipfs = await ipfsNode(delegateMultiaddr)

  // encode and sign payload
  console.info('---->> creating dag-jose data')
  const signer = new EllipticSigner('278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f')
  const payload = await encodePayload({ my: 'payload ' + Date.now() })
  const jws = await createJWS(u8a.toString(payload.cid.bytes, 'base64url'), signer)

  console.info('---->> ipfs.dag.put(jws)')
  const cid = await ipfs.dag.put(jws, { format: 'dag-jose', hashAlg: 'sha2-256' })

  console.info('---->> ipfs.block.put(payload.linkedBlock)')
  await ipfs.block.put(payload.linkedBlock, { cid: payload.cid })

  // This operation happens in the background automatically for every block added to
  // our node's block store so it's not normally necessary to do this explicitly, but
  // for the sake of this PoC we want to ensure that the provide has finished before
  // we continue so we invoke it manually
  console.info('---->> waiting for DHT provide to finish (can take a while)')
  await ipfs.libp2p.contentRouting.provide(cid)

  // Stop the sending node so the receiving node doesn't accidentally pull the block
  // over via bitswap
  //
  // Nb. the public delegates garbage collect all blocks hourly, but a running node will
  // automatically use the delegate to re-provide the block, so if we want it to be available
  // we need to keep our node running.
  //
  // If you stand up your own DHT delegates and don't configure hourly repo GC, you don't
  // need to keep your other nodes running
  console.info('---->> stopping the sending node')
  await ipfs.stop()

  return cid
}
