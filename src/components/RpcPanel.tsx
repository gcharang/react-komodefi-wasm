import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { Menu, MenuButton, MenuItems, Field, Input } from "@headlessui/react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import type { MenuItemProps } from "../types/components";
import type { MethodCollection, RpcMethod } from "../types/api";
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
  useToastState,
} from "../store/useStore";
import { ModalIds } from "../store/modalIds";
import { Send, SettingsIcon } from "./IconComponents";
import { SettingsDialog } from "./SettingsDialog";
import { ElectrumCoinsModal } from "./ElectrumCoinsModal";
import Tooltip from "./Tooltip";
import type { RpcPanelProps, ListBoxProps } from "../types/components";

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  children,
  isActive,
  onToggle,
}) => {
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

    const filtered: MethodCollection = {};
    const searchLower = debouncedFilter.toLowerCase();

    Object.keys(methods).forEach((methodList) => {
      // Check if category name matches
      const categoryMatches = methodList.toLowerCase().includes(searchLower);

      // Filter methods within the category
      const filteredMethodsInCategory = methods[methodList].filter(
        (methodJson: RpcMethod) =>
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
    <Menu as="div" className="relative inline-block text-left z-50 ">
      <MenuButton className="inline-flex justify-center w-full rounded-lg text-xs md:text-sm py-1 px-2 md:px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none cursor-pointer">
        <span>Methods</span>
        <svg
          className="w-4 md:w-5 h-4 md:h-5 ml-2 -mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-50 max-h-[60vh] min-w-[20rem] w-fit mt-2 origin-top-right bg-primary-bg-800/95 backdrop-blur-xl divide-y rounded-lg shadow-2xl ring-1 ring-accent/20 outline-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {/* Search/Filter Input */}
        <div className="p-2 border-b border-border-primary">
          <Field className="relative">
            <Input
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </Field>
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
                  onToggle={() =>
                    setActiveMenuItem(
                      activeMenuItem === methodList ? "" : methodList
                    )
                  }
                >
                  {filteredMethods[methodList].map(
                    (methodJson: RpcMethod, methodIndex: number) => {
                      return (
                        <li
                          role="menuitem"
                          key={`method-${categoryIndex}-${methodIndex}-${methodJson?.name}`}
                        >
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
                    }
                  )}
                </MenuItem>
              );
            })
          ) : (
            <li className="px-4 py-3 text-sm text-text-muted text-center">
              {debouncedFilter ? "No methods found" : "Loading methods..."}
            </li>
          )}
        </ul>
      </MenuItems>
    </Menu>
  );
});

ListBox.displayName = "ListBox";

