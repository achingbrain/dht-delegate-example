'use strict'

const ipfsNode = require('./ipfs-node')

module.exports = async (cid, delegateMultiaddr) => {
  console.info('<<---- starting the receiving node')
  const ipfs = await ipfsNode(delegateMultiaddr)

  console.info(`<<---- getting cid ${cid}`)
  const obj = await ipfs.dag.get(cid)

  console.info('<<---- resolved CID to dag-jose object:')
  console.info(obj)

  console.info('<<---- stopping the receiving node')
  await ipfs.stop()
}
