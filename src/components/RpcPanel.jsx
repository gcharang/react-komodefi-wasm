import { nanoid } from "nanoid";
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchRpcMethods,
  getRawValues,
} from "../shared-functions/fetchRpcMethods";
import { rpc_request } from "../shared-functions/rpcRequest";
import { Send } from "./IconComponents";

const RpcPanel = ({ isMm2Running, rpcRequest, setRpcRequest }) => {
  const [methods, setMethods] = useState([]);

  const generateRpcMethods = async () => {
    const methods = await fetchRpcMethods();
    let result = getRawValues(methods.item);
    if (result) setMethods(result);
  };
  useEffect(() => {
    generateRpcMethods();
  }, []);

  const sendRpcRequest = async () => {
    let request_js;
    try {
      request_js = JSON.parse(rpcRequest.config);
    } catch (e) {
      alert(
        `Expected request in JSON, found '${rpcRequest.config}'\nError : ${e}`
      );
      return;
    }

    let response = await rpc_request(request_js);
    setRpcRequest({
      ...rpcRequest,
      requestResponse: JSON.stringify(response, null, 2),
    });
  };

  const ListBox = () => {
    const MenuItem = ({ label, children }) => {
      const [isOpen, setIsOpen] = useState(false);

      const toggleSubMenu = () => {
        setIsOpen(!isOpen);
      };

      return (
        <li
          role="menuitem"
          className="relative px-4 py-2 text-sm cursor-pointer leading-5 text-left hover:bg-slate-900 border-b border-b-gray-600 last:border-none"
        >
          <button onClick={toggleSubMenu} className="block w-full text-left">
            {label}
            {children && (
              <span className="absolute top-0 right-0 mt-2 mr-4">
                <svg
                  className={`w-5 h-5 ml-2 -mr-1 transition-all ${
                    isOpen && "rotate-180"
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
          {isOpen && children && (
            <ul role="menu" className="">
              {children}
            </ul>
          )}
        </li>
      );
    };

    return (
      <div className="relative inline-block text-left dropdown group">
        <span className="rounded-md shadow-sm">
          <button
            className="inline-flex justify-center w-full border border-gray-600 rounded-full text-sm p-[2px] px-2 hover:bg-[#182347] disabled:text-gray-600 disabled:cursor-not-allowed transition duration-150 ease-in-out  hover:text-gray-500 focus:outline-none"
            type="button"
            aria-haspopup="true"
            aria-expanded="true"
            aria-controls=""
          >
            <span>Options</span>
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
        <div className="group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:visible opacity-0 invisible dropdown-menu transition-all duration-300 transform origin-top-right -translate-y-2 scale-95">
          <div
            className="absolute z-10 max-h-[40rem] right-0 min-w-[20rem] w-fit mt-2 origin-top-right bg-[#131d3b] divide-y rounded-md shadow-lg outline-none"
            aria-labelledby="RPC methods dropdown menu"
            id=""
          >
            <ul
              role="menu"
              className="py-1 flex flex-col h-[40rem] overflow-hidden overflow-y-auto"
            >
              {Object.keys(methods).map((methodList) => {
                return (
                  <MenuItem key={nanoid(24)} label={methodList}>
                    {methods[methodList].map((methodJson) => {
                      return (
                        <li role="menuitem" key={nanoid(24)}>
                          <button
                            tabIndex={0}
                            key={nanoid(24)}
                            onClick={() => {
                              const prettifiedJSON = JSON.stringify(
                                methodJson,
                                null,
                                2
                              );
                              setRpcRequest((currentValues) => {
                                return {
                                  ...currentValues,
                                  config: prettifiedJSON,
                                };
                              });
                            }}
                            className="px-4 flex justify-between gap-2 items-center hover:bg-[#131d3b] w-full py-2 text-sm cursor-pointer leading-5 text-left"
                          >
                            <span>{methodJson.method}</span>
                            <span>
                              {methodJson.coin ?? methodJson?.params?.coin}
                            </span>
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
        <div className="w-full p-2 bg-[#11182f] text-[#a2a3bd] h-10 border-b border-b-gray-800">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => sendRpcRequest()}
                disabled={!isMm2Running}
                className="flex items-center gap-1 border border-gray-600 rounded-full text-sm p-[2px] px-2 hover:bg-[#182347] disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                <span>Send</span>{" "}
                <Send
                  role="image"
                  className={`w-5 h-5 cursor-pointer`}
                  title="Send RPC request"
                />
              </button>
            </div>
            <div className="flex gap-3">
              <ListBox />
            </div>
          </div>
        </div>
        <textarea
          onChange={(e) =>
            setRpcRequest((currentValues) => {
              return {
                ...currentValues,
                config: e.target.value,
              };
            })
          }
          className="p-3 w-full h-full resize-none border-none outline-none bg-transparent text-gray-400 disabled:opacity-[50%] whitespace-pre-wrap"
          value={rpcRequest.config}
        ></textarea>
      </div>
    );
  }, [isMm2Running, methods, rpcRequest, setRpcRequest]);

  return <> {panel}</>;
};

export default RpcPanel;
