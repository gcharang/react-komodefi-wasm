import seedNodes from "./seed-nodes.json";

export const rpcDefaultConfig = `[
    {
        "userpass": "3i1upE_GY4YZaj8uMjm@",
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
        "userpass": "3i1upE_GY4YZaj8uMjm@",
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
    }
]`;

export const mm2DefaultConfig = `{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "i_am_seed": false,
    "disable_p2p": false,
    "rpc_password": "3i1upE_GY4YZaj8uMjm@",
    "netid": 8762,
    "seednodes": ${JSON.stringify(seedNodes.filter(node => node.wss).map(node => (node.host)))}
  }`;
