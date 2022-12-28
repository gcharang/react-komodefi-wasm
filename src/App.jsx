// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use.
// Currently, browsers don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import { useEffect, useRef, useState, Fragment } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

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

const getBaseUrl = () => {
  let url;
  switch (process.env.NODE_ENV) {
    case 'production':
      url = 'https://atomicdex-play.lordofthechains.com';
      break;
    case 'development':
    default:
      url = 'http://localhost:1234';
  }

  return url;
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
  const [outputMessages, setOutputMessages] = useState([["Once mm2 is started, daemon output is rendered here", "blue"]]);

  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [customMM2, setCustomMM2] = useState(null)
  const [customCoins, setCustomCoins] = useState(null)


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
        "method": "version"
    },
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
            "https://eth1.cipig.net:18555"
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

  async function init_wasm(mm2_pointer) {
    try {
      if (mm2_pointer) {
        await init(mm2_pointer);
      } else {
        const baseUrl = getBaseUrl()
        let mm2BinUrl = new URL(baseUrl + "/mm2_bg.wasm")
        await init(mm2BinUrl);
      }
      spawn_mm2_status_checking();
    } catch (e) {
      alert(`Oops: ${e}`);
    }
  }

  function spawn_mm2_status_checking() {
    setInterval(function () {
      const run_button = document.getElementById("wid_run_mm2_button");
      const rpc_button = document.getElementById("wid_mm2_rpc_button");
      const custom_button = document.getElementById("set_custom_mm2_coins");
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
          custom_button.disabled = false;
          setMm2BtnText(() => 'Run mm2')
          break;
        case MainStatus.RpcIsUp:
          //  console.log("RpcIsUp")
          rpc_button.disabled = false;
          run_button.stop_btn = true;
          custom_button.disabled = true;
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

  async function run_mm2(params, handle_log, mm2_pointer) {
    if (mm2_pointer) {
      await init_wasm(mm2_pointer)
    } else {
      await init_wasm()
    }

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

  async function handleMM2ButtonClick(e) {
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
      if (customMM2) {
        await run_mm2(params, handle_log, customMM2);
      } else {
        await run_mm2(params, handle_log);
      }
    }
  }

  async function handleRpcButtonClick() {
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
  }

  useEffect(() => {
    /* (async () => {
       await init_wasm()
       spawn_mm2_status_checking();
     })();
 
     return () => {
       // this now gets called when the component unmounts
     };*/

    const run_button = document.getElementById("wid_run_mm2_button");
    const rpc_button = document.getElementById("wid_mm2_rpc_button");
    const custom_button = document.getElementById("set_custom_mm2_coins");

    rpc_button.disabled = true;
    run_button.disabled = false;
    custom_button.disabled = false;

    /* init_wasm().then(function () {
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
    });*/

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
                  <textarea id="wid_conf_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2" defaultValue={confData}>
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
                <div className="flex flex-row">
                  <button id="wid_run_mm2_button" className="inline-flex justify-center rounded-lg text-sm font-semibold  px-4 my-2 bg-slate-500 text-gray-400 enabled:text-gray-700 enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500 h-[32px] w-[142px] mx-auto" onClick={handleMM2ButtonClick}>
                    <span className="my-auto flex items-center">{mm2BtnText}</span>
                  </button>
                  <button id="set_custom_mm2_coins" className="inline-flex justify-center rounded-lg text-sm font-semibold  px-4 my-2 bg-slate-500 text-gray-400 enabled:text-gray-700 enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500 h-[32px] w-auto mx-auto" onClick={() => setCustomDialogOpen(true)}>
                    <span className="my-auto flex items-center">Set custom mm2/coins</span>
                  </button></div>
                <div className='relative'>
                  <div id="wid_mm2_output" className="w-full h-[60vh] overflow-y-scroll rounded-lg bg-slate-800 shadow text-gray-300 p-4 relative">
                    {outputMessages.map((message, index) => {
                      return <div className="text-base font-bold border-slate-700	border-b-2" key={index}><p className={`text-${message[1]}-300`}>{message[0]}</p></div>;
                    })}
                    {/* <p className="text-xl font-bold">Once mm2 is started, daemon output is rendered here</p>               */}
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
                <button id="wid_mm2_rpc_button" className="inline-flex justify-center rounded-lg text-sm font-semibold my-2 px-4 bg-slate-500 text-gray-400 enabled:text-gray-700  enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500  h-[32px] w-[142px] mx-auto" onClick={handleRpcButtonClick}>
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
      <Transition.Root show={customDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setCustomDialogOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Payment successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                      onClick={() => setCustomDialogOpen(false)}
                    >
                      Go back to dashboard
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
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
