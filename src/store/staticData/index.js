export const rpcDefaultConfig = `[
    {
        "userpass": "testpsw",
        "method": "electrum",
        "mm2": 1,
        "coin": "RICK",
        "tx_history": true,
        "servers": [
            {
                "url": "electrum1.cipig.net:30017",
                "protocol": "WSS"
            }
        ]
    },
    {
        "userpass": "testpsw",
        "method": "electrum",
        "mm2": 1,
        "coin": "MORTY",
        "tx_history": true,
        "servers": [
            {
                "url": "electrum1.cipig.net:30018",
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
    "rpc_password": "testpsw",
    "netid": 8762
  }`;

export const docsBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://code-runner-iframe-version.komodo-docs-revamp-2023.pages.dev"
    : "http://localhost:3000";

export const isAllowedDomain = (domain) => {
  const localDomains = ["http://localhost:3000", "http://localhost:3001"];
  if (localDomains.includes(domain)) return true;
  else if (
    domain.startsWith("https://") &&
    domain.endsWith(".komodo-docs-revamp-2023.pages.dev")
  )
    return true;
  else return;
};
