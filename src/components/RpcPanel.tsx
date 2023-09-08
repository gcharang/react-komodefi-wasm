import React, { useState } from "react";
import { PlayIcon, StopIcon } from "../components/IconComponents";
import { rpc_request } from "../shared-functions/rpcRequest";
import { rpcDefaultConfig } from "../state-machine/staticData";

const RpcPanel = ({ isMm2Running, rpcRequest, setRpcRequest }) => {
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

  return (
    <div className="h-full flex flex-col">
      <div className="w-full p-2 bg-[#11182f] text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex gap-3">
          {isMm2Running && (
            <PlayIcon
              disabled={isMm2Running}
              onClick={() => sendRpcRequest()}
              role="button"
              className="w-6 h-6 cursor-pointer hover:fill-green-500"
              title="Send RPC request"
            />
          )}
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
        className="p-3 w-full h-full resize-none border-none outline-none bg-transparent text-gray-400 disabled:opacity-[50%]"
        value={rpcRequest.config}
      ></textarea>
    </div>
  );
};

export default RpcPanel;
