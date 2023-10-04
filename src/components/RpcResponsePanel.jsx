import React, { useState } from "react";

import { CheckCircle, Clipboard } from "./IconComponents";
import { useRpcPanelState } from "../store/rpc";

const RpcResponsePanel = () => {
  const { rpcPanelState } = useRpcPanelState();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(rpcPanelState.requestResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      // you know what to do
    }
  };

  return (
    <div className="w-1/2 grid grid-flow-row">
      <div className="w-full p-2 flex-[0_0_auto] bg-primaryLight text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex gap-3 items-center">
          {!copied && (
            <Clipboard
              onClick={() => copyToClipboard()}
              role="button"
              className="w-6 h-6 cursor-pointer hover:text-white"
              title="Copy Logs"
            />
          )}
          {copied && (
            <CheckCircle
              onClick={() => copyToClipboard()}
              role="image"
              className="w-6 h-6 Check hover:text-green-600"
            />
          )}
        </div>
      </div>
      <div className="overflow-hidden overflow-y-auto">
        <p className="p-2 whitespace-pre-wrap">
          {rpcPanelState.requestResponse}
        </p>
      </div>
    </div>
  );
};

export default RpcResponsePanel;
