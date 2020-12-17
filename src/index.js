const ProviderEngine = require('@trufflesuite/web3-provider-engine')
const FiltersSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/filters')
const NonceSubProvider = require('@trufflesuite/web3-provider-engine/subproviders/nonce-tracker')
const HookedSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/hooked-wallet')
const ProviderSubprovider = require('@trufflesuite/web3-provider-engine/subproviders/provider')
const RpcProvider = require('@trufflesuite/web3-provider-engine/subproviders/rpc')
const WebsocketProvider = require('@trufflesuite/web3-provider-engine/subproviders/websocket')
const Url = require('url')
const Transaction = require('ethereumjs-tx')

class PrivateKeyProvider {
  privKey
  provider

  constructor(privKey, provider) {
    this.privKey = privKey
    this.provider = provider
    this.#setupEngine()
  }

  #setupEngine() {
    const pollingInterval = 4000
    this.engine = new ProviderEngine({pollingInterval})
    this.engine.addProvider(new NonceSubProvider())
    this.engine.addProvider(new FiltersSubprovider())
  }

  #setupProvider() {
    if (typeof provider === 'string') {
      const protocol = (Url.parse(url).protocol || 'http:').toLowerCase()

      switch (protocol) {
        case 'ws:':
        case 'wss:':
          this.engine.addProvider(new WebsocketProvider({rpcUrl: provider}))
          break
        default:
          this.engine.addProvider(new RpcProvider({rpcUrl: provider}))
      }
    }
    else {
      this.engine.addProvider(new ProviderSubprovider(provider))
    }
  }

  send() {
    return this.engine.send.call(this.engine, payload, callback)
  }

  sendAsync() {
    this.engine.sendAsync.call(this.engine, payload, callback)
  }
}