const RpcPanel: React.FC<RpcPanelProps> = ({
  isMobile = false,
  onSwitchToResponse,
}) => {
  const { mm2PanelState } = useMm2PanelState();
  const { rpcPanelState, setRpcPanelState } = useRpcPanelState();
  const { setRpcResponseState } = useRpcResponseState();
  const { showModal } = useVisibilityState();
  const { genericModalState, setGenericModalState } = useGenericModal();
  const { showToast } = useToastState();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { methods, setMethods } = useRpcMethods();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isElectrumModalOpen, setIsElectrumModalOpen] = useState(false);
  const [isValidSchema, _, checkIfSchemaValid] = useIsValidSchema(
    rpcPanelState.config
  );
  const generateRpcMethods = useCallback(
    async (collectionUrl?: string) => {
      const methods = await fetchRpcMethods(collectionUrl);
      let result = getRawValues(methods.item);
      if (result) {
        setMethods(result);
        return result;
      }
    },
    [setMethods]
  );

  useEffect(() => {
    generateRpcMethods();
  }, []);

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

  // Utility function to prepare method for RPC (remove 'name' key and update password)
  const prepareMethodForRpc = useCallback(
    (methodData: any, password?: string) => {
      // Create a shallow copy and remove the 'name' key
      const { name, ...cleanedMethod } = methodData;

      // Update password if provided
      if (password) {
        return updateUserPass(cleanedMethod, password);
      }
      return cleanedMethod;
    },
    []
  );

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
      // Clean the method and update password in one step
      const rpcPassword = grabMM2RpcPassword();
      const cleanedMethod = prepareMethodForRpc(requiredValue, rpcPassword);

      // Set the cleaned method directly
      setRpcPanelState({
        config: JSON.stringify(cleanedMethod, null, 2),
        dataHasErrors: false,
      });
    }
  };
  useEffect(() => {
    const method = searchParams.get("method");
    const methodName = searchParams.get("methodName");
    if (methods && method && methodName) {
      loadMethodFromUrl({ method, methodName });
    }
  }, [searchParams, methods, grabMM2RpcPassword, prepareMethodForRpc]);

  const sendRpcRequest = useCallback(async () => {
    let request_js;
    try {
      request_js = JSON.parse(rpcPanelState.config);
      // Ensure 'name' key is removed before sending
      if ("name" in request_js) {
        const { name, ...cleanRequest } = request_js;
        request_js = cleanRequest;
      }
    } catch (e) {
      alert(
        `Expected request in JSON, found '${rpcPanelState.config}'\nError : ${e}`
      );
      return;
    }

    let response = await rpc_request(request_js);
    const getMethodNameForResponseDownload = (
      request_json: typeof request_js
    ) => {
      if (Array.isArray(request_json)) {
        // Count occurrences of each method
        const methodCounts = new Map<string, number>();
        request_json.forEach((item) => {
          const method = item.method;
          methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
        });

        // Sort methods alphabetically and build the name
        const sortedMethods = Array.from(methodCounts.keys()).sort();
        const methodParts = sortedMethods.map((method) => {
          const count = methodCounts.get(method)!;
          return count > 1 ? `${method}${count}` : method;
        });

        return methodParts.join('-');
      }
      return request_json.method;
    };
    console.log(getMethodNameForResponseDownload(request_js));
    setRpcResponseState({
      requestResponse: JSON.stringify(response, null, 2),
      requestMethod: getMethodNameForResponseDownload(request_js),
    });

    // Show toast notification
    if (isMobile && onSwitchToResponse) {
      showToast("Request sent successfully!", "success", {
        label: "View Response",
        onClick: onSwitchToResponse,
      });
    } else {
      showToast("Request sent successfully!", "success");
    }
  }, [
    rpcPanelState.config,
    setRpcResponseState,
    isMobile,
    onSwitchToResponse,
    showToast,
  ]);

  // Improved password syncing - only updates when password actually changes
  const syncPanelPasswords = useCallback(() => {
    const rpcPassword = grabMM2RpcPassword();
    if (!rpcPassword || !rpcPanelState.config) return;

    try {
      const currentConfig = JSON.parse(rpcPanelState.config);

      // Only update if password is different
      if (currentConfig.userpass !== rpcPassword) {
        const updatedConfig = updateUserPass(currentConfig, rpcPassword);
        if (updatedConfig) {
          setRpcPanelState({
            config: JSON.stringify(updatedConfig, null, 2),
            dataHasErrors: false,
          });
        }
      }
    } catch (error) {
      // Config is not valid JSON, skip password sync
      console.debug("Skipping password sync for invalid JSON config");
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
        <div className="relative flex justify-between w-full p-1 md:p-2 bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary rounded-t-lg z-30">
          <div className="relative flex flex-row justify-between w-full">
            <div className="flex gap-1 md:gap-3">
              <button
                onClick={sendRpcRequest}
                disabled={
                  !mm2PanelState.mm2Running || rpcPanelState.dataHasErrors
                }
                className={`flex items-center gap-1 rounded-lg text-xs md:text-sm py-1 px-2 md:px-3 transition-all duration-200 ${
                  mm2PanelState.mm2Running && !rpcPanelState.dataHasErrors
                    ? "bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent cursor-pointer"
                    : "bg-primary-bg-700/50 text-text-muted cursor-not-allowed"
                }`}
              >
                <span>Send</span>{" "}
                <Send role="image" className={`w-4 md:w-5 h-4 md:h-5`} />
              </button>
            </div>
            <div className="flex flex-row flex-wrap items-center gap-1 md:gap-3">
              <Tooltip label={"Open Settings"} dir="bottom">
                <SettingsIcon
                  aria-label="open settings dialog"
                  onClick={() => setIsDialogOpen(true)}
                  role="button"
                  className="w-4 md:w-5 h-4 md:h-5 cursor-pointer"
                />
              </Tooltip>
              <Tooltip label={"Select Electrum Coins"} dir="bottom">
                <button
                  onClick={() => setIsElectrumModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg text-xs md:text-sm py-1 px-2 md:px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none cursor-pointer"
                >
                  <svg
                    className="w-3 md:w-4 h-3 md:h-4"
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
        <div
          className={`${
            !rpcPanelState.dataHasErrors
              ? "focus-within:ring-2 focus-within:ring-accent/50"
              : "ring-4 ring-red-500"
          } flex-1 min-h-0 overflow-hidden bg-primary-bg-900/50 transition-all duration-200 relative`}
        >
          <JsonMonacoEditor
            value={rpcPanelState.config}
            onChange={(value) => {
              if (checkIfSchemaValid(value)) {
                setRpcPanelState({
                  config: value,
                  dataHasErrors: false,
                });
                // Password will be synced automatically via useEffect
              } else {
                setRpcPanelState({
                  config: value,
                  dataHasErrors: true,
                });
              }
            }}
          />
        </div>
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
