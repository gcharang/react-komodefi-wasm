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
    <div className="w-1/2 grid grid-flow-row">
      <div className="w-full p-2 flex-[0_0_auto] bg-primary-light text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex gap-3 items-center">
          {!copied && (
            <Tooltip label={"Copy Response"}>
              <Clipboard
                onClick={() => copyToClipboard()}
                role="button"
                className="w-6 h-6 cursor-pointer hover:text-white"
              />
            </Tooltip>
          )}
          {copied && (
            <Tooltip label={"Copied!"}>
              <CheckCircle
                onClick={() => copyToClipboard()}
                role="image"
                className="w-6 h-6 Check hover:text-green-600"
              />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="overflow-hidden overflow-y-auto">
        <pre className="text-sm text-gray-400 whitespace-pre-wrap p-2">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
};

export default RpcResponsePanel;
