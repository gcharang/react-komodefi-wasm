import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Checkbox,
} from '@headlessui/react';
import type {
  ElectrumCoinsModalProps,
  CoinItemProps,
} from '../types/components';
import type { CoinElectrumConfig } from '../types/coins';
import { ALL_COIN_ELECTRUMS } from '../staticData';
import coins_config_wss from '../staticData/coins_config_wss.json';
import { fetchWssElectrums } from '../shared-functions/getWssElectrumsFromCoinConfigWss';
import { updateUserPass } from '../shared-functions/updateUserPassword';
import { useMm2PanelState } from '../store/useStore';
import { CheckCircle, ClipboardCheck, X } from 'lucide-react';
import JsonMonacoEditor from './JsonMonacoEditor';

const CoinItem = memo<CoinItemProps>(({ coin, isSelected, onToggle }) => {
  const handleClick = () => {
    onToggle(coin.coin);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-3 md:px-4 py-2.5 md:py-2 text-left text-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-md ${
        isSelected
          ? 'bg-accent/20 text-accent hover:bg-accent/30'
          : 'text-text-primary hover:bg-primary-bg-800 hover:text-accent'
      }`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onChange={handleClick}
          className="group size-4 md:size-4 rounded border border-border-primary bg-primary-bg-900 data-[checked]:bg-accent data-[checked]:border-accent focus:ring-1 focus:ring-accent/50 focus:ring-offset-0 cursor-pointer"
          onClick={handleCheckboxClick}
        >
          <svg
            className="hidden size-4 md:size-4 fill-white group-data-[checked]:block"
            viewBox="0 0 14 14"
          >
            <path
              d="M11.5 4.5L6 10L2.5 6.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </Checkbox>
        <div className="flex-1 flex items-center justify-between">
          <span className="font-medium">{coin.coin}</span>
          <span className="text-xs text-text-muted">
            {coin.servers.length} server{coin.servers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </button>
  );
});

CoinItem.displayName = 'CoinItem';

export const ElectrumCoinsModal: React.FC<ElectrumCoinsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCoins, setSelectedCoins] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [mobileTab, setMobileTab] = useState<'select' | 'preview'>('select');
  const { mm2PanelState } = useMm2PanelState();

  // Initialize with password-synced coins - optimized with useMemo
  const getInitialCoins = useMemo(() => {
    try {
      const currentPassword = JSON.parse(mm2PanelState.mm2Config).rpc_password;
      if (currentPassword) {
        return ALL_COIN_ELECTRUMS.map((coin) => {
          const cloned =
            typeof structuredClone !== 'undefined'
              ? structuredClone(coin)
              : JSON.parse(JSON.stringify(coin));
          return updateUserPass(cloned, currentPassword);
        });
      }
    } catch (error) {
      // Fall back to default if parsing fails
    }
    return ALL_COIN_ELECTRUMS;
  }, []);

  const [electrumCoins, setElectrumCoins] =
    useState<CoinElectrumConfig[]>(getInitialCoins);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Function to get the current RPC password from MM2 config
  const getCurrentRpcPassword = () => {
    try {
      return JSON.parse(mm2PanelState.mm2Config).rpc_password;
    } catch (error) {
      console.error('Failed to parse MM2 config for password', error);
      return null;
    }
  };

  // Fetch fresh data when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setFetchError(null);

      fetchWssElectrums(coins_config_wss as any)
        .then((data) => {
          if (data.length > 0) {
            // Update with current password if available
            const currentPassword = getCurrentRpcPassword();
            if (currentPassword) {
              const updatedData = data.map((coin) => {
                const cloned =
                  typeof structuredClone !== 'undefined'
                    ? structuredClone(coin)
                    : JSON.parse(JSON.stringify(coin));
                return updateUserPass(cloned, currentPassword);
              });
              setElectrumCoins(updatedData);
            } else {
              setElectrumCoins(data);
            }
          }
        })
        .catch((error) => {
          console.error('Failed to fetch electrum coins:', error);
          setFetchError('Failed to fetch latest data. Using cached version.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // Update passwords when MM2 config changes
  useEffect(() => {
    if (electrumCoins.length > 0 && isOpen) {
      const currentPassword = getCurrentRpcPassword();
      if (currentPassword) {
        // Only update if password actually changed
        const firstCoin = electrumCoins[0];
        if (firstCoin && firstCoin.userpass !== currentPassword) {
          const updatedCoins = electrumCoins.map((coin) => {
            const cloned =
              typeof structuredClone !== 'undefined'
                ? structuredClone(coin)
                : JSON.parse(JSON.stringify(coin));
            return updateUserPass(cloned, currentPassword);
          });
          setElectrumCoins(updatedCoins);
        }
      }
    }
  }, [mm2PanelState.mm2Config, isOpen]);

  // Filter coins based on search term and selection filter
  const filteredCoins = useMemo(() => {
    return electrumCoins.filter((coin) => {
      if (!coin) return false;
      const matchesSearch = coin.coin
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSelection =
        !showSelectedOnly || selectedCoins.has(coin.coin);
      return matchesSearch && matchesSelection;
    });
  }, [searchTerm, electrumCoins, showSelectedOnly, selectedCoins]);

  // Get selected coins data with synced password - optimized deep clone
  const selectedCoinsData = useMemo(() => {
    const coinsData = electrumCoins.filter(
      (coin) => coin && selectedCoins.has(coin.coin)
    );
    const currentPassword = getCurrentRpcPassword();
    if (currentPassword && coinsData.length > 0) {
      // Use structuredClone for better performance (or fallback to JSON method)
      return coinsData.map((coinData) => {
        const cloned =
          typeof structuredClone !== 'undefined'
            ? structuredClone(coinData)
            : JSON.parse(JSON.stringify(coinData));
        return updateUserPass(cloned, currentPassword);
      });
    }
    return coinsData;
  }, [selectedCoins, electrumCoins, mm2PanelState.mm2Config]);

  // Toggle coin selection - optimized with useCallback
  const toggleCoinSelection = useCallback((coinName: string) => {
    setSelectedCoins((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(coinName)) {
        newSet.delete(coinName);
      } else {
        newSet.add(coinName);
      }
      return newSet;
    });
  }, []);

  // Select/Deselect all filtered coins - optimized with useCallback
  const toggleSelectAll = useCallback(() => {
    if (filteredCoins.length === 0) return;

    const allFilteredSelected = filteredCoins.every((coin) =>
      selectedCoins.has(coin.coin)
    );
    if (allFilteredSelected) {
      // Deselect all filtered coins
      setSelectedCoins((prev) => {
        const newSet = new Set(prev);
        filteredCoins.forEach((coin) => newSet.delete(coin.coin));
        return newSet;
      });
    } else {
      // Select all filtered coins
      setSelectedCoins((prev) => {
        const newSet = new Set(prev);
        filteredCoins.forEach((coin) => newSet.add(coin.coin));
        return newSet;
      });
    }
  }, [filteredCoins, selectedCoins]);

  // Clear all selections - optimized with useCallback
  const clearSelection = useCallback(() => {
    setSelectedCoins(new Set());
  }, []);

  const copyToClipboard = useCallback(() => {
    if (selectedCoinsData.length > 0) {
      // Format for multiple coins - wrap in array if multiple
      const dataToExport =
        selectedCoinsData.length === 1
          ? selectedCoinsData[0]
          : selectedCoinsData;
      navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [selectedCoinsData]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-2 md:p-4">
        <DialogPanel
          transition
          className="relative max-h-[90vh] md:max-h-[80vh] w-full max-w-full md:max-w-4xl overflow-hidden rounded-lg bg-primary-bg-800/95 backdrop-blur-xl shadow-2xl ring-1 ring-accent/20 transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="flex items-center justify-between border-b border-border-primary p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <DialogTitle className="text-base md:text-lg font-semibold text-text-primary">
                <span className="hidden md:inline">Select Electrum Coins</span>
                <span className="md:hidden">Electrum Coins</span>
              </DialogTitle>
              {selectedCoins.size > 0 && (
                <span className="text-xs md:text-sm text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {selectedCoins.size}
                </span>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <svg
                    className="animate-spin h-4 w-4 text-accent"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden md:inline">
                    Loading latest data...
                  </span>
                </div>
              )}
              {fetchError && !isLoading && (
                <span className="text-sm text-warning">{fetchError}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-accent transition-all duration-200 cursor-pointer p-1 rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden flex border-b border-border-primary">
            <button
              onClick={() => setMobileTab('select')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:z-10 ${
                mobileTab === 'select'
                  ? 'text-accent border-b-2 border-accent bg-primary-bg-700/50'
                  : 'text-text-muted hover:text-text-primary hover:bg-primary-bg-700/30'
              }`}
            >
              Select ({selectedCoins.size})
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:z-10 ${
                mobileTab === 'preview'
                  ? 'text-accent border-b-2 border-accent bg-primary-bg-700/50'
                  : 'text-text-muted hover:text-text-primary hover:bg-primary-bg-700/30'
              }`}
              disabled={selectedCoinsData.length === 0}
            >
              Preview ({selectedCoinsData.length})
            </button>
          </div>

          {/* Mobile Content */}
          <div className="md:hidden h-[60vh]">
            {mobileTab === 'select' ? (
              /* Mobile Coin List */
              <div className="h-full flex flex-col">
                <div className="p-3">
                  <Field>
                    <Input
                      id="electrum-coin-search-mobile"
                      name="electrum-coin-search-mobile"
                      type="text"
                      placeholder="Search coins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg bg-primary-bg-900/50 px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </Field>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        {filteredCoins.length} of {electrumCoins.length} coins
                      </span>
                      {selectedCoins.size > 0 && (
                        <span className="text-xs font-medium text-accent">
                          {selectedCoins.size} selected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 border-t border-border-primary pt-2">
                      <button
                        onClick={toggleSelectAll}
                        className="w-full rounded-md bg-primary-bg-900/50 px-3 py-3 text-sm font-medium text-text-primary hover:bg-accent/20 hover:text-accent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
                        disabled={filteredCoins.length === 0}
                      >
                        {filteredCoins.length > 0 &&
                        filteredCoins.every((coin) =>
                          selectedCoins.has(coin.coin)
                        )
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                      {selectedCoins.size > 0 && (
                        <button
                          onClick={clearSelection}
                          className="w-full rounded-md bg-primary-bg-900/50 px-3 py-3 text-sm font-medium text-text-primary hover:bg-danger/20 hover:text-danger transition-all duration-200 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-danger/50 active:scale-[0.98]"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    <div
                      onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                      className="flex items-center gap-2 rounded-md bg-primary-bg-900/30 px-3 py-2.5 cursor-pointer hover:bg-primary-bg-900/50 transition-colors"
                    >
                      <Checkbox
                        id="show-selected-only-mobile"
                        name="show-selected-only-mobile"
                        checked={showSelectedOnly}
                        onChange={setShowSelectedOnly}
                        className="group size-4 rounded border border-border-primary bg-primary-bg-900 data-[checked]:bg-accent data-[checked]:border-accent focus:ring-1 focus:ring-accent/50 focus:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          className="hidden size-4 fill-white group-data-[checked]:block"
                          viewBox="0 0 14 14"
                        >
                          <path
                            d="M11.5 4.5L6 10L2.5 6.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </Checkbox>
                      <span className="text-sm text-text-secondary select-none">
                        Show selected only
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2">
                  {filteredCoins.map((coin) => {
                    if (!coin) return null;
                    return (
                      <div key={coin.coin} className="mb-1">
                        <button
                          onClick={() => toggleCoinSelection(coin.coin)}
                          className={`w-full px-3 py-3 text-left text-sm transition-all duration-200 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                            selectedCoins.has(coin.coin)
                              ? 'bg-accent/20 text-accent hover:bg-accent/30'
                              : 'text-text-primary hover:bg-primary-bg-800 hover:text-accent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedCoins.has(coin.coin)}
                              onChange={() => toggleCoinSelection(coin.coin)}
                              className="group size-5 rounded border border-border-primary bg-primary-bg-900 data-[checked]:bg-accent data-[checked]:border-accent focus:ring-1 focus:ring-accent/50 focus:ring-offset-0 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg
                                className="hidden size-5 fill-white group-data-[checked]:block"
                                viewBox="0 0 14 14"
                              >
                                <path
                                  d="M11.5 4.5L6 10L2.5 6.5"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                />
                              </svg>
                            </Checkbox>
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-medium">{coin.coin}</span>
                              <span className="text-xs text-text-muted">
                                {coin.servers.length} server
                                {coin.servers.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Mobile JSON Preview */
              <div className="h-full flex flex-col p-3">
                {selectedCoinsData.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium text-text-primary">
                        {selectedCoinsData.length === 1
                          ? `${selectedCoinsData[0].coin}`
                          : `${selectedCoinsData.length} Coins`}
                      </h3>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 rounded-lg bg-primary-bg-800 px-3 py-2 text-sm text-text-primary hover:bg-primary-bg-700 hover:text-accent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-success">Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden rounded-lg bg-primary-bg-900/50">
                      <JsonMonacoEditor
                        value={JSON.stringify(
                          selectedCoinsData.length === 1
                            ? selectedCoinsData[0]
                            : selectedCoinsData,
                          null,
                          2
                        )}
                        onChange={() => {}}
                        disabled={true}
                        height="100%"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-text-muted text-center px-4">
                      Select coins to view their configuration
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex h-[60vh]">
            {/* Left panel - Coin list */}
            <div className="w-1/3 border-r border-border-primary">
              <div className="p-4">
                <Field>
                  <Input
                    id="electrum-coin-search"
                    name="electrum-coin-search"
                    type="text"
                    placeholder="Search coins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg bg-primary-bg-900/50 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </Field>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {filteredCoins.length} of {electrumCoins.length} coins
                    </span>
                    {selectedCoins.size > 0 && (
                      <span className="text-xs font-medium text-accent">
                        {selectedCoins.size} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 border-t border-border-primary pt-2">
                    <button
                      onClick={toggleSelectAll}
                      className="flex-1 rounded-md bg-primary-bg-900/50 px-2 py-1 text-xs font-medium text-text-primary hover:bg-accent/20 hover:text-accent transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
                      disabled={filteredCoins.length === 0}
                    >
                      {filteredCoins.length > 0 &&
                      filteredCoins.every((coin) =>
                        selectedCoins.has(coin.coin)
                      )
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                    {selectedCoins.size > 0 && (
                      <button
                        onClick={clearSelection}
                        className="flex-1 rounded-md bg-primary-bg-900/50 px-2 py-1 text-xs font-medium text-text-primary hover:bg-danger/20 hover:text-danger transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-danger/50 active:scale-[0.98]"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                  <div
                    onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                    className="flex items-center gap-2 rounded-md bg-primary-bg-900/30 px-3 py-2 cursor-pointer hover:bg-primary-bg-900/50 transition-colors"
                  >
                    <Checkbox
                      id="show-selected-only"
                      name="show-selected-only"
                      checked={showSelectedOnly}
                      onChange={setShowSelectedOnly}
                      className="group size-3.5 rounded border border-border-primary bg-primary-bg-900 data-[checked]:bg-accent data-[checked]:border-accent focus:ring-1 focus:ring-accent/50 focus:ring-offset-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="hidden size-3.5 fill-white group-data-[checked]:block"
                        viewBox="0 0 14 14"
                      >
                        <path
                          d="M11.5 4.5L6 10L2.5 6.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </Checkbox>
                    <span className="text-xs text-text-secondary select-none">
                      Show selected only
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-8rem)] overflow-y-auto">
                {isLoading && electrumCoins.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="animate-spin h-8 w-8 text-accent"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm text-text-muted">
                        Loading coins...
                      </span>
                    </div>
                  </div>
                ) : (
                  filteredCoins.map((coin) => {
                    if (!coin) return null;
                    return (
                      <CoinItem
                        key={coin.coin}
                        coin={coin}
                        isSelected={selectedCoins.has(coin.coin)}
                        onToggle={toggleCoinSelection}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Right panel - Selected coins data */}
            <div className="flex-1 p-4">
              {selectedCoinsData.length > 0 ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-text-primary">
                      {selectedCoinsData.length === 1
                        ? `${selectedCoinsData[0].coin} Configuration`
                        : `${selectedCoinsData.length} Coins Configuration`}
                    </h3>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 rounded-lg bg-primary-bg-800 px-3 py-1.5 text-sm text-text-primary hover:bg-primary-bg-700 hover:text-accent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-success">Copied!</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-lg bg-primary-bg-900/50">
                    <JsonMonacoEditor
                      value={JSON.stringify(
                        selectedCoinsData.length === 1
                          ? selectedCoinsData[0]
                          : selectedCoinsData,
                        null,
                        2
                      )}
                      onChange={() => {}}
                      disabled={true}
                      height="100%"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-text-muted">
                    Select coins to view their configuration
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
