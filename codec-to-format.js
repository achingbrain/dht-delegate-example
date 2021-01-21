'use strict'

const multicodec = require('multicodec')
const multihashing = require('multihashing-async')
const CID = require('cids')

// convert multiformat codec to ipld format
function codecToFormat (codec, hashAlg = multicodec.SHA2_256) {
  const format = {
    util: {
      serialize (node) {
        return codec.encode(node)
      },
      deserialize (buffer) {
        return codec.decode(buffer)
      },
      async cid (buffer, options) {
        const defaultOptions = { cidVersion: 1, hashAlg }
        const opts = Object.assign(defaultOptions, options)
        const multihash = await multihashing(buffer, opts.hashAlg)
        const codecName = multicodec.print[codec.code]

        return new CID(opts.cidVersion, codecName, multihash)
      }
    },
    resolver: {
      resolve (buffer, path) {
        const node = format.util.deserialize(buffer)

        if (path.startsWith('/')) {
          path = path.substring(1)
        }

        let value = node
        const remainder = path.split('/')

        while (remainder.length) {
          const component = remainder.shift()

          if (Object.prototype.hasOwnProperty.call(value, component)) {
            value = value[component]
          } else {
            return {
              value,
              remainderPath: `/${[component, ...remainder].join('/')}`
            }
          }
        }

        return {
          value,
          remainderPath: ''
        }
      },
      tree (buffer) {
        throw new Error('format.resolver.tree not implemented')
      }
    },
    codec: codec.code,
    defaultHashAlg: hashAlg
  }

  return format
}

module.exports = codecToFormat
