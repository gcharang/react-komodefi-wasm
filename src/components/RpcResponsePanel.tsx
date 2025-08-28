import React, { useEffect, useState } from "react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import { CheckCircle, ClipboardCheck, Download, Ban } from "lucide-react";
import { useRpcResponseState } from "../store/useStore";
import { downloadFile } from "../shared-functions/downloadFile";
import Tooltip from "./Tooltip";

const RpcResponsePanel = () => {
  const { rpcResponseState, setRpcResponseState } = useRpcResponseState();
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
        <div className="flex gap-2 items-center">
          <Tooltip label="Clear Panel" dir="bottom">
            <button
              onClick={() => setRpcResponseState({ requestResponse: "" })}
              className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
            >
              <Ban className="w-5 h-5 text-text-muted hover:text-danger" />
            </button>
          </Tooltip>
          {!copied ? (
            <Tooltip label="Copy Response" dir="bottom">
              <button
                onClick={() => copyToClipboard()}
                className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
              >
                <ClipboardCheck className="w-5 h-5 text-text-muted hover:text-accent" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip label="Copied!" dir="bottom">
              <button
                className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <CheckCircle className="w-5 h-5 text-success animate-fadeIn" />
              </button>
            </Tooltip>
          )}
          <Tooltip label="Download Response" dir="bottom">
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
              className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
            >
              <Download className="w-5 h-5 text-text-muted hover:text-accent" />
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
