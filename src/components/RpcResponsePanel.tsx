import React, { useEffect, useState } from "react";
import { highlightJSON, renderHighlightedJSON } from "./jsonHighlighter";

import { CheckCircle, Clipboard } from "./IconComponents";
import { useRpcResponseState } from "../store/useStore";
import Tooltip from "./Tooltip";

const RpcResponsePanel = () => {
  const { rpcResponseState } = useRpcResponseState();
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    if (!rpcResponseState.requestResponse) return;
    const highlightedJSON = highlightJSON(rpcResponseState.requestResponse);
    const highlightedHTML = renderHighlightedJSON(highlightedJSON);
    setHighlightedCode(highlightedHTML);
  }, [rpcResponseState.requestResponse]);

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
    <div className="h-full grid grid-flow-row">
      <div className="w-full p-2 flex-[0_0_auto] bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary">
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
        </div>
      </div>
      <div className="overflow-hidden overflow-y-auto">
        <pre className="text-sm text-text-primary whitespace-pre-wrap p-3 min-h-full bg-primary-bg-900/50 font-mono">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
};

export default RpcResponsePanel;
