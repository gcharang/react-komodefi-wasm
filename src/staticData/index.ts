import seedNodes from './seed-nodes.json';
import DOC_ELECTRUMS from './electrums/DOC.json';
import MARTY_ELECTRUMS from './electrums/MARTY.json';
import coins_config_wss from './coins_config_wss.json';
import { extractWssElectrumsFromConfig } from '../shared-functions/getWssElectrumsFromCoinConfigWss';
import { getSessionPassword } from '../shared-functions/passwordGenerator';

const DOC_WSS_ELECTRUMS = DOC_ELECTRUMS.filter(
  (server) =>
    server.ws_url && server.protocol === 'SSL' && server.ws_url.length > 0
).map((server) => ({
  url: server.ws_url,
  protocol: 'WSS',
}));
const MARTY_WSS_ELECTRUMS = MARTY_ELECTRUMS.filter(
  (server) =>
    server.ws_url && server.protocol === 'SSL' && server.ws_url.length > 0
).map((server) => ({
  url: server.ws_url,
  protocol: 'WSS',
}));

// Use the shared function to extract WSS electrums
export const ALL_COIN_ELECTRUMS =
  extractWssElectrumsFromConfig(coins_config_wss);

// Store the session password globally so both configs use the same one
let sessionPassword: string | null = null;

// Get dynamic configs with generated password
export const getRpcDefaultConfig = () => {
  if (!sessionPassword) {
    sessionPassword = getSessionPassword();
  }
  return `[
    {
        "userpass": "${sessionPassword}",
        "method": "electrum",
        "mm2": 1,
        "coin": "DOC",
        "tx_history": true,
        "servers": ${JSON.stringify(DOC_WSS_ELECTRUMS)}
    },
    {
        "userpass": "${sessionPassword}",
        "method": "electrum",
        "mm2": 1,
        "coin": "MARTY",
        "tx_history": true,
        "servers": ${JSON.stringify(MARTY_WSS_ELECTRUMS)}
    }
]`;
};

export const getMm2DefaultConfig = () => {
  if (!sessionPassword) {
    sessionPassword = getSessionPassword();
  }
  return `{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "i_am_seed": false,
    "disable_p2p": false,
    "rpc_password": "${sessionPassword}",
    "netid": 8762,
    "seednodes": ${JSON.stringify(
      seedNodes
        .filter((node) => node.wss && node.netid === 8762)
        .map((node) => node.host)
    )}
}`;
};
