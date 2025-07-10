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
import { useStore, useMm2PanelState, useRpcMethods, useRpcPanelState } from "../store/useStore";
import { rpc_request } from "../shared-functions/rpcRequest";

const getBaseUrl = () => {
  return window.location.protocol + "//" + window.location.host;
};
const LOG_LEVEL = LogLevel.Debug;

const Mm2Panel = () => {
  const { mm2PanelState, setMm2PanelState } = useMm2PanelState();
  const { methods } = useRpcMethods();
  const [isMm2Initialized, setIsMm2Initialized] = useState(false);
  const { rpcPanelState, setRpcPanelState } = useRpcPanelState();
  const [docsProperties, setDocsProperties] = useState({
    instance: null,
    shouldSendRpcRequest: false,
    requestId: null,
  });
  const [isValidSchema, _, checkIfSchemaValid] = useIsValidSchema(
    mm2PanelState.mm2Config
  );

  useEffect(() => {
    if (docsProperties.instance && mm2PanelState.mm2Running) {
      rpc_request(
        JSON.parse(docsProperties.instance.data.jsonDataForRpcRequest)
      ).then((response) => {
        docsProperties.instance.source.postMessage(
          { requestId: docsProperties.requestId, response },
          docsProperties.instance.origin
        );
        setDocsProperties({
          instance: null,
          shouldSendRpcRequest: false,
          requestId: null,
        });
        // stopping to free up agent CPU resource
        toggleMm2().then(() => {
          window.close();
        });
      });
    }
  }, [docsProperties, mm2PanelState.mm2Running]);

  function handle_log(level, line) {
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

  async function run_mm2(params, handle_log) {
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
      let wasm_bin_path;
      if (process.env.NODE_ENV !== "production") {
        wasm_bin_path = `/kdflib_bg.wasm?v=${Date.now()}`;
      } else {
        wasm_bin_path = `/kdf_${process.env.NEXT_PUBLIC_WASM_VERSION}_bg.wasm`;
      }
      let mm2BinUrl = new URL(baseUrl + wasm_bin_path);
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
        setMm2PanelState((currentValues) => {
          return {
            ...currentValues,
            mm2UserPass: conf_js.rpc_password,
          };
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

  async function listenOnEventsFromDocs(event) {
    if (event.origin !== "http://localhost:3000") {
      return;
    }
    // Handle the received data
    let receivedData = event.data;
    setRpcPanelState((currentState) => ({
      ...currentState,
      config: receivedData.jsonDataForRpcRequest,
    }));
    toggleMm2().then(() => {
      setDocsProperties({
        instance: event,
        shouldSendRpcRequest: true,
        requestId: receivedData.requestId,
      });
    });
  }

  useEffect(() => {
    let intervalId;
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

  useEffect(() => {
    if (methods && isMm2Initialized)
      if (window.opener) {
        window.addEventListener("message", listenOnEventsFromDocs);
        window.opener.postMessage("👍", "http://localhost:3000");
      }
    return () => {
      window.removeEventListener("message", listenOnEventsFromDocs);
    };
  }, [methods, isMm2Initialized]);

  return (
    <div className="h-full flex flex-col">
      <div className="w-full p-2 bg-primaryLight text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => toggleMm2()}
              className="flex items-center gap-1 border border-gray-600 rounded-full text-sm p-[2px] px-2 hover:bg-[#182347]"
            >
              {!mm2PanelState.mm2Running ? (
                <>
                  <span>Run KDF</span>
                  <PlayIcon
                    role="image"
                    className="w-5 h-5 cursor-pointer fill-green-500"
                  />
                </>
              ) : (
                <>
                  <span>Stop KDF</span>
                  <StopIcon
                    role="image"
                    className="w-5 h-5 cursor-pointer fill-red-500"
                  />
                </>
              )}
            </button>
          </div>
          <div>
            <p className="text-sm">
              KDF Version: {process.env.NEXT_PUBLIC_WASM_VERSION}
            </p>
          </div>
        </div>
      </div>
      <textarea
        disabled={mm2PanelState.mm2Running}
        onChange={(e) => {
          let value = e.target.value;
          if (checkIfSchemaValid(value)) {
            setMm2PanelState((currentValues) => {
              return {
                ...currentValues,
                mm2Config: e.target.value,
                dataHasErrors: false,
              };
            });
          } else {
            setMm2PanelState((currentValues) => {
              return {
                ...currentValues,
                mm2Config: e.target.value,
                dataHasErrors: true,
              };
            });
          }
        }}
        className={`${!mm2PanelState.dataHasErrors
          ? "focus:ring-blue-700"
          : "focus:ring-red-700 focus:ring-2"
          } p-3 w-full h-full resize-none border-none outline-none bg-transparent text-gray-400 disabled:opacity-[50%]`}
        value={mm2PanelState.mm2Config}
      ></textarea>
    </div>
  );
};

export default Mm2Panel;
