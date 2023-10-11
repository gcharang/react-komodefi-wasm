export const rpcDefaultConfig = `[
    {
        "userpass": "testpsw",
        "mmrpc": "2.0",
        "method": "task::enable_utxo::init",
        "params": {
          "ticker": "KMD",
          "activation_params": {
            "mode": {
              "rpc": "Electrum",
              "rpc_data": {
                "servers": [
                  {
                    "url": "electrum3.cipig.net:30001",
                    "protocol": "WSS"
                  }
                ]
              }
            },
            "scan_policy": "scan_if_new_wallet",
            "priv_key_policy": "Trezor",
            "min_addresses_number": 3,
            "gap_limit": 20
          }
        }
      },
      {
          "userpass": "testpsw",
          "mmrpc": "2.0",
          "method": "task::enable_utxo::init",
          "params": {
            "ticker": "DOC",
            "activation_params": {
              "mode": {
                "rpc": "Electrum",
                "rpc_data": {
                  "servers": [
                    {
                      "url": "electrum3.cipig.net:30020",
                      "protocol": "WSS"
                    }
                  ]
                }
              },
              "scan_policy": "scan_if_new_wallet",
              "min_addresses_number": 3,
              "gap_limit": 20
            }
          }
        },
      {
        "userpass": "testpsw",
        "mmrpc": "2.0",
        "method": "task::enable_utxo::init",
        "params": {
          "ticker": "MARTY",
          "activation_params": {
            "mode": {
              "rpc": "Electrum",
              "rpc_data": {
                "servers": [
                  {
                    "url": "electrum3.cipig.net:30021",
                    "protocol": "WSS"
                  }
                ]
              }
            },
            "scan_policy": "scan_if_new_wallet",
            "min_addresses_number": 3,
            "gap_limit": 20
          }
        }
      },
      {
        "userpass": "testpsw",
        "mmrpc": "2.0",
        "method": "task::enable_qtum::init",
        "params": {
          "ticker": "QTUM",
          "activation_params": {
            "mode": {
              "rpc": "Electrum",
              "rpc_data": {
                "servers": [
                  {
                    "url": "electrum3.cipig.net:30050",
                    "protocol": "WSS"
                  }
                ]
              }
            },
            "scan_policy": "scan_if_new_wallet",
            "min_addresses_number": 3,
            "gap_limit": 20
          }
        }
      }
]`;
