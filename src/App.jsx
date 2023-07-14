// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use.
// Currently, browsers don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import { useEffect, useRef, useState } from 'react';

import init, {
  mm2_main,
  mm2_main_status,
  mm2_rpc,
  mm2_version,
  LogLevel,
  Mm2MainErr,
  MainStatus,
  Mm2RpcErr
} from "./js/mm2.js";

const LOG_LEVEL = LogLevel.Debug;

// Loads the wasm file, so we use the
// default export to inform it where the wasm file is located on the
// server, and then we wait on the returned promise to wait for the
// wasm to be loaded.
async function init_wasm() {
  try {
    const baseUrl = getBaseUrl()
    let wasm_bin_path
    if (import.meta.env.DEV) {
      wasm_bin_path = `/mm2_bg.wasm?v=${Date.now()}`
    } else {
      wasm_bin_path = `/mm2_${import.meta.env.VITE_WASM_VERSION}_bg.wasm`
    }
    let mm2BinUrl = new URL(baseUrl + wasm_bin_path)
    console.log(mm2BinUrl)
    await init(mm2BinUrl);
  } catch (e) {
    alert(`Oops: ${e}`);
  }
}

const getBaseUrl = () => {
  return window.location.protocol + "//" + window.location.host;
}


/**
 * If you don't care about primitives and only objects then this function
 * is for you, otherwise look elsewhere.
 * This function will return `false` for any valid json primitive.
 * EG, 'true' -> false
 *     '123' -> false
 *     'null' -> false
 *     '"I'm a string"' -> false
 */
function tryParseJSONObject(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object", 
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === "object") {
      return o;
    }
  }
  catch (e) { }

  return false;
};



