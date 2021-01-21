# dht-delegate-example

## Instructions

```console
$ git clone https://github.com/achingbrain/dht-delegate-example.git
$ cd dht-delegate-example
$ npm i
$ npm start
npm info it worked if it ends with ok
npm info using npm@6.14.1
npm info using node@v12.16.1
npm info lifecycle dht-delegate-example@1.0.0~prestart: dht-delegate-example@1.0.0
npm info lifecycle dht-delegate-example@1.0.0~start: dht-delegate-example@1.0.0

> dht-delegate-example@1.0.0 start /Users/alex/test/jose
> node index.js

---->> starting the sending node
---->> creating dag-jose data
---->> ipfs.dag.put(jws)
---->> ipfs.block.put(payload.linkedBlock)
---->> waiting for DHT provide to finish (can take a while)
---->> stopping the sending node
---- sending done, a DHT provider record has been published using a DHT delegate
<<---- starting the receiving node
<<---- getting cid bagcqcera7sm4xierwv3xbjiyukd6d7d4zqumklahxgpq2n2m5j5jdlnjc47a
<<---- resolved CID to dag-jose object:
{
  value: {
    payload: 'AXESIEd8yTdFGlSKscdRI66wNfEryrPaz37KIFtOpsnp8N-y',
    signatures: [ [Object] ],
    link: CID(bafyreichptetori2ksfldr2reoxlanprfpflhwwpp3fcaw2ou3e6t4g7wi)
  },
  remainderPath: ''
}
<<---- stopping the receiving node
npm info lifecycle dht-delegate-example@1.0.0~poststart: dht-delegate-example@1.0.0
npm timing npm Completed in 53085ms
npm info ok
>
```

## Digging deeper

Run with more logging enabled:

```
> DEBUG=libp2p-delegate* npm start
```

## Problems

Sometimes the public delegate nodes do not respond or refuse connections. With debug logging enabled you may see things like:

```
findProviders errored: FetchError: request to https://node0.preload.ipfs.io/api/v0/dht/findProvs?timeout=30000ms&arg=QmS8MP5iwaHF1dugfwvaDMZEqobva6kHzbS62UszPj5ezn failed, reason: connect ECONNREFUSED 147.75.69.147:443
```

If this happens, re-run the example or start your own delegate nodes and update the list of servers in `index.js` to use them.
