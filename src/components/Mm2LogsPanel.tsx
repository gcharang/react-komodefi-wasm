import React, { useEffect, useState, useRef } from "react";
import { Switch } from "@headlessui/react";
import type { Mm2LogsPanelProps } from "../types/components";
import {
  Ban,
  ChevronsDown,
  ClipboardCheck,
  CheckCircle,
  Download,
} from "lucide-react";
import { debounce } from "../shared-functions/debounce";
import { downloadFile } from "../shared-functions/downloadFile";
import { useMm2LogsPanelState } from "../store/useStore";
import Tooltip from "./Tooltip";

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
      <div className="w-full p-2 flex-[0_0_auto] bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Tooltip
              label={
                windowSizes.bottomBar <= 100 ? "Expand Panel" : "Collapse Panel"
              }
              dir="bottom-right"
            >
              <button
                onClick={() => {
                  setWindowSizes({
                    ...windowSizes,
                    bottomBar: windowSizes.bottomBar <= 100 ? 280 : 100,
                  });
                }}
                className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer hover:text-accent transition focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
              >
                <ChevronsDown
                  className={`w-5 h-5 ${
                    windowSizes.bottomBar <= 100 ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Tooltip>
            <Tooltip label={"Clear console"} dir="bottom">
              <button
                onClick={() => {
                  setMm2LogsPanelState({
                    outputMessages: [],
                  });
                }}
                className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer hover:text-accent transition focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
              >
                <Ban className="w-5 h-5" />
              </button>
            </Tooltip>
            {!copied && (
              <Tooltip label={"Copy Logs"} dir="bottom">
                <button
                  onClick={() => {
                    copyToClipboard(
                      mm2LogsPanelState.outputMessages
                        .map((log) => log[0])
                        .join("\n")
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                  }}
                  className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer hover:text-accent transition focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                >
                  <ClipboardCheck className="w-5 h-5" />
                </button>
              </Tooltip>
            )}
            {copied && (
              <Tooltip label={"Copied!"} dir="bottom">
                <button
                  onClick={() => {
                    copyToClipboard(
                      mm2LogsPanelState.outputMessages
                        .map((log) => log[0])
                        .join("\n")
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                  }}
                  className="p-0 border-none bg-transparent cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
                >
                  <CheckCircle className="w-5 h-5 text-success" />
                </button>
              </Tooltip>
            )}
            <Tooltip label={"Download Logs"} dir="bottom">
              <button
                onClick={() => {
                  const timestamp = Date.now();
                  const content = mm2LogsPanelState.outputMessages
                    .map((log) => log[0])
                    .join("\n");
                  downloadFile(content, `kdf_logs_wasm_pg_${timestamp}.txt`);
                }}
                className="inline-flex items-center justify-center p-1 border-none bg-transparent cursor-pointer hover:text-accent transition focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
              >
                <Download className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
          <div>
            <div className="flex gap-3 items-center">
              <div className="flex gap-2 items-center">
                <span className="text-sm">Scroll to bottom</span>
                <Switch
                  checked={shouldAlwaysScrollToBottom}
                  onChange={setShouldAlwaysScrollToBottom}
                  className={`${
                    shouldAlwaysScrollToBottom
                      ? "bg-accent"
                      : "bg-primary-bg-700"
                  } relative cursor-pointer inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-primary-bg-800`}
                >
                  <span className="sr-only">Enable scroll to bottom</span>
                  <span
                    className={`${
                      shouldAlwaysScrollToBottom
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                  />
                </Switch>
              </div>
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
              className={`whitespace-pre-wrap ${
                message[1] === "blue"
                  ? "text-secondary-400"
                  : message[1] === "violet"
                  ? "text-accent"
                  : message[1] === "red"
                  ? "text-danger"
                  : message[1] === "yellow"
                  ? "text-warning"
                  : "text-text-primary"
              } ${
                isInlineCopied.id === String(index) &&
                "text-success hover:text-success"
              } flex group hover:text-accent hover:cursor-pointer text-sm font-mono border-border-primary border-b py-1 transition-colors duration-200`}
            >
              {message[0]}
              <span className="ml-1">
                {isInlineCopied.id !== String(index) && (
                  <ClipboardCheck
                    role="image"
                    className="opacity-0 transition group-hover:opacity-100 w-5 h-5"
                  />
                )}
                {isInlineCopied.id === String(index) && (
                  <CheckCircle
                    role="image"
                    className="opacity-0 transition group-hover:opacity-100 w-5 h-5 text-success"
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
