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
    "text-secondary-400",
    "text-accent",
    "text-danger",
    "text-warning",
    "text-text-primary",
  ];
  return (
    <div className="h-full grid grid-flow-row">
      <div className="w-full p-2 flex-[0_0_auto] bg-primary-bg-900/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Tooltip
              label={
                windowSizes.bottomBar <= 100 ? "Expand panel" : "Collapse Panel"
              }
            >
              <DoubleDown
                onClick={() => {
                  setWindowSizes({
                    ...windowSizes,
                    bottomBar: windowSizes.bottomBar <= 100 ? 280 : 100,
                  });
                }}
                className={`w-6 h-6 cursor-pointer hover:text-accent transition ${
                  windowSizes.bottomBar <= 100 ? "rotate-180" : ""
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
                className="w-6 h-6 cursor-pointer hover:text-accent"
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
                  className="w-6 h-6 cursor-pointer hover:text-accent"
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
                  className="rounded bg-primary-bg-700 accent-accent"
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
        className={`p-3 overflow-hidden overflow-y-auto break-words bg-primary-bg-900/50 h-full ${
          windowSizes.bottomBar <= 100 && "hidden"
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
              className={`whitespace-pre-wrap ${message[1] === 'blue' ? 'text-secondary-400' : message[1] === 'violet' ? 'text-accent' : message[1] === 'red' ? 'text-danger' : message[1] === 'yellow' ? 'text-warning' : 'text-text-primary'} ${
                isInlineCopied.id === String(index) &&
                "text-success hover:text-success"
              } flex group hover:text-accent hover:cursor-pointer text-sm font-medium border-border-primary border-b py-1 transition-colors duration-200`}
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
                    className="opacity-0 transition group-hover:opacity-100 w-6 h-6 text-success"
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
