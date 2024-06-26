import React, { useEffect, useState } from "react";
import { PlayIcon, StopIcon } from "../components/IconComponents";

import init, {
  LogLevel,
  MainStatus,
  Mm2MainErr,
  mm2_main,
  mm2_main_status,
  mm2_stop,
  mm2_version,
} from "../js/mm2lib.js";
import useIsValidSchema from "../shared-functions/useIsValidSchema";
import { useMm2PanelState } from "../store/mm2";
import { useMm2LogsPanelState } from "../store/mm2Logs";
import { useRpcMethods } from "../store/methods";
import { useRpcPanelState } from "../store/rpc";
import { rpc_request } from "../shared-functions/rpcRequest";

const getBaseUrl = () => {
  return window.location.protocol + "//" + window.location.host;
};
const LOG_LEVEL = LogLevel.Debug;

const Mm2Panel = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const { mm2PanelState, setMm2PanelState } = useMm2PanelState();
  const { setMm2LogsPanelState } = useMm2LogsPanelState();
  const { methods } = useRpcMethods();
  const [isMm2Initialized, setIsMm2Initialized] = useState(false);
  const { rpcPanelState, setRpcPanelState } = useRpcPanelState();
  const [docsProperties, setDocsProperties] = useState({
    instance: null,
    shouldSendRpcRequest: false,
    requestId: null,
  });
  const [isValidSchema, _, checkIfSchemaValid] = useIsValidSchema(
    mm2PanelState.mm2Config,
  );

  // // Initialize mm2 when the auto-run query param is set to true
  // useEffect(() => {
  //   if (searchParams.get("auto-run")) {
  //     setTimeout(() => {
  //       toggleMm2();
  //     }, 2000);
  //   }
  // }, []);

  useEffect(() => {
    if (docsProperties.instance && mm2PanelState.mm2Running) {
      rpc_request(
        JSON.parse(docsProperties.instance.data.jsonDataForRpcRequest),
      ).then((response) => {
        docsProperties.instance.source.postMessage(
          { requestId: docsProperties.requestId, response },
          docsProperties.instance.origin,
        );
        setDocsProperties({
          instance: null,
          shouldSendRpcRequest: false,
          requestId: null,
        });
        // stopping to free up agent CPU resource
        // toggleMm2().then(() => {
        //   window.opener.focus();
        //   // window.close();
        // });
      });
    }
  }, [docsProperties, mm2PanelState.mm2Running]);

  function handle_log(level, line) {
    switch (level) {
      case LogLevel.Off:
        break;
      case LogLevel.Error:
        setMm2LogsPanelState((current) => {
          return {
            ...current,
            outputMessages: [
              ...current.outputMessages,
              ["[Error] " + line, "red"],
            ],
          };
        });
        console.error(line);
        break;
      case LogLevel.Warn:
        setMm2LogsPanelState((current) => {
          return {
            ...current,
            outputMessages: [
              ...current.outputMessages,
              ["[Warn] " + line, "yellow"],
            ],
          };
        });
        console.warn(line);
        break;
      case LogLevel.Info:
        setMm2LogsPanelState((current) => {
          return {
            ...current,
            outputMessages: [
              ...current.outputMessages,
              ["[Info] " + line, "violet"],
            ],
          };
        });
        console.info(line);
        break;
      case LogLevel.Debug:
        console.log(line);
        break;
      case LogLevel.Trace:
      default:
        // The console.trace method outputs some extra trace from the generated JS glue code which we don't want.
        setMm2LogsPanelState((current) => {
          return {
            ...current,
            outputMessages: [
              ...current.outputMessages,
              ["[default] " + line, "neutral"],
            ],
          };
        });
        console.debug(line);
        break;
    }
  }

  async function run_mm2(params, handle_log) {
    // run an MM2 instance
    try {
      const version = mm2_version();
      setMm2LogsPanelState((current) => {
        return {
          ...current,
          outputMessages: [
            ...current.outputMessages,
            [
              "[Info] " +
                `run_mm2() version=${version.result} datetime=${version.datetime}`,
              "violet",
            ],
          ],
        };
      });
      console.info(
        `run_mm2() version=${version.result} datetime=${version.datetime}`,
      );
      mm2_main(params, handle_log);
      return true;
    } catch (e) {
      switch (e) {
        case Mm2MainErr.AlreadyRuns:
          alert("MM2 is already running, please wait...");
          return;
        case Mm2MainErr.InvalidParams:
          alert("Invalid config");
          return;
        case Mm2MainErr.NoCoinsInConf:
          alert("No 'coins' field in config");
          return;
        default:
          alert(`Oops: ${e}`);
          return;
      }
    }
  }

  async function init_wasm() {
    try {
      const baseUrl = getBaseUrl();
      let wasm_bin_path;
      if (process.env.NODE_ENV !== "production") {
        wasm_bin_path = `/mm2lib_bg.wasm?v=${Date.now()}`;
      } else {
        wasm_bin_path = `/mm2_${process.env.NEXT_PUBLIC_WASM_VERSION}_bg.wasm`;
      }
      let mm2BinUrl = new URL(baseUrl + wasm_bin_path);
      await init(mm2BinUrl);
    } catch (e) {
      alert(`Oops: ${e}`);
    }
  }
  function spawn_mm2_status_checking() {
    setInterval(function () {
      const status = mm2_main_status();
      switch (status) {
        case MainStatus.NotRunning:
        //  console.log("NotRunning")
        case MainStatus.NoContext:
        // console.log("NoContext")
        case MainStatus.NoRpc:
          //  console.log("NoRpc")
          setMm2PanelState((currentValues) => {
            return {
              ...currentValues,
              mm2Running: false,
            };
          });
          break;
        case MainStatus.RpcIsUp:
          //  console.log("RpcIsUp")
          setMm2PanelState((currentValues) => {
            return {
              ...currentValues,
              mm2Running: true,
            };
          });
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
          `Expected config in JSON, found '${mm2PanelState.mm2Config}'\nError : ${e}`,
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
    if (event.origin !== EVENT_ORIGIN_URL) {
      return;
    }
    // Handle the received data
    let receivedData = event.data;
    setRpcPanelState({
      ...rpcPanelState,
      config: receivedData.jsonDataForRpcRequest,
    });
    toggleMm2().then(() => {
      setDocsProperties({
        instance: event,
        shouldSendRpcRequest: true,
        requestId: receivedData.requestId,
      });
    });
  }

  useEffect(() => {
    init_wasm().then(function () {
      spawn_mm2_status_checking();
      setIsMm2Initialized(true);
    });
  }, []);

  useEffect(() => {
    if (methods && isMm2Initialized)
      if (window.opener) {
        window.addEventListener("message", listenOnEventsFromDocs);
        window.opener.postMessage("👍", EVENT_ORIGIN_URL);
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
                  <span>Run MM2</span>
                  <PlayIcon
                    role="image"
                    className="w-5 h-5 cursor-pointer fill-green-500"
                  />
                </>
              ) : (
                <>
                  <span>Stop MM2</span>
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
              Version: {process.env.NEXT_PUBLIC_WASM_VERSION}
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
        className={`${
          !mm2PanelState.dataHasErrors
            ? "focus:ring-blue-700"
            : "focus:ring-red-700 focus:ring-2"
        } p-3 w-full h-full resize-none border-none outline-none bg-transparent text-gray-400 disabled:opacity-[50%]`}
        value={mm2PanelState.mm2Config}
      ></textarea>
    </div>
  );
};

export default Mm2Panel;

export const EVENT_ORIGIN_URL = "https://komodo-test.vercel.app";
// export const EVENT_ORIGIN_URL = "http://localhost:3000";
