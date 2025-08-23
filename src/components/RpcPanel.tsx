import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import {
  fetchRpcMethods,
  getRawValues,
} from "../shared-functions/fetchRpcMethods";
import { rpc_request } from "../shared-functions/rpcRequest";
import { updateUserPass } from "../shared-functions/updateUserPassword";
import useIsValidSchema from "../shared-functions/useIsValidSchema";
import {
  useGenericModal,
  useRpcMethods,
  useMm2PanelState,
  useVisibilityState,
  useRpcPanelState,
  useRpcResponseState,
} from "../store/useStore";
import { ModalIds } from "../store/modalIds";
import { Send, SettingsIcon } from "./IconComponents";
import { SettingsDialog } from "./SettingsDialog";
import { ElectrumCoinsModal } from "./ElectrumCoinsModal";
import Tooltip from "./Tooltip";

// MenuItem component - defined outside to avoid hooks issues
interface MenuItemProps {
  label: string;
  children: React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, children, isActive, onToggle }) => {
  return (
    <li
      role="menuitem"
      className="relative text-sm leading-5 text-left border-b border-border-primary last:border-none"
    >
      <button
        onClick={onToggle}
        className="block w-full text-left px-4 py-2 cursor-pointer hover:bg-primary-bg-800 hover:text-accent transition-colors duration-200 font-bold"
      >
        {label}
        {children && (
          <span className="absolute top-0 right-0 mt-2 mr-4">
            <svg
              className={`w-5 h-5 ml-2 -mr-1 transition-all duration-200 ${
                isActive ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        )}
      </button>
      {isActive && children && (
        <ul role="menu" className="">
          {children}
        </ul>
      )}
    </li>
  );
};

// ListBox component - defined outside to avoid hooks issues
interface ListBoxProps {
  methods: any;
  router: any;
}

const ListBox: React.FC<ListBoxProps> = memo(({ methods, router }) => {
  const [activeMenuItem, setActiveMenuItem] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [debouncedFilter, setDebouncedFilter] = useState<string>("");

  // Debounce filter text for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterText);
    }, 200);
    return () => clearTimeout(timer);
  }, [filterText]);

  // Filter methods based on debounced search text
  const filteredMethods = useMemo(() => {
    if (!methods || !debouncedFilter) return methods;
    
    const filtered: Record<string, any[]> = {};
    const searchLower = debouncedFilter.toLowerCase();
    
    Object.keys(methods).forEach((methodList) => {
      // Check if category name matches
      const categoryMatches = methodList.toLowerCase().includes(searchLower);
      
      // Filter methods within the category
      const filteredMethodsInCategory = methods[methodList].filter(
        (methodJson: any) => 
          methodJson?.name?.toLowerCase().includes(searchLower)
      );
      
      // Include category if it matches or has matching methods
      if (categoryMatches || filteredMethodsInCategory.length > 0) {
        filtered[methodList] = categoryMatches 
          ? methods[methodList] 
          : filteredMethodsInCategory;
      }
    });
    
    return Object.keys(filtered).length > 0 ? filtered : null;
  }, [methods, debouncedFilter]);

  return (
    <div className="relative inline-block text-left dropdown group z-50">
      <span className="rounded-md shadow-xs">
        <button
          className="inline-flex justify-center w-full rounded-lg text-sm py-1 px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none cursor-pointer"
          type="button"
          aria-haspopup="true"
          aria-expanded="true"
          aria-controls="mm2-methods"
        >
          <span>Methods</span>
          <svg
            className="w-5 h-5 ml-2 -mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </span>
      <div className="group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible opacity-0 invisible dropdown-menu transition-all duration-300 transform origin-top-right -translate-y-2 scale-95">
        <div
          className="absolute z-50 max-h-[60vh] -right-2 min-w-[20rem] w-fit mt-2 origin-top-right bg-primary-bg-800/95 backdrop-blur-xl divide-y rounded-lg shadow-2xl ring-1 ring-accent/20 outline-none"
          aria-labelledby="RPC methods dropdown menu"
          id=""
        >
          {/* Search/Filter Input */}
          <div className="p-2 border-b border-border-primary">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter methods..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full px-3 py-1.5 pr-8 text-sm bg-primary-bg-900/50 text-text-primary rounded-md border border-border-primary focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder-text-muted"
                onClick={(e) => e.stopPropagation()}
              />
              {filterText && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterText("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Clear filter"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <ul
            role="menu"
            id="mm2-methods"
            className="py-1 flex flex-col max-h-[calc(60vh-3.5rem)] overflow-hidden overflow-y-auto"
          >
            {filteredMethods ? (
              Object.keys(filteredMethods).map((methodList, categoryIndex) => {
                return (
                  <MenuItem 
                    key={`category-${categoryIndex}-${methodList}`} 
                    label={methodList}
                    isActive={activeMenuItem === methodList}
                    onToggle={() => setActiveMenuItem(activeMenuItem === methodList ? "" : methodList)}
                  >
                    {filteredMethods[methodList].map((methodJson: any, methodIndex: number) => {
                      return (
                        <li role="menuitem" key={`method-${categoryIndex}-${methodIndex}-${methodJson?.name}`}>
                          <button
                            tabIndex={0}
                            onClick={() => {
                              router.push(
                                `?method=${methodList}&methodName=${encodeURIComponent(
                                  methodJson?.name
                                )}`,
                                {
                                  scroll: false,
                                }
                              );
                            }}
                            className="px-4 flex justify-between gap-2 items-center hover:bg-primary-bg-700 hover:text-accent w-full py-2 text-sm cursor-pointer leading-5 text-left transition-colors duration-200"
                          >
                            <span>{methodJson?.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </MenuItem>
                );
              })
            ) : (
              <li className="px-4 py-3 text-sm text-text-muted text-center">
                {debouncedFilter ? "No methods found" : "Loading methods..."}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});

ListBox.displayName = 'ListBox';

const RpcPanel = () => {
  const { mm2PanelState } = useMm2PanelState();
  const { rpcPanelState, setRpcPanelState } = useRpcPanelState();
  const { setRpcResponseState } = useRpcResponseState();
  const { showModal } = useVisibilityState();
  const { genericModalState, setGenericModalState } = useGenericModal();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { methods, setMethods } = useRpcMethods();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isElectrumModalOpen, setIsElectrumModalOpen] = useState(false);
  const [isValidSchema, _, checkIfSchemaValid] = useIsValidSchema(
    rpcPanelState.config
  );
  const generateRpcMethods = useCallback(async (collectionUrl?: string) => {
    const methods = await fetchRpcMethods(collectionUrl);
    let result = getRawValues(methods.item);
    if (result) {
      setMethods(result);
      return result;
    }
  }, [setMethods]);
  useEffect(() => {
    generateRpcMethods();
  }, []);

  const loadMethodFromUrl = ({
    method,
    methodName,
  }: {
    method: string;
    methodName: string;
  }) => {
    if (!method || !methodName) return;
    if (
      (method && !methods[method]) ||
      (methodName &&
        !methods[method].find((value: any) => value?.name === methodName))
    ) {
      setGenericModalState({
        ...genericModalState,
        titleComponent: (
          <span className="text-lg font-medium leading-6 text-red-500">
            Error
          </span>
        ),
        messageComponent:
          "This method doesn't exist. Pick a method from the dropdown in the navbar or copy/paste the method data in the input-box to the right side",
      });
      showModal(ModalIds.genericModal);
      return;
    }
    const requiredValue = methods[method].find(
      (value: any) => value?.name === methodName
    );
    if (requiredValue) {
      const prettifiedJSON = JSON.stringify(requiredValue, null, 2);
      syncPanelPasswords(prettifiedJSON);
    }
  };
  useEffect(() => {
    const method = searchParams.get("method");
    const methodName = searchParams.get("methodName");
    if (methods && method && methodName) {
      loadMethodFromUrl({ method, methodName });
    }
  }, [searchParams, methods]);

  const sendRpcRequest = useCallback(async () => {
    let request_js;
    try {
      request_js = JSON.parse(rpcPanelState.config);
    } catch (e) {
      alert(
        `Expected request in JSON, found '${rpcPanelState.config}'\nError : ${e}`
      );
      return;
    }

    let response = await rpc_request(request_js);
    setRpcResponseState({
      requestResponse: JSON.stringify(response, null, 2),
    });
  }, [rpcPanelState.config, setRpcResponseState]);

  const grabMM2RpcPassword = useCallback(() => {
    try {
      return JSON.parse(mm2PanelState.mm2Config).rpc_password;
    } catch (error) {
      console.error(
        "An error occurred while trying to parse MM2 config",
        error
      );
      return undefined;
    }
  }, [mm2PanelState.mm2Config]);

  const syncPanelPasswords = useCallback((rpcRequestConfig?: string) => {
    const rpcPassword = grabMM2RpcPassword();
    if (rpcPassword) {
      const updatedUserPassword = updateUserPass(
        rpcRequestConfig
          ? JSON.parse(rpcRequestConfig)
          : JSON.parse(rpcPanelState.config),
        rpcPassword
      );
      if (updatedUserPassword)
        setRpcPanelState({
          config: JSON.stringify(updatedUserPassword, null, 2),
        });
    }
  }, [grabMM2RpcPassword, rpcPanelState.config, setRpcPanelState]);

  useEffect(() => {
    !mm2PanelState.dataHasErrors &&
      !rpcPanelState.dataHasErrors &&
      syncPanelPasswords();
  }, [mm2PanelState.mm2Config]);

  const panel = useMemo(() => {
    return (
      <div className="h-full flex flex-col bg-primary-bg-800/95 backdrop-blur-xl rounded-lg shadow-2xl ring-1 ring-accent/20 relative z-30">
        <div className="relative flex justify-between w-full p-2 bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary rounded-t-lg">
          <div className="relative flex justify-between w-full">
            <div className="flex gap-3">
              <button
                onClick={sendRpcRequest}
                disabled={!mm2PanelState.mm2Running}
                className={`flex items-center gap-1 rounded-lg text-sm py-1 px-3 transition-all duration-200 ${
                  mm2PanelState.mm2Running
                    ? "bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent cursor-pointer"
                    : "bg-primary-bg-700/50 text-text-muted cursor-not-allowed"
                }`}
              >
                <span>Send</span> <Send role="image" className={`w-5 h-5`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip label={"Open Settings"} dir="bottom">
                <SettingsIcon
                  aria-label="open settings dialog"
                  onClick={() => setIsDialogOpen(true)}
                  role="button"
                  className="w-5 h-5 cursor-pointer"
                />
              </Tooltip>
              <Tooltip label={"Select Electrum Coins"} dir="bottom">
                <button
                  onClick={() => setIsElectrumModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg text-sm py-1 px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Electrum</span>
                </button>
              </Tooltip>
              <ListBox methods={methods} router={router} />
            </div>
          </div>
        </div>
        <textarea
          id="rpc-config"
          name="rpcConfig"
          onChange={(e) => {
            let value = e.target.value;
            if (checkIfSchemaValid(value)) {
              setRpcPanelState({
                config: value,
                dataHasErrors: false,
              });
              // syncPanelPasswords(value);
            } else {
              setRpcPanelState({
                config: value,
                dataHasErrors: true,
              });
            }
          }}
          className={`${
            !rpcPanelState.dataHasErrors
              ? "focus:ring-2 focus:ring-accent/50 focus:ring-inset"
              : "ring-2 ring-danger/50 ring-inset"
          } p-3 h-full resize-none border-none outline-none bg-primary-bg-900/50 text-text-primary font-mono text-sm disabled:opacity-50 transition-all duration-200`}
          value={rpcPanelState.config}
        ></textarea>
      </div>
    );
  }, [
    mm2PanelState.mm2Running,
    methods,
    rpcPanelState,
    setRpcPanelState,
    mm2PanelState.mm2Config,
    isValidSchema,
  ]);

  return (
    <>
      <SettingsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        generateRpcMethods={generateRpcMethods}
      />
      <ElectrumCoinsModal
        isOpen={isElectrumModalOpen}
        onClose={() => setIsElectrumModalOpen(false)}
      />
      {panel}
    </>
  );
};

export default RpcPanel;
