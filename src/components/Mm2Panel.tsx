import React, { useEffect, useState } from "react";
import { PlayIcon, StopIcon } from "../components/IconComponents";

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

const getBaseUrl = () => {
  return window.location.protocol + "//" + window.location.host;
};
const LOG_LEVEL = LogLevel.Debug;

const Mm2Panel = () => {
  const { mm2PanelState, setMm2PanelState } = useMm2PanelState();
  const [isMm2Initialized, setIsMm2Initialized] = useState(false);
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
      const wasm_bin_path = `/kdflib_bg.wasm`;
      let mm2BinUrl = new URL(baseUrl + wasm_bin_path);

      // Pre-fetch the WASM file to ensure it's cached by the service worker
      try {
        const response = await fetch(mm2BinUrl.toString(), {
          method: "GET",
          cache: "force-cache", // Use cache if available
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch WASM: ${response.status} ${response.statusText}`
          );
        }

        // Wait for the response to be fully downloaded
        await response.blob();
        console.log("WASM file pre-fetched successfully");
      } catch (fetchError) {
        console.warn("Pre-fetch failed, continuing with init:", fetchError);
      }

      // Now initialize the WASM module
      await init(mm2BinUrl);
    } catch (e) {
      alert(`Oops: ${e}`);
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

  return (
    <div className="h-full flex flex-col bg-primary-bg-800/95 backdrop-blur-xl rounded-lg shadow-2xl ring-1 ring-accent/20">
      <div className="relative flex items-center justify-center w-full p-2 bg-primary-bg-800/80 backdrop-blur-sm text-text-primary h-10 border-b border-border-primary rounded-t-lg">
        <div className="relative w-full flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => toggleMm2()}
              className="flex items-center cursor-pointer gap-1 rounded-lg text-sm py-1 px-3 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 hover:text-accent hover:shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all duration-200"
            >
              {!mm2PanelState.mm2Running ? (
                <>
                  <span>Run KDF</span>
                  <PlayIcon role="image" className="w-5 h-5 fill-green-500" />
                </>
              ) : (
                <>
                  <span>Stop KDF</span>
                  <StopIcon role="image" className="w-5 h-5 fill-red-500" />
                </>
              )}
            </button>
          </div>
          <div>
            <p className="text-sm">
              KDF Version: {process.env.NEXT_PUBLIC_KDF_WASM_LIB_VERSION}
            </p>
          </div>
        </div>
      </div>
      <textarea
        disabled={mm2PanelState.mm2Running}
        onChange={(e) => {
          let value = e.target.value;
          if (checkIfSchemaValid(value)) {
            setMm2PanelState({
              mm2Config: e.target.value,
              dataHasErrors: false,
            });
          } else {
            setMm2PanelState({
              mm2Config: e.target.value,
              dataHasErrors: true,
            });
          }
        }}
        className={`${
          !mm2PanelState.dataHasErrors
            ? "focus:ring-2 focus:ring-accent/50 focus:ring-inset"
            : "ring-2 ring-danger/50 ring-inset"
        } p-3 w-full h-full resize-none border-none outline-none bg-primary-bg-900/50 text-text-primary font-mono text-sm disabled:opacity-50 transition-all duration-200`}
        value={mm2PanelState.mm2Config}
      ></textarea>
    </div>
  );
};

export default Mm2Panel;
