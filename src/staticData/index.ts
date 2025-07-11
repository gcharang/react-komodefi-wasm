import seedNodes from "./seed-nodes.json";
import DOC_ELECTRUMS from "./electrums/DOC.json";
import MARTY_ELECTRUMS from "./electrums/MARTY.json";
import coins_config_wss from "./coins_config_wss.json";

const DOC_WSS_ELECTRUMS = DOC_ELECTRUMS.filter(
  (server) =>
    server.ws_url && server.protocol === "SSL" && server.ws_url.length > 0
).map((server) => ({
  url: server.ws_url,
  protocol: "WSS",
}));
const MARTY_WSS_ELECTRUMS = MARTY_ELECTRUMS.filter(
  (server) =>
    server.ws_url && server.protocol === "SSL" && server.ws_url.length > 0
).map((server) => ({
  url: server.ws_url,
  protocol: "WSS",
}));

export const ALL_COIN_ELECTRUMS = Object.entries(coins_config_wss)
  .filter(
    ([_, coinData]: [string, any]) =>
      coinData.electrum && coinData.electrum.length > 0
  )
  .map(([coinSymbol, coinData]: [string, any]) => {
    // Filter for WSS servers only
    const wssServers = coinData.electrum
      .filter((server: any) => server.protocol === "WSS")
      .map((server: any) => ({
        url: server.url,
        protocol: "WSS",
      }));

    // Only return if there are WSS servers
    if (wssServers.length > 0) {
      return {
        userpass: "3i1upE_GY4YZaj8uMjm@",
        method: "electrum",
        mm2: 1,
        coin: coinSymbol,
        tx_history: true,
        servers: wssServers,
      };
    }
    return null;
  })
  .filter(Boolean); // Remove null entries

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
    "seednodes": ${JSON.stringify(
      seedNodes
        .filter((node) => node.wss && node.netid === 8762)
        .map((node) => node.host)
    )}
  }`;
