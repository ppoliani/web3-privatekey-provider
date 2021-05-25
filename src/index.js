const ProviderEngine = require('@trufflesuite/web3-provider-engine')
const FiltersSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/filters')
const NonceSubProvider = require('@trufflesuite/web3-provider-engine/subproviders/nonce-tracker')
const WalletSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/wallet')
const HookedSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/hooked-wallet')
const Wallet = require('ethereumjs-wallet').default
const ProviderSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/provider')
const RpcProvider = require('@trufflesuite/web3-provider-engine/subproviders/rpc')
const WebsocketProvider = require('@trufflesuite/web3-provider-engine/subproviders/websocket')
const Url = require('url')
const Transaction = require('ethereumjs-tx')

class PrivateKeyProvider {
  privKey
  provider
  wallet
  chainId

  constructor(privKey, provider, chainId) {
    this.privKey = privKey
    this.provider = provider
    this.wallet = new Wallet(new Buffer(this.privKey.substring(2,66), 'hex'))
    this.#setupEngine()
    this.chainId = chainId
  }

  #setupEngine() {
    this.engine = new ProviderEngine()
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new NonceSubProvider())
    this.engine.addProvider(new WalletSubprovider(this.wallet, {}))
    this.#setupProvider()
  }

  #setupProvider() {
    if (typeof this.provider === 'string') {
      const protocol = (Url.parse(this.provider).protocol || 'http:').toLowerCase()

      switch (protocol) {
        case 'ws:':
        case 'wss:':
          this.engine.addProvider(new WebsocketProvider({rpcUrl: this.provider}))
          break
        default:
          this.engine.addProvider(new RpcProvider({rpcUrl: this.provider}))
      }
    }
    else {
      this.engine.addProvider(new ProviderSubprovider(this.provider))
    }

    // Required by the provider engine.
    this.engine.start((error) => {
      if (error) throw error
    })
  }

  send(payload, callback) {
    return this.engine.send.call(this.engine, payload, callback)
  }

  sendAsync(payload, callback) {
    if(payload.method === 'eth_sendTransaction' && !payload.params[0].chainId) {
      payload.params[0].chainId = `0x${Number(this.chainId).toString(16)}`
    }

    this.engine.sendAsync.call(this.engine, payload, callback)
  }
}

module.exports = PrivateKeyProvider
