import React, { useEffect, useState } from "react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import { CheckCircle, Clipboard, DownloadIcon } from "./IconComponents";
import { useRpcResponseState } from "../store/useStore";
import { downloadFile } from "../shared-functions/downloadFile";
import Tooltip from "./Tooltip";

const RpcResponsePanel = () => {
  const { rpcResponseState } = useRpcResponseState();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(rpcResponseState.requestResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      // you know what to do
    }
  };

  return (
    <div className="relative h-full grid grid-flow-row">
      <div className="relative w-full p-2 flex-[0_0_auto] bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary z-30">
        <div className="flex gap-3 items-center">
          {!copied && (
            <Tooltip label={"Copy Response"} dir="bottom-right">
              <button
                onClick={() => copyToClipboard()}
                className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
              >
                <Clipboard className="w-6 h-6" />
              </button>
            </Tooltip>
          )}
          {copied && (
            <Tooltip label={"Copied!"} dir="bottom">
              <button
                onClick={() => copyToClipboard()}
                className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
              >
                <CheckCircle className="w-6 h-6 text-success animate-fadeIn" />
              </button>
            </Tooltip>
          )}
          <Tooltip label={"Download Response"} dir="bottom">
            <button
              onClick={() => {
                const timestamp = Date.now();
                const method =
                  rpcResponseState.requestMethod || "unknown_method";
                downloadFile(
                  rpcResponseState.requestResponse,
                  `${method}_response_${timestamp}.json`
                );
              }}
              className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden bg-primary-bg-900/50">
        <JsonMonacoEditor
          value={rpcResponseState.requestResponse || ""}
          onChange={() => {}}
          disabled={true}
        />
      </div>
    </div>
  );
};

export default RpcResponsePanel;
