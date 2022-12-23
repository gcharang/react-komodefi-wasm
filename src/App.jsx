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
    let mm2BinUrl = new URL(baseUrl + "/mm2_bg.wasm")
    await init(mm2BinUrl);
  } catch (e) {
    alert(`Oops: ${e}`);
  }
}

// async function run_mm2_on_click() {
//   try {
//     const response = await mm2_rpc(request_js);
//     console.log(response);
//     const conf = document.getElementById("wid_conf_input").value || document.getElementById("wid_conf_input").defaultValue;
//         console.log(conf)
//   } catch (e) {
//     console.log(e)
//   }
// }




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






function App() {
  const outputBottomRef = useRef(null);
  const [outputMessages, setOutputMessages] = useState([["Once mm2 is run, daemon output is rendered here", "blue"]]);

  const initialMm2BtnText = 'Run mm2';
  const [mm2BtnText, setMm2BtnText] = useState(initialMm2BtnText);
  const [mm2UserPass, setMm2UserPass] = useState("");
  const [rpcResponse, setRpcResponse] = useState("Once a request is sent, mm2's response is displayed here")
  const mm2BtnTextRef = useRef()
  const mm2UserPassRef = useRef()
  const rpcResponseRef = useRef()
  mm2BtnTextRef.current = mm2BtnText
  mm2UserPassRef.current = mm2UserPass
  rpcResponseRef.current = rpcResponse

  /*useEffect(() => {
   // 👇️ simulate chat Messages flowing in
   setInterval(
     () =>
       setOutputMessages(current => [
         ...current,
         ['Lorem ipsum dolor sit amet consectetur, adipisicing elit. Porro, quaerat eum id obcaecati, magnam voluptatum dolorem sunt, omnis sed consectetur necessitatibus blanditiis ipsa? Cumque architecto, doloribus mollitia velit non sint!'+Date.now(),"blue"],
       ]),
     600,
   );
 }, []);*/

  useEffect(() => {
    // 👇️ scroll to bottom every time outputMessages change
    let nOfOutputMsgs = outputMessages.length
    if (nOfOutputMsgs > 500) {
      setOutputMessages(current => current.slice(-500))
      //outputMessages = outputMessages.slice(-20)
      // outputMessages.splice(0,nOfOutputMsgs-20)
    }
    outputBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputMessages]);


  function spawn_mm2_status_checking() {
    setInterval(function () {
      const run_button = document.getElementById("wid_run_mm2_button");
      const rpc_button = document.getElementById("wid_mm2_rpc_button");

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
          setMm2BtnText(() => 'Run mm2')
          break;
        case MainStatus.RpcIsUp:
          //  console.log("RpcIsUp")
          rpc_button.disabled = false;
          run_button.stop_btn = true;
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
        // console.log(line);
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
        setRpcResponse(() =>response);
      });
    });

    // empty dependency array means this effect will only run once (like componentDidMount in classes)
  }, []);

  return (
    <div>
      <main className="h-screen">
        <div className="h-[96vh] pt-2 my-auto mx-auto max-w-[90%]">
          {/* Main 3 column grid */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
            {/* Left column */}
            <div className="grid h-full  grid-cols-1 gap-4 lg:col-span-2">
              <section aria-labelledby="section-1-title" className="flex flex-col justify-between">
                <textarea id="wid_conf_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2" defaultValue={`{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "allow_weak_password": true,
    "rpc_password": "testpsw",
    "netid": 7777
}`}>
                </textarea>

                <button id="wid_run_mm2_button" className="inline-flex justify-center rounded-lg text-sm font-semibold  px-4 my-2 bg-slate-500 text-gray-400 enabled:text-gray-700 enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500 h-[32px] w-[142px] mx-auto">
                  <span className="my-auto flex items-center">{mm2BtnText}</span>
                </button>
                <div id="wid_mm2_output" className="w-full h-[60vh] overflow-y-scroll rounded-lg bg-slate-800 shadow text-gray-300 p-4">
                  {outputMessages.map((message, index) => {
                    return <div className="text-base font-bold border-slate-700	border-b-2" key={index}><p className={`text-${message[1]}-300`}>{message[0]}</p></div>;
                  })}
                  {/* <p className="text-xl font-bold">Once mm2 is run, daemon output is rendered here</p>               */}
                  <div ref={outputBottomRef} className="text-blue-300 text-violet-300 text-red-300 text-yellow-300 text-nuetral-300" />
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="grid h-full grid-cols-1 gap-4">
              <section aria-labelledby="section-2-title" className="flex flex-col justify-between">

                <textarea id="wid_rpc_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2" defaultValue={`[
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
]`}></textarea>
                <button id="wid_mm2_rpc_button" className="inline-flex justify-center rounded-lg text-sm font-semibold my-2 px-4 bg-slate-500 text-gray-400 enabled:text-gray-700  enabled:hover:text-gray-100 enabled:bg-slate-100 enabled:hover:bg-blue-500  h-[32px] w-[142px] mx-auto">
                  <span className="my-auto flex items-center">Send request</span>
                </button>
                <textarea readOnly="readonly" id="wid_rpc_output" className="w-full h-[60vh] rounded-lg bg-slate-800 shadow text-gray-300 p-4" value={rpcResponse}>
                </textarea>
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
