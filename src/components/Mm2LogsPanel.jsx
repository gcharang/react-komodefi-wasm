import React, { useEffect, useRef, useState } from "react";
import { debounce } from "../shared-functions/debounce";
import { useMm2LogsPanelState } from "../store/mm2Logs";
import {
  CheckCircle,
  Clipboard,
  DoubleDown,
  DownloadIcon,
  NoSymbol,
} from "./IconComponents";
import Tooltip from "./Tooltip";
import DownloadFile from "./downloadFile";

const Mm2LogsPanel = ({ windowSizes, setWindowSizes }) => {
  const { mm2LogsPanelState, setMm2LogsPanelState } = useMm2LogsPanelState();
  const [copied, setCopied] = useState(false);
  const [isInlineCopied, setIsInlineCopied] = useState({ id: "" });
  const [shouldAlwaysScrollToBottom, setShouldAlwaysScrollToBottom] =
    useState(true);
  let mm2Ref = useRef(null);

  const copyToClipboard = (data) => {
    try {
      navigator.clipboard.writeText(data);
    } catch (error) {
      // you know what to do
    }
  };

  useEffect(() => {
    if (!shouldAlwaysScrollToBottom) {
      mm2Ref.scrollBy(0, -mm2Ref.scrollHeight);
    }
    if (shouldAlwaysScrollToBottom && mm2Ref) {
      mm2Ref.scrollBy(0, mm2Ref.scrollHeight);
    }
  }, [shouldAlwaysScrollToBottom, mm2LogsPanelState.outputMessages, mm2Ref]);

  useEffect(() => {
    if (mm2Ref)
      mm2Ref.addEventListener(
        "mouseenter",
        debounce(() => {
          setShouldAlwaysScrollToBottom((currentValue) => false);
        }, 300)
      );
  }, [mm2Ref]);

  const classes = [
    "text-blue-300",
    "text-violet-300",
    "text-red-300",
    "text-yellow-300",
    "text-neutral-300",
  ];
  return (
    <div
      className={`${
        windowSizes ? "w-1/2" : "w-full"
      } grid grid-flow-row border-r border-r-gray-700`}
    >
      <div className="w-full p-2 flex-[0_0_auto] bg-primaryLight text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Tooltip
              label={
                windowSizes.bottomBar <= 40 ? "Expand panel" : "Collapse Panel"
              }
            >
              <DoubleDown
                role="button"
                onClick={() => {
                  setWindowSizes({
                    ...windowSizes,
                    bottomBar: windowSizes.bottomBar <= 40 ? 220 : 40,
                  });
                }}
                className={`w-6 h-6 cursor-pointer hover:text-white transition ${
                  windowSizes.bottomBar <= 40 ? "rotate-180" : ""
                }`}
              />
            </Tooltip>
            <Tooltip label={"Clear console"}>
              <NoSymbol
                onClick={() => {
                  setMm2LogsPanelState((currentValues) => {
                    return {
                      ...currentValues,
                      outputMessages: [],
                    };
                  });
                }}
                role="button"
                className="w-6 h-6 cursor-pointer hover:text-white"
                title="Clear Logs"
              />
            </Tooltip>
            {!copied && (
              <Tooltip label={"Copy Logs"}>
                <Clipboard
                  onClick={() => {
                    copyToClipboard(
                      mm2LogsPanelState.outputMessages
                        .map((log) => log[0])
                        .join("\n")
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                  }}
                  role="button"
                  className="w-6 h-6 cursor-pointer hover:text-white"
                  title="Copy Logs"
                />
              </Tooltip>
            )}
            {copied && (
              <Tooltip label={"Copied!"}>
                <CheckCircle
                  onClick={() => {
                    copyToClipboard(
                      mm2LogsPanelState.outputMessages
                        .map((log) => log[0])
                        .join("\n")
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                  }}
                  role="image"
                  className="w-6 h-6 text-green-600"
                />
              </Tooltip>
            )}
            {mm2LogsPanelState.outputMessages.length > 1 && (
              <DownloadIcon
                onClick={() =>
                  DownloadFile(
                    mm2LogsPanelState.outputMessages
                      .map((messages) => messages[0])
                      .join("\n\n"),
                    "application/text",
                    "kdf-logs.txt"
                  )
                }
                role="button"
                title="download logs"
                className="w-6 h-6 cursor-pointer hover:text-white"
              />
            )}
          </div>
          <div>
            <div className="flex gap-3 items-center">
              <label htmlFor="scrollInput" className="flex gap-1 items-center">
                <span>Scroll to bottom</span>
                <input
                  checked={shouldAlwaysScrollToBottom}
                  onChange={(e) => {
                    setShouldAlwaysScrollToBottom(!shouldAlwaysScrollToBottom);
                  }}
                  className="rounded-sm bg-gray-700"
                  id="scrollInput"
                  type="checkbox"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={(mm2LogsRef) => {
          mm2Ref = mm2LogsRef;
        }}
        className={`p-2 overflow-hidden overflow-y-auto break-words ${
          windowSizes?.bottomBar <= 40 && "hidden"
        }`}
      >
        {mm2LogsPanelState.outputMessages.map((message, index) => {
          return (
            <p
              onClick={() => {
                copyToClipboard(message[0]);
                setIsInlineCopied({ id: index });
                setTimeout(() => {
                  setIsInlineCopied({ id: "" });
                }, 1000);
              }}
              key={index}
              className={`whitespace-pre-wrap text-${message[1]}-300 ${
                isInlineCopied.id === index &&
                "text-green-600 hover:text-green-600"
              } flex group hover:text-white hover:cursor-pointer text-base font-bold border-slate-700 border-b`}
            >
              {message[0]}
              <span className="ml-1">
                {isInlineCopied.id !== index && (
                  <Clipboard
                    role="image"
                    alt="copy to clipboard icon"
                    className="opacity-0 transition group-hover:opacity-100 w-6 h-6"
                    title="Copy Logs"
                  />
                )}
                {isInlineCopied.id === index && (
                  <CheckCircle
                    role="image"
                    alt="copied to clipboard icon"
                    className="opacity-0 transition group-hover:opacity-100 w-6 h-6 text-green-600"
                  />
                )}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Mm2LogsPanel;
