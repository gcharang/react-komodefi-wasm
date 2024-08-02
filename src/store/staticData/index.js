export const rpcDefaultConfig = `[
    {
        "userpass": "testpsw",
        "method": "electrum",
        "mm2": 1,
        "coin": "DOC",
        "tx_history": true,
        "servers": [
            {
                "url": "electrum1.cipig.net:30020",
                "protocol": "WSS"
            }
        ]
    },
    {
        "userpass": "testpsw",
        "method": "electrum",
        "mm2": 1,
        "coin": "MARTY",
        "tx_history": true,
        "servers": [
            {
                "url": "electrum2.cipig.net:30021",
                "protocol": "WSS"
            }
        ]
    },
    {
        "userpass": "testpsw",
        "method": "enable",
        "mm2": 1,
        "coin": "ETH",
        "swap_contract_address": "0x8500AFc0bc5214728082163326C2FF0C73f4a871",
        "urls": [
            "http://eth1.cipig.net:8555"
        ]
    }
]`;

export const mm2DefaultConfig = `{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "allow_weak_password": true,
    "rpc_password": "testpsw",
    "netid": 8762
  }`;