function App() {
  const outputBottomRef = useRef(null);
  const [outputMessages, setOutputMessages] = useState([["Once mm2 is run, daemon output is rendered here", "blue"]]);

  const initialMm2BtnText = 'Run mm2';
  const [confData, setConfData] = useState(`{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "allow_weak_password": true,
    "rpc_password": "testpsw",
    "netid": 7777
}`);
  const [requestData, setRequestData] = useState(`[
    {
        "userpass": "testpsw",
        "method": "electrum",
        "mm2": 1,
        "coin": "RICK",
        "tx_history": true,
        "servers": [
            {
                "url": "electrum1.cipig.net:30017",
                "protocol": "WSS"
            }
        ]
    },
    {
        "userpass": "testpsw",
        "method": "electrum",
        "mm2": 1,
        "coin": "MORTY",
        "tx_history": true,
        "servers": [
            {
                "url": "electrum1.cipig.net:30018",
                "protocol": "WSS"
            }
        ]
    },
    {
        "userpass": "testpsw",
        "method": "enable",
        "mm2": 1,
        "coin": "ETH",
        "swap_contract_address": "0x8500AFc0bc5214728082163326C2FF0C73f4a871",
        "urls": [
            "http://eth1.cipig.net:8555"
        ]
    }
]`);
  const [mm2BtnText, setMm2BtnText] = useState(initialMm2BtnText);
  const [mm2UserPass, setMm2UserPass] = useState("");
  const [rpcResponse, setRpcResponse] = useState("Once a request is sent, mm2's response is displayed here")
  const mm2BtnTextRef = useRef()
  const mm2UserPassRef = useRef()
  const rpcResponseRef = useRef()
  mm2BtnTextRef.current = mm2BtnText
  mm2UserPassRef.current = mm2UserPass
  rpcResponseRef.current = rpcResponse

  const [scrollOutputChecked, setScrollOutputChecked] = useState(true);

  const scrollOutputOnChange = () => {
    setScrollOutputChecked(!scrollOutputChecked);
  };

  useEffect(() => {
    // 👇️ scroll to bottom every time outputMessages change
    let nOfOutputMsgs = outputMessages.length
    if (nOfOutputMsgs > 500) {
      setOutputMessages(current => current.slice(-500))
      //outputMessages = outputMessages.slice(-20)
      // outputMessages.splice(0,nOfOutputMsgs-20)
    } if (scrollOutputChecked) {
      outputBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputMessages]);

  useEffect(() => {
    if (scrollOutputChecked) {
      outputBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollOutputChecked]);


  function spawn_mm2_status_checking() {
    setInterval(function () {
      const run_button = document.getElementById("wid_run_mm2_button");
      const rpc_button = document.getElementById("wid_mm2_rpc_button");
      const conf_input = document.getElementById("wid_conf_input");

      const status = mm2_main_status();
      switch (status) {
        case MainStatus.NotRunning:
        //  console.log("NotRunning")
        case MainStatus.NoContext:
        // console.log("NoContext")
        case MainStatus.NoRpc:
          //  console.log("NoRpc")
          rpc_button.disabled = true;
          run_button.disabled = false;
          conf_input.disabled = false;
          setMm2BtnText(() => 'Run mm2')
          break;
        case MainStatus.RpcIsUp:
          //  console.log("RpcIsUp")
          rpc_button.disabled = false;
          run_button.stop_btn = true;
          conf_input.disabled = true;
          setMm2BtnText(() => 'Stop mm2')
          break;
        default:
          throw new Error(`Expected MainStatus, found: ${status}`);
      }
    }, 100)
  }

  function handle_log(level, line) {
    switch (level) {
      case LogLevel.Off:
        break;
      case LogLevel.Error:
        setOutputMessages(current => [
          ...current,
          ["[Error] " + line, "red"],
        ]);
        console.error(line);
        break;
      case LogLevel.Warn:
        setOutputMessages(current => [
          ...current,
          ["[Warn] " + line, "yellow"],
        ]);
        console.warn(line);
        break;
      case LogLevel.Info:
        setOutputMessages(current => [
          ...current,
          ["[Info] " + line, "violet"],
        ]);
        console.info(line);
        break;
      case LogLevel.Debug:
        // setOutputMessages(current => [
        //   ...current,
        //   ["[Debug] " + line, "neutral"],
        // ]);
        console.log(line);
        break;
      case LogLevel.Trace:
      default:
        // The console.trace method outputs some extra trace from the generated JS glue code which we don't want.
        setOutputMessages(current => [
          ...current,
          ["[default] " + line, "neutral"],
        ]);
        console.debug(line);
        break;
    }
  }

  const logLevels = [{ id: "debug", title: "Debug" }, { id: "info", title: "Info" }, { id: "warn", title: "Warn" }, { id: "error", title: "Error" },]

  async function run_mm2(params, handle_log) {
    // run an MM2 instance
    try {
      const version = mm2_version();
      setOutputMessages(current => [
        ...current,
        ["[Info] " + `run_mm2() version=${version.result} datetime=${version.datetime}`, "violet"],
      ]);
      console.info(`run_mm2() version=${version.result} datetime=${version.datetime}`);
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

  async function rpc_request(request_js) {
    try {
      const response = await mm2_rpc(request_js);
      console.log(response);
      return response
    } catch (e) {
      switch (e) {
        case Mm2RpcErr.NotRunning:
          alert("MM2 is not running yet");
          break;
        case Mm2RpcErr.InvalidPayload:
          alert(`Invalid payload: ${request_js}`);
          break;
        case Mm2RpcErr.InternalError:
          alert(`An MM2 internal error`);
          break;
        default:
          alert(`Unexpected error: ${e}`);
          break;
      }
    }
  }

  useEffect(() => {
    /* (async () => {
       await init_wasm()
       spawn_mm2_status_checking();
     })();
 
     return () => {
       // this now gets called when the component unmounts
     };*/

    init_wasm().then(function () {
      spawn_mm2_status_checking();
      const run_mm2_button = document.getElementById("wid_run_mm2_button");
      run_mm2_button.addEventListener('click', async (e) => {
        e.preventDefault()
        if (mm2BtnTextRef.current === "Stop mm2") {
          try {
            let resp = await rpc_request({
              userpass: mm2UserPassRef.current,
              method: "stop"
            })
            setMm2BtnText(() => 'Run mm2')
          } catch (error) {
            alert(`used userPass: ${mm2UserPassRef.current}. error:${error}`)
          }

        } else {
          const conf = document.getElementById("wid_conf_input").value || document.getElementById("wid_conf_input").defaultValue;

          let params;
          try {
            const conf_js = JSON.parse(conf);
            if (!conf_js.coins) {
              const baseUrl = getBaseUrl()
              let coinsUrl = new URL(baseUrl + "/coins")
              let coins = await fetch(coinsUrl);
              let coinsJson = await coins.json();
              conf_js.coins = coinsJson
              // console.log(conf_js)
            }
            setMm2UserPass(() => conf_js.rpc_password)
            params = {
              conf: conf_js,
              log_level: LOG_LEVEL,
            };
          } catch (e) {
            alert(`Expected config in JSON, found '${conf}'\nError : ${e}`);
            return;
          }

          await run_mm2(params, handle_log);
        }
      });

      const rpc_request_button = document.getElementById("wid_mm2_rpc_button");
      rpc_request_button.addEventListener('click', async () => {
        const request_payload = document.getElementById("wid_rpc_input").value;
        let request_js;
        try {
          request_js = JSON.parse(request_payload);
        } catch (e) {
          alert(`Expected request in JSON, found '${request_payload}'\nError : ${e}`);
          return;
        }

        let response = await rpc_request(request_js);
        setRpcResponse(() => JSON.stringify(response, null, 2));
      });
    });

    // empty dependency array means this effect will only run once (like componentDidMount in classes)
  }, []);

  return (
    <div>
      <main className="h-screen">
        <p className='text-xl text-center text-white'>Use at your own risk. Do not store/load seeds/wallets with coins/tokens of any significant value</p>
        <div className="h-[96vh] pt-2 my-auto mx-auto max-w-[90%]">
          {/* Main 3 column grid */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
            {/* Left column */}

            <div className="grid h-full  grid-cols-1 gap-4 lg:col-span-2">
              <section aria-labelledby="section-1-title" className="flex flex-col justify-between">
                <div className='relative'>
                  <textarea id="wid_conf_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2 disabled:opacity-[50%]" defaultValue={confData}>
                  </textarea>
                  {/* <div className="absolute w-[80px] bottom-[20px] right-[30px] top-1/2 -translate-y-1/2 bg-slate-500 opacity-40 hover:opacity-100 justify-around flex flex-col">
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="prettify-conf"
                          aria-describedby="prettify-conf"
                          name="prettify conf"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={prettifyConfChecked}
                          onChange={prettifyConfOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="prettify-conf" className="font-medium text-gray-300">
                          Prettify
                        </label>
                      </div>
                    </div>
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="collapse-conf"
                          aria-describedby="collapse-conf"
                          name="collapse conf"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={collapseConfChecked}
                          onChange={collapseConfOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="collapse-conf" className="font-medium text-gray-300">
                          Collapse
                        </label>
                      </div>
                    </div>
                  </div>  */}
                </div>
                <button id="wid_run_mm2_button" className="inline-flex justify-center rounded-lg text-sm font-semibold  px-4 my-2 bg-slate-500 text-gray-400 enabled:text-gray-700 enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500 h-[32px] w-[142px] mx-auto">
                  <span className="my-auto flex items-center">{mm2BtnText}</span>
                </button>
                <div className='relative'>
                  <div id="wid_mm2_output" className="w-full h-[60vh] overflow-y-scroll rounded-lg bg-slate-800 shadow text-gray-300 p-4 relative">
                    {outputMessages.map((message, index) => {
                      return <div className="text-base font-bold border-slate-700	border-b-2" key={index}><p className={`text-${message[1]}-300`}>{message[0]}</p></div>;
                    })}
                    {/* <p className="text-xl font-bold">Once mm2 is run, daemon output is rendered here</p>               */}
                    <div ref={outputBottomRef} className="text-blue-300 text-violet-300 text-red-300 text-yellow-300 text-nuetral-300" />

                  </div>
                  <div className="absolute w-[80px] h-auto bottom-[20px] right-[30px] top-1/2 -translate-y-1/2 bg-slate-500 opacity-40 hover:opacity-100 justify-around flex flex-col">
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="scroll-output"
                          aria-describedby="scroll-output"
                          name="scroll output"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={scrollOutputChecked}
                          onChange={scrollOutputOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="scroll-output" className="font-medium text-gray-300">
                          Always scroll to bottom
                        </label>
                      </div>
                    </div>
                    {/* <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="collapse-output"
                          aria-describedby="collapse-output"
                          name="collapse output"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={collapseOutputChecked}
                          onChange={collapseOutputOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="collapse-output" className="font-medium text-gray-300">
                          Collapse
                        </label>
                      </div>
                  </div> 
                    <div className="relative flex flex-col items-center mx-auto border-t-2 mt-2">
                      <label className="text-base font-medium text-gray-300">Log level</label>
                      <fieldset className="mt-2">
                        <legend className="sr-only">Log level</legend>
                        <div className="space-y-1">
                          {logLevels.map((logLevel) => (
                            <div key={logLevel.id} className="flex items-center">
                              <input
                                id={logLevel.id}
                                name="log-level"
                                type="radio"
                                defaultChecked={logLevel.id === 'info'}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={logLevel.id} className="ml-3 block text-sm font-medium text-gray-300">
                                {logLevel.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>*/}
                  </div>
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="grid h-full grid-cols-1 gap-4">
              <section aria-labelledby="section-2-title" className="flex flex-col justify-between">
                <div className='relative'>
                  <textarea id="wid_rpc_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2" defaultValue={requestData}></textarea>
                  {/* <div className="absolute w-[80px] bottom-[20px] right-[30px] top-1/2 -translate-y-1/2 bg-slate-500 opacity-40 hover:opacity-100 justify-around flex flex-col">
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="prettify-request"
                          aria-describedby="prettify-request"
                          name="prettify request"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={prettifyRequestChecked}
                          onChange={prettifyRequestOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="prettify-request" className="font-medium text-gray-300">
                          Prettify
                        </label>
                      </div>
                    </div>
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="collapse-request"
                          aria-describedby="collapse-request"
                          name="collapse request"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={collapseRequestChecked}
                          onChange={collapseRequestOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="collapse-request" className="font-medium text-gray-300">
                          Collapse
                        </label>
                      </div>
                    </div>
                  </div> */}
                </div>
                <button id="wid_mm2_rpc_button" className="inline-flex justify-center rounded-lg text-sm font-semibold my-2 px-4 bg-slate-500 text-gray-400 enabled:text-gray-700  enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500  h-[32px] w-[142px] mx-auto">
                  <span className="my-auto flex items-center">Send request</span>
                </button>
                <div className='relative'>
                  <textarea readOnly="readonly" id="wid_rpc_output" className="w-full h-[60vh] rounded-lg bg-slate-800 shadow text-gray-300 p-4" value={rpcResponse}>
                  </textarea>
                  {/* <div className="absolute w-[80px] bottom-[20px] right-[30px] top-1/2 -translate-y-1/2 bg-slate-500 opacity-40 hover:opacity-100 justify-around flex flex-col">
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="prettify-response"
                          aria-describedby="prettify-response"
                          name="prettify response"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={prettifyResponseChecked}
                          onChange={prettifyResponseOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="prettify-response" className="font-medium text-gray-300">
                          Prettify
                        </label>
                      </div>
                    </div>
                    <div className="relative flex flex-col items-center mx-auto">
                      <div className="flex h-5 items-center">
                        <input
                          id="collapse-response"
                          aria-describedby="collapse-response"
                          name="collapse response"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={collapseResponseChecked}
                          onChange={collapseResponseOnChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="collapse-response" className="font-medium text-gray-300">
                          Collapse
                        </label>
                      </div>
                    </div>
                  </div> */}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      {/* <footer>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="border-t border-gray-700 py-8 text-center text-sm text-gray-200 sm:text-left">
            <span className="block sm:inline">&copy; 2022 Komodo Platform</span>{' '}
          </div>
        </div>
      </footer> */}
    </div>
  )
}

export default App
