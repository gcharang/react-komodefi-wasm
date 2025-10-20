// Cryptocurrency and coin-related types

export interface ElectrumServer {
  url: string;
  protocol: string;
  disable_cert_verification?: boolean;
  ws_url?: string;
}

export interface CoinElectrumConfig {
  userpass: string;
  method: string;
  mm2: number;
  coin: string;
  tx_history: boolean;
  servers: ElectrumServer[];
}

export interface CoinData {
  coin: string;
  name?: string;
  fname?: string;
  protocol?: {
    type: string;
    protocol_data?: any;
  };
  electrum?: ElectrumServer[];
  nodes?: Array<{
    url: string;
    contact?: {
      [key: string]: string;
    };
  }>;
  explorer_url?: string | string[];
  explorer_tx_url?: string;
  explorer_address_url?: string;
  explorer_block_url?: string;
  type?: string;
  sign_message_prefix?: string;
  is_testnet?: boolean;
  decimals?: number;
  coinpaprika_id?: string;
  coingecko_id?: string;
  livecoinwatch_id?: string;
  [key: string]: any; // Additional coin-specific properties
}

export interface CoinConfigWss {
  [coinSymbol: string]: CoinData;
}

// Coin activation related types
export interface CoinActivationRequest {
  userpass: string;
  method: string;
  coin: string;
  servers?: ElectrumServer[];
  tx_history?: boolean;
  mm2?: number;
}

export interface CoinActivationResponse {
  address: string;
  balance: string;
  coin: string;
  locked_by_swaps?: string;
  required_confirmations?: number;
  requires_notarization?: boolean;
  result: string;
}

// Balance related types
export interface Balance {
  coin: string;
  balance: string;
  spendable: string;
  unspendable?: string;
  address?: string;
}

// Transaction types
export interface Transaction {
  tx_hash: string;
  from: string[];
  to: string[];
  total_amount: string;
  spent_by_me: string;
  received_by_me: string;
  my_balance_change: string;
  block_height: number;
  confirmations: number;
  timestamp: number;
  fee_details?: {
    type: string;
    amount?: string;
    coin?: string;
  };
  coin: string;
  internal_id?: string;
}

// Orderbook types
export interface OrderbookEntry {
  coin: string;
  address: string;
  price: string;
  price_rat: [string, string];
  price_fraction: {
    numer: string;
    denom: string;
  };
  max_volume: string;
  max_volume_rat: [string, string];
  max_volume_fraction: {
    numer: string;
    denom: string;
  };
  min_volume: string;
  min_volume_rat: [string, string];
  min_volume_fraction: {
    numer: string;
    denom: string;
  };
  pubkey: string;
  uuid: string;
  is_mine: boolean;
  base_confs?: number;
  base_nota?: boolean;
  rel_confs?: number;
  rel_nota?: boolean;
}

export interface Orderbook {
  asks: OrderbookEntry[];
  bids: OrderbookEntry[];
  base: string;
  rel: string;
  timestamp: number;
  netid: number;
  total_asks_base_vol: string;
  total_asks_base_vol_rat: [string, string];
  total_asks_base_vol_fraction: {
    numer: string;
    denom: string;
  };
  total_asks_rel_vol: string;
  total_asks_rel_vol_rat: [string, string];
  total_asks_rel_vol_fraction: {
    numer: string;
    denom: string;
  };
  total_bids_base_vol: string;
  total_bids_base_vol_rat: [string, string];
  total_bids_base_vol_fraction: {
    numer: string;
    denom: string;
  };
  total_bids_rel_vol: string;
  total_bids_rel_vol_rat: [string, string];
  total_bids_rel_vol_fraction: {
    numer: string;
    denom: string;
  };
}
