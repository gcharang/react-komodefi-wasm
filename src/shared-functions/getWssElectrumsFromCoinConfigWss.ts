interface ElectrumServer {
  url: string;
  protocol: string;
  disable_cert_verification?: boolean;
}

interface CoinElectrumConfig {
  userpass: string;
  method: string;
  mm2: number;
  coin: string;
  tx_history: boolean;
  servers: ElectrumServer[];
}

interface CoinData {
  coin: string;
  electrum?: Array<{
    url: string;
    protocol: string;
    disable_cert_verification?: boolean;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export function extractWssElectrumsFromConfig(coinsConfig: Record<string, CoinData>): CoinElectrumConfig[] {
  return Object.entries(coinsConfig)
    .filter(([_, coinData]) => coinData.electrum && coinData.electrum.length > 0)
    .map(([coinSymbol, coinData]) => {
      // Filter for WSS servers only
      const wssServers = coinData.electrum!
        .filter((server) => server.protocol === "WSS")
        .map((server) => ({
          url: server.url,
          protocol: "WSS",
          ...(server.disable_cert_verification && { disable_cert_verification: server.disable_cert_verification })
        }));
      
      // Only return if there are WSS servers
      if (wssServers.length > 0) {
        return {
          userpass: "3i1upE_GY4YZaj8uMjm@",
          method: "electrum",
          mm2: 1,
          coin: coinSymbol,
          tx_history: true,
          servers: wssServers
        };
      }
      return null;
    })
    .filter(Boolean) as CoinElectrumConfig[];
}

export async function fetchWssElectrums(fallbackConfig?: Record<string, CoinData>): Promise<CoinElectrumConfig[]> {
  const COINS_CONFIG_URL = "https://raw.githubusercontent.com/KomodoPlatform/coins/refs/heads/master/utils/coins_config_wss.json";
  
  try {
    const response = await fetch(COINS_CONFIG_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coins config: ${response.status} ${response.statusText}`);
    }
    
    const coinsConfig = await response.json();
    return extractWssElectrumsFromConfig(coinsConfig);
  } catch (error) {
    console.warn("Failed to fetch coins config from remote, using fallback:", error);
    
    if (fallbackConfig) {
      return extractWssElectrumsFromConfig(fallbackConfig);
    }
    
    return [];
  }
}