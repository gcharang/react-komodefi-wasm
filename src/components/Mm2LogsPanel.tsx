import React, { useEffect, useState, useRef } from "react";
import { NoSymbol, DoubleDown, Clipboard, CheckCircle } from "./IconComponents";
import { debounce } from "../shared-functions/debounce";
import { useMm2LogsPanelState } from "../store/useStore";
import Tooltip from "./Tooltip";

interface Mm2LogsPanelProps {
  windowSizes: {
    sidebar: number;
    bottomBar: number;
    leftPane: number | null;
    rightPane: number | null;
  };
  setWindowSizes: React.Dispatch<React.SetStateAction<{
    sidebar: number;
    bottomBar: number;
    leftPane: number | null;
    rightPane: number | null;
  }>>;
}

const Mm2LogsPanel = ({ windowSizes, setWindowSizes }: Mm2LogsPanelProps) => {
  const { mm2LogsPanelState, setMm2LogsPanelState } = useMm2LogsPanelState();
  const [copied, setCopied] = useState(false);
  const [isInlineCopied, setIsInlineCopied] = useState({ id: "" });
  const [shouldAlwaysScrollToBottom, setShouldAlwaysScrollToBottom] =
    useState(true);
  let mm2Ref = useRef<HTMLDivElement | null>(null);

  const copyToClipboard = (data: string) => {
    try {
      navigator.clipboard.writeText(data);
    } catch (error) {
      // you know what to do
    }
  };

  useEffect(() => {
    if (shouldAlwaysScrollToBottom && mm2Ref.current) {
      mm2Ref.current.scrollBy(0, mm2Ref.current.scrollHeight);
    }
  }, [shouldAlwaysScrollToBottom, mm2LogsPanelState.outputMessages, mm2Ref]);

  useEffect(() => {
    if (mm2Ref.current) {
      const debouncedHandler = debounce(() => {
        setShouldAlwaysScrollToBottom(false);
      }, 300);
      
      mm2Ref.current.addEventListener("mouseenter", debouncedHandler);
      
      return () => {
        mm2Ref.current?.removeEventListener("mouseenter", debouncedHandler);
      };
    }
  }, [mm2Ref]);

  const classes = [
    "text-blue-300",
    "text-violet-300",
    "text-red-300",
    "text-yellow-300",
    "text-neutral-300",
  ];
  return (
    <div className="w-1/2 grid grid-flow-row border-r border-r-gray-700">
      <div className="w-full p-2 flex-[0_0_auto] bg-primary-light text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Tooltip
              label={
                windowSizes.bottomBar <= 40 ? "Expand panel" : "Collapse Panel"
              }
            >
              <DoubleDown
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
                  setMm2LogsPanelState({
                    outputMessages: [],
                  });
                }}
                role="button"
                className="w-6 h-6 cursor-pointer hover:text-white"
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
                  className="rounded-xs bg-gray-700"
                  id="scrollInput"
                  type="checkbox"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={mm2Ref}
        className={`p-2 overflow-hidden overflow-y-auto break-words ${
          windowSizes.bottomBar <= 40 && "hidden"
        }`}
      >
        {mm2LogsPanelState.outputMessages.map((message, index) => {
          return (
            <p
              onClick={() => {
                copyToClipboard(message[0]);
                setIsInlineCopied({ id: String(index) });
                setTimeout(() => {
                  setIsInlineCopied({ id: "" });
                }, 1000);
              }}
              key={index}
              className={`whitespace-pre-wrap ${message[1] === 'blue' ? 'text-blue-300' : message[1] === 'violet' ? 'text-violet-300' : message[1] === 'red' ? 'text-red-300' : message[1] === 'yellow' ? 'text-yellow-300' : 'text-neutral-300'} ${
                isInlineCopied.id === String(index) &&
                "text-green-600 hover:text-green-600"
              } flex group hover:text-white hover:cursor-pointer text-base font-bold border-slate-700 border-b`}
            >
              {message[0]}
              <span className="ml-1">
                {isInlineCopied.id !== String(index) && (
                  <Clipboard
                    role="image"
                    className="opacity-0 transition group-hover:opacity-100 w-6 h-6"
                  />
                )}
                {isInlineCopied.id === String(index) && (
                  <CheckCircle
                    role="image"
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
