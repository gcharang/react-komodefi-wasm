import seedNodes from "./seed-nodes.json";
import DOC_ELECTRUMS from "./electrums/DOC.json";
import MARTY_ELECTRUMS from "./electrums/MARTY.json";

const DOC_WSS_ELECTRUMS = DOC_ELECTRUMS.filter(server => server.ws_url && server.protocol === "SSL" && server.ws_url.length > 0).map(server => ({
    "url": server.ws_url,
    "protocol": "WSS"
}));
const MARTY_WSS_ELECTRUMS = MARTY_ELECTRUMS.filter(server => server.ws_url && server.protocol === "SSL" && server.ws_url.length > 0).map(server => ({
    "url": server.ws_url,
    "protocol": "WSS"
}));

export const rpcDefaultConfig = `[
    {
        "userpass": "3i1upE_GY4YZaj8uMjm@",
        "method": "electrum",
        "mm2": 1,
        "coin": "DOC",
        "tx_history": true,
        "servers": ${JSON.stringify(DOC_WSS_ELECTRUMS)}
    },
    {
        "userpass": "3i1upE_GY4YZaj8uMjm@",
        "method": "electrum",
        "mm2": 1,
        "coin": "MARTY",
        "tx_history": true,
        "servers": ${JSON.stringify(MARTY_WSS_ELECTRUMS)}
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
    "seednodes": ${JSON.stringify(seedNodes.filter(node => node.wss && node.netid === 8762).map(node => (node.host)))}
  }`;
