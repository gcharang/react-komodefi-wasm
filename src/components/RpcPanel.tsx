import { nanoid } from "nanoid";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchRpcMethods,
  getRawValues,
} from "../shared-functions/fetchRpcMethods";
import { rpc_request } from "../shared-functions/rpcRequest";
import { updateUserPass } from "../shared-functions/updateUserPassword";
import useIsValidSchema from "../shared-functions/useIsValidSchema";
import { useGenericModal, useRpcMethods, useMm2PanelState, useVisibilityState, useRpcPanelState, useRpcResponseState } from "../store/useStore";
import { ModalIds } from "../store/modalIds";
import { Send, SettingsIcon } from "./IconComponents";
import { SettingsDialog } from "./SettingsDialog";
import Tooltip from "./Tooltip";

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
  const [isValidSchema, _, checkIfSchemaValid] = useIsValidSchema(
    rpcPanelState.config
  );
  const generateRpcMethods = async (collectionUrl?: string) => {
    const methods = await fetchRpcMethods(collectionUrl);
    let result = getRawValues(methods.item);
    if (result) {
      setMethods(result);
      return result;
    }
  };
  useEffect(() => {
    generateRpcMethods();
  }, []);

  const loadMethodFromUrl = ({ method, methodName }: { method: string; methodName: string }) => {
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

  const sendRpcRequest = async () => {
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
  };

  const grabMM2RpcPassword = () => {
    try {
      return JSON.parse(mm2PanelState.mm2Config).rpc_password;
    } catch (error) {
      console.error(
        "An error occurred while trying to parse MM2 config",
        error
      );
      return undefined;
    }
  };

  const syncPanelPasswords = (rpcRequestConfig?: string) => {
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
  };

  useEffect(() => {
    !mm2PanelState.dataHasErrors &&
      !rpcPanelState.dataHasErrors &&
      syncPanelPasswords();
  }, [mm2PanelState.mm2Config]);

  const ListBox = () => {
    const [activeMenuItem, setActiveMenuItem] = useState<string>("");

    const MenuItem = ({ label, children }: { label: string; children: React.ReactNode }) => {
      const toggleSubMenu = (menuLabel: string) => {
        setActiveMenuItem(activeMenuItem === menuLabel ? "" : menuLabel);
      };

      return (
        <li
          role="menuitem"
          className="relative px-4 py-2 text-sm cursor-pointer leading-5 text-left hover:bg-slate-900 border-b border-b-gray-600 last:border-none"
        >
          <button
            onClick={() => toggleSubMenu(label)}
            className="block w-full text-left"
          >
            {label}
            {children && (
              <span className="absolute top-0 right-0 mt-2 mr-4">
                <svg
                  className={`w-5 h-5 ml-2 -mr-1 transition-all duration-200 ${
                    activeMenuItem === label ? "rotate-180" : "rotate-0"
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
          {activeMenuItem === label && children && (
            <ul role="menu" className="">
              {children}
            </ul>
          )}
        </li>
      );
    };

    return (
      <div className="relative inline-block text-left dropdown group">
        <span className="rounded-md shadow-xs">
          <button
            className="inline-flex justify-center w-full border border-gray-600 rounded-full text-sm p-[2px] px-2 hover:bg-[#182347] disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 ease-in-out  hover:text-gray-500 focus:outline-hidden"
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
            className="absolute z-10 max-h-160 right-0 min-w-[20rem] w-fit mt-2 origin-top-right bg-primary-lighter divide-y rounded-md shadow-lg outline-hidden"
            aria-labelledby="RPC methods dropdown menu"
            id=""
          >
            <ul
              role="menu"
              id="mm2-methods"
              className="py-1 flex flex-col h-160 overflow-hidden overflow-y-auto"
            >
              {methods &&
                Object.keys(methods).map((methodList) => {
                  return (
                    <MenuItem key={nanoid(24)} label={methodList}>
                      {methods[methodList].map((methodJson: any) => {
                        return (
                          <li role="menuitem" key={nanoid(24)}>
                            <button
                              tabIndex={0}
                              key={nanoid(24)}
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
                              className="px-4 flex justify-between gap-2 items-center hover:bg-primary-lighter w-full py-2 text-sm cursor-pointer leading-5 text-left"
                            >
                              <span>{methodJson?.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </MenuItem>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const panel = useMemo(() => {
    return (
      <div className="h-full flex flex-col">
        <div className="w-full p-2 bg-primary-light text-[#a2a3bd] h-10 border-b border-b-gray-800">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  sendRpcRequest();
                }}
                disabled={!mm2PanelState.mm2Running}
                className={`flex items-center gap-1 border border-gray-600 rounded-full text-sm p-[2px] px-2 hover:bg-[#182347] disabled:text-gray-600 disabled:cursor-not-allowed ${
                  mm2PanelState.mm2Running
                    ? "bg-blue-900 text-white"
                    : "bg-transparent"
                }`}
              >
                <span>Send</span>{" "}
                <Send
                  role="image"
                  className={`w-5 h-5 cursor-pointer`}
                />
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
              <ListBox />
            </div>
          </div>
        </div>
        <textarea
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
              ? "focus:ring-blue-700"
              : "focus:ring-red-700 focus:ring-2"
          } p-3 mr-1 h-full resize-none border-none outline-hidden bg-transparent text-gray-400 disabled:opacity-50`}
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
      {panel}
    </>
  );
};

export default RpcPanel;
