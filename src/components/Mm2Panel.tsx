import React, { useEffect, useState, useCallback } from "react";
import { Play, Square, Ban, ClipboardCheck, CheckCircle, Save, FolderOpen } from "lucide-react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import Tooltip from "./Tooltip";
import { SaveMm2ConfigDialog } from "./SaveMm2ConfigDialog";
import { LoadMm2ConfigModal } from "./LoadMm2ConfigModal";
import { useToastState } from "../store/useStore";

import init, {
  LogLevel,
  MainStatus,
  Mm2RpcErr,
  mm2_main,
  mm2_main_status,
  mm2_stop,
  mm2_version,
} from "../js/kdflib.js";
import useIsValidSchema from "../shared-functions/useIsValidSchema";
import { useStore, useMm2PanelState } from "../store/useStore";
import { loadCompressedWasm } from "../utils/wasmLoader";
import { 
  isLocalhost, 
  loadLocalMM2Config, 
  extractRpcPassword 
} from "../utils/localConfigLoader";

const getBaseUrl = () => {
  return window.location.protocol + "//" + window.location.host;
};
const LOG_LEVEL = LogLevel.Debug;

const Mm2Panel = () => {
  const { mm2PanelState, setMm2PanelState } = useMm2PanelState();
  const [isMm2Initialized, setIsMm2Initialized] = useState(false);
  const [localConfigLoaded, setLocalConfigLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const { showToast } = useToastState();
  const [isValidSchema, _, checkIfSchemaValid] = useIsValidSchema(
    mm2PanelState.mm2Config
  );

  function handle_log(
    level: (typeof LogLevel)[keyof typeof LogLevel],
    line: string
  ) {
    switch (level) {
      case LogLevel.Off:
        break;
      case LogLevel.Error:
        useStore.setState((state) => ({
          mm2Logs: {
            ...state.mm2Logs,
            outputMessages: [
              ...state.mm2Logs.outputMessages,
              ["[Error] " + line, "red"],
            ],
          },
        }));
        console.error(line);
        break;
      case LogLevel.Warn:
        useStore.setState((state) => ({
          mm2Logs: {
            ...state.mm2Logs,
            outputMessages: [
              ...state.mm2Logs.outputMessages,
              ["[Warn] " + line, "yellow"],
            ],
          },
        }));
        console.warn(line);
        break;
      case LogLevel.Info:
        useStore.setState((state) => ({
          mm2Logs: {
            ...state.mm2Logs,
            outputMessages: [
              ...state.mm2Logs.outputMessages,
              ["[Info] " + line, "violet"],
            ],
          },
        }));
        console.info(line);
        break;
      case LogLevel.Debug:
        console.log(line);
        break;
      case LogLevel.Trace:
      default:
        // The console.trace method outputs some extra trace from the generated JS glue code which we don't want.
        useStore.setState((state) => ({
          mm2Logs: {
            ...state.mm2Logs,
            outputMessages: [
              ...state.mm2Logs.outputMessages,
              ["[default] " + line, "neutral"],
            ],
          },
        }));
        console.debug(line);
        break;
    }
  }

  async function run_mm2(
    params: any,
    handle_log: (
      level: (typeof LogLevel)[keyof typeof LogLevel],
      line: string
    ) => void
  ) {
    // run an MM2 instance
    try {
      const version = mm2_version();
      useStore.setState((state) => ({
        mm2Logs: {
          ...state.mm2Logs,
          outputMessages: [
            ...state.mm2Logs.outputMessages,
            [
              "[Info] " +
                `run_mm2() version=${version.result} datetime=${version.datetime}`,
              "violet",
            ],
          ],
        },
      }));
      console.info(
        `run_mm2() version=${version.result} datetime=${version.datetime}`
      );
      mm2_main(params, handle_log);
      return true;
    } catch (e) {
      console.error(e);
      alert(`Unexpected error: ${e}`);
      return false;
    }
  }

  async function init_wasm() {
    try {
      const baseUrl = getBaseUrl();
      const wasm_bin_path = `/kdflib_bg.wasm.gz`;
      let mm2BinUrl = new URL(baseUrl + wasm_bin_path);

      console.log("Loading compressed WASM from:", mm2BinUrl.toString());

      // Load and decompress the WASM file
      const wasmBuffer = await loadCompressedWasm(mm2BinUrl);

      // Initialize the WASM module with the decompressed buffer
      await init(wasmBuffer);

      console.log("WASM module initialized successfully");
    } catch (e) {
      console.error("Failed to initialize WASM:", e);
      alert(`Failed to initialize WASM: ${e}`);
    }
  }
  function spawn_mm2_status_checking() {
    // This function now just returns the interval ID
    return setInterval(function () {
      const status = mm2_main_status();
      switch (status) {
        case MainStatus.NotRunning:
        //  console.log("NotRunning")
        case MainStatus.NoContext:
        // console.log("NoContext")
        case MainStatus.NoRpc:
          //  console.log("NoRpc")
          useStore.setState((state) => ({
            mm2Panel: {
              ...state.mm2Panel,
              mm2Running: false,
            },
          }));
          break;
        case MainStatus.RpcIsUp:
          //  console.log("RpcIsUp")
          useStore.setState((state) => ({
            mm2Panel: {
              ...state.mm2Panel,
              mm2Running: true,
            },
          }));
          break;
        default:
          throw new Error(`Expected MainStatus, found: ${status}`);
      }
    }, 300);
  }

  const toggleMm2 = async () => {
    if (mm2PanelState.mm2Running) {
      mm2_stop();
    } else {
      let params;
      try {
        // setLoading({ id: "mm2CommandInitiated" });
        const conf_js = JSON.parse(mm2PanelState.mm2Config);
        if (!conf_js.coins) {
          const baseUrl = getBaseUrl();
          let coinsUrl = new URL(baseUrl + "/coins");
          let coins = await fetch(coinsUrl);
          let coinsJson = await coins.json();
          conf_js.coins = coinsJson;
          // console.log(conf_js)
        }
        setMm2PanelState({
          mm2UserPass: conf_js.rpc_password,
        });
        params = {
          conf: conf_js,
          log_level: LOG_LEVEL,
        };
      } catch (e) {
        alert(
          `Expected config in JSON, found '${mm2PanelState.mm2Config}'\nError : ${e}`
        );
        return;
      }
      // finally {
      //   setLoading({ id: "" });
      // }

      return await run_mm2(params, handle_log);
    }
  };

  // Load local configuration on mount (only on localhost)
  useEffect(() => {
    const loadLocalConfig = async () => {
      if (isLocalhost()) {
        const localMM2Config = await loadLocalMM2Config();
        if (localMM2Config) {
          setMm2PanelState({ mm2Config: localMM2Config });
          setLocalConfigLoaded(true);
          
          // Extract and store the RPC password for syncing with RPC panel
          const rpcPassword = extractRpcPassword(localMM2Config);
          if (rpcPassword) {
            setMm2PanelState({ mm2UserPass: rpcPassword });
          }
        }
      }
    };
    
    loadLocalConfig();
  }, []); // Only run once on mount

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    init_wasm().then(function () {
      intervalId = spawn_mm2_status_checking();
      setIsMm2Initialized(true);
    });

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const handleLoadConfig = useCallback(
    (config: string) => {
      // Parse and restore current password and passphrase if available
      try {
        const currentConfig = JSON.parse(mm2PanelState.mm2Config);
        const currentPassword = currentConfig.rpc_password;
        const currentPassphrase = currentConfig.passphrase;
        
        const loadedConfig = JSON.parse(config);
        
        // Restore both password and passphrase from current config
        if (currentPassword) {
          loadedConfig.rpc_password = currentPassword;
        }
        if (currentPassphrase) {
          loadedConfig.passphrase = currentPassphrase;
        }
        
        setMm2PanelState({ mm2Config: JSON.stringify(loadedConfig, null, 2) });
      } catch {
        setMm2PanelState({ mm2Config: config });
      }
      
      showToast("Configuration loaded successfully!", "success");
    },
    [mm2PanelState.mm2Config, setMm2PanelState, showToast]
  );

  const handleConfigSaved = useCallback(
    (name: string) => {
      showToast(`Configuration saved as "${name}"`, "success");
    },
    [showToast]
  );

  return (
    <>
      <SaveMm2ConfigDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        currentConfig={mm2PanelState.mm2Config}
        onSaved={handleConfigSaved}
      />
      <LoadMm2ConfigModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoad={handleLoadConfig}
      />
      <div className="h-full flex flex-col bg-primary-bg-800/95 backdrop-blur-xl rounded-lg shadow-2xl ring-1 ring-accent/20">
      <div className="relative flex items-center justify-center w-full p-1 md:p-2 bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary rounded-t-lg">
        <div className="relative w-full flex items-center justify-between">
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => toggleMm2()}
              aria-label={!mm2PanelState.mm2Running ? "Start KDF service" : "Stop KDF service"}
              className="flex items-center cursor-pointer gap-1 rounded-lg text-xs md:text-sm py-1 px-2 md:px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent hover:shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {!mm2PanelState.mm2Running ? (
                <>
                  <span className="hidden md:inline">Run KDF</span>
                  <span className="md:hidden">Run</span>
                  <Play
                    aria-hidden="true"
                    className="w-3.5 md:w-4 h-3.5 md:h-4 fill-green-500"
                  />
                </>
              ) : (
                <>
                  <span className="hidden md:inline">Stop KDF</span>
                  <span className="md:hidden">Stop</span>
                  <Square
                    aria-hidden="true"
                    className="w-3.5 md:w-4 h-3.5 md:h-4 fill-red-500"
                  />
                </>
              )}
            </button>
            {!mm2PanelState.mm2Running && (
              <>
                <Tooltip label="Save Config" dir="bottom">
                  <button
                    onClick={() => setIsSaveDialogOpen(true)}
                    className="flex items-center gap-1 rounded-lg text-xs md:text-sm py-1 px-2 md:px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 cursor-pointer"
                  >
                    <Save className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </Tooltip>

                <Tooltip label="Load Config" dir="bottom">
                  <button
                    onClick={() => setIsLoadModalOpen(true)}
                    className="flex items-center gap-1 rounded-lg text-xs md:text-sm py-1 px-2 md:px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 cursor-pointer"
                  >
                    <FolderOpen className="w-4 md:w-5 h-4 md:h-5" />
                  </button>
                </Tooltip>

                <div className="flex gap-1">
                  <Tooltip label="Clear Panel" dir="bottom">
                  <button
                    onClick={() => setMm2PanelState({ mm2Config: "{}" })}
                    className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
                    aria-label="Clear MM2 config"
                  >
                    <Ban className="w-4 md:w-5 h-4 md:h-5 text-text-muted hover:text-danger" />
                  </button>
                </Tooltip>
                {!copied ? (
                  <Tooltip label="Copy Config" dir="bottom">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mm2PanelState.mm2Config);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98]"
                      aria-label="Copy MM2 config"
                    >
                      <ClipboardCheck className="w-4 md:w-5 h-4 md:h-5 text-text-muted hover:text-accent" />
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip label="Copied!" dir="bottom">
                    <button
                      className="p-1.5 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
                      aria-label="Config copied"
                    >
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-success animate-fadeIn" />
                    </button>
                  </Tooltip>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex max-w-[80%] max-h-full flex-row flex-wrap overflow-auto">
            <p className="text-sm -md:text-xs">
              {localConfigLoaded && (
                <span className="text-green-400 mr-2" title="Local config loaded">
                  📁
                </span>
              )}
              {" "}
              KDF Version: {process.env.NEXT_PUBLIC_KDF_WASM_LIB_VERSION}{" "}
              {process.env.NEXT_PUBLIC_KDF_PR_URL && (
                <a
                  className="ml-2 text-blue-300"
                  href={process.env.NEXT_PUBLIC_KDF_PR_URL}
                  target="_blank"
                >
                  🔗 <span className="underline">PR Link</span>
                </a>
              )}{" "}
              {process.env.NEXT_PUBLIC_KDF_TREE && (
                <a
                  className="ml-2 text-blue-300"
                  href={process.env.NEXT_PUBLIC_KDF_TREE}
                  target="_blank"
                >
                  🔗 <span className="underline">GH Tree Link</span>
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
      <div
        className={`${
          !mm2PanelState.dataHasErrors
            ? "focus-within:ring-2 focus-within:ring-accent/50"
            : "ring-4 ring-red-500"
        } relative flex-1 min-h-0 overflow-hidden bg-primary-bg-900/50 transition-all duration-200`}
      >
        <div
          className={`absolute inset-0 p-2 h-full w-full z-10 bg-gray-100 ${
            mm2PanelState.mm2Running ? "opacity-20 block" : "opacity-0 hidden"
          }`}
        ></div>
        <JsonMonacoEditor
          value={mm2PanelState.mm2Config}
          onChange={(value) => {
            if (checkIfSchemaValid(value)) {
              setMm2PanelState({
                mm2Config: value,
                dataHasErrors: false,
              });
            } else {
              setMm2PanelState({
                mm2Config: value,
                dataHasErrors: true,
              });
            }
          }}
          disabled={mm2PanelState.mm2Running}
        />
      </div>
    </div>
    </>
  );
};

export default Mm2Panel;
