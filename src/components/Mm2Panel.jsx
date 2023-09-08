import React from "react";
import { useEffect, useRef, useState } from "react";
import { PlayIcon, StopIcon } from "../components/IconComponents";

import init, {
  mm2_main,
  mm2_main_status,
  mm2_rpc,
  mm2_version,
  LogLevel,
  Mm2MainErr,
  MainStatus,
  Mm2RpcErr,
} from "../js/mm2.js";
import { rpc_request } from "../shared-functions/rpcRequest";

const getBaseUrl = () => {
  return window.location.protocol + "//" + window.location.host;
};
const LOG_LEVEL = LogLevel.Debug;

const Mm2Panel = ({ mm2State, setMm2State, setMm2Logs }) => {
  const [loading, setLoading] = useState({
    id: "",
  });

  // console.log(mm2Logs.outputMessages);
  function handle_log(level, line) {
    switch (level) {
      case LogLevel.Off:
        break;
      case LogLevel.Error:
        setMm2Logs((current) => {
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
        setMm2Logs((current) => {
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
        setMm2Logs((current) => {
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
        setMm2Logs((current) => {
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
      setMm2Logs((current) => {
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
        `run_mm2() version=${version.result} datetime=${version.datetime}`
      );
      mm2_main(params, handle_log);
    } catch (e) {
      switch (e) {
        case Mm2MainErr.AlreadyRuns:
          alert("MM2 already runs, please wait...");
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
      if (import.meta.env.DEV) {
        wasm_bin_path = `/mm2_bg.wasm?v=${Date.now()}`;
      } else {
        wasm_bin_path = `/mm2_${import.meta.env.VITE_WASM_VERSION}_bg.wasm`;
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
          setMm2State((currentValues) => {
            return {
              ...currentValues,
              mm2Running: false,
            };
          });
          break;
        case MainStatus.RpcIsUp:
          //  console.log("RpcIsUp")
          setMm2State((currentValues) => {
            return {
              ...currentValues,
              mm2Running: true,
            };
          });
          break;
        default:
          throw new Error(`Expected MainStatus, found: ${status}`);
      }
    }, 100);
  }

  const toggleMm2 = async () => {
    if (mm2State.mm2Running) {
      // setLoading({ id: "mm2Stopping" });
      try {
        let resp = await rpc_request({
          userpass: mm2State.mm2UserPass,
          method: "stop",
        });
        setMm2State((currentValues) => {
          return {
            ...currentValues,
            mm2Running: false,
          };
        });
      } catch (error) {
        alert(`used userPass: ${mm2State.mm2UserPass}. error:${error}`);
      }
      // finally {
      //   setLoading({ id: "" });
      // }
    } else {
      let params;
      try {
        // setLoading({ id: "mm2CommandInitiated" });
        const conf_js = JSON.parse(mm2State.mm2Config);
        if (!conf_js.coins) {
          const baseUrl = getBaseUrl();
          let coinsUrl = new URL(baseUrl + "/coins");
          let coins = await fetch(coinsUrl);
          let coinsJson = await coins.json();
          conf_js.coins = coinsJson;
          // console.log(conf_js)
        }
        setMm2State((currentValues) => {
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
          `Expected config in JSON, found '${mm2State.mm2Config}'\nError : ${e}`
        );
        return;
      }
      // finally {
      //   setLoading({ id: "" });
      // }

      await run_mm2(params, handle_log);
    }
  };

  useEffect(() => {
    init_wasm().then(function () {
      spawn_mm2_status_checking();
    });
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="w-full p-2 bg-[#11182f] text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex gap-3">
          {mm2State.mm2Running ? (
            <StopIcon
              onClick={() => toggleMm2()}
              role="button"
              className="w-6 h-6 cursor-pointer hover:fill-red-500"
              title="Run MM2"
            />
          ) : (
            <PlayIcon
              onClick={() => toggleMm2()}
              role="button"
              className="w-6 h-6 cursor-pointer hover:fill-green-500"
              title="Run MM2"
            />
          )}
        </div>
      </div>
      <textarea
        disabled={mm2State.mm2Running}
        onChange={(e) =>
          setMm2State((currentValues) => {
            return {
              ...currentValues,
              mm2Config: e.target.value,
            };
          })
        }
        className="p-3 w-full h-full resize-none border-none outline-none overflow-hidden bg-transparent text-gray-400 disabled:opacity-[50%]"
        value={mm2State.mm2Config}
      ></textarea>
    </div>
  );
};

export default Mm2Panel;
