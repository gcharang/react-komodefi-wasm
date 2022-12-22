// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use.
// Currently, browsers don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import {useEffect, useRef, useState} from 'react';

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
import ScrollToBottom from 'react-scroll-to-bottom';

const LOG_LEVEL = LogLevel.Debug;

// Loads the wasm file, so we use the
// default export to inform it where the wasm file is located on the
// server, and then we wait on the returned promise to wait for the
// wasm to be loaded.
async function init_wasm() {
  try {
    await init();
  } catch (e) {
    alert(`Oops: ${e}`);
  }
}

async function run_mm2(params) {
  // run an MM2 instance
  try {
    const version = mm2_version();
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

function handle_log(level, line) {
  switch (level) {
    case LogLevel.Off:
      break;
    case LogLevel.Error:
      console.error(line);
      break;
    case LogLevel.Warn:
      console.warn(line);
      break;
    case LogLevel.Info:
      console.info(line);
      break;
    case LogLevel.Debug:
      console.log(line);
      break;
    case LogLevel.Trace:
    default:
      // The console.trace method outputs some extra trace from the generated JS glue code which we don't want.
      console.debug(line);
      break;
  }
}

function spawn_mm2_status_checking() {
  setInterval(function () {
    const run_button = document.getElementById("wid_run_mm2_button");
    const rpc_button = document.getElementById("wid_mm2_rpc_button");

    const status = mm2_main_status();
    switch (status) {
      case MainStatus.NotRunning:
      case MainStatus.NoContext:
      case MainStatus.NoRpc:
        rpc_button.disabled = true;
        run_button.disabled = false;
        break;
      case MainStatus.RpcIsUp:
        rpc_button.disabled = false;
        run_button.disabled = true;
        break;
      default:
        throw new Error(`Expected MainStatus, found: ${status}`);
    }
  }, 100)
}


function App() {
  const outputBottomRef = useRef(null);

  const [outputMessages, setOutputMessages] = useState([]);

  useEffect(() => {
    // 👇️ simulate chat outputMessages flowing in
    setInterval(
      () =>
        setOutputMessages(current => [
          ...current,
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Porro, quaerat eum id obcaecati, magnam voluptatum dolorem sunt, omnis sed consectetur necessitatibus blanditiis ipsa? Cumque architecto, doloribus mollitia velit non sint!'+Date.now(),
        ]),
      600,
    );
  }, []);

  useEffect(() => {
    // 👇️ scroll to bottom every time outputMessages change
    let nOfOutputMsgs = outputMessages.length
    if (nOfOutputMsgs > 20) {
      //outputMessages = outputMessages.slice(-20)
      outputMessages.splice(0,nOfOutputMsgs-20)
    }
    outputBottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [outputMessages]);

  return (
    <div>
      <main className="h-screen">
        <div className="h-[96vh] pt-2 my-auto mx-auto max-w-[90%]">
          {/* Main 3 column grid */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
            {/* Left column */}
            <div className="grid h-full  grid-cols-1 gap-4 lg:col-span-2">
              <section aria-labelledby="section-1-title" className="flex flex-col justify-between">
                <textarea id="wid_conf_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2">{`{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "allow_weak_password": true,
    "rpc_password": "testpsw",
    "netid": 7777
}`}
                </textarea>

                <button id="wid_run_mm2_button" disabled="disabled" className="inline-flex justify-center rounded-lg text-sm font-semibold  px-4 my-2 bg-slate-300 text-gray-500 hover:bg-slate-100 h-[32px] w-[142px] mx-auto">
                  <span className="my-auto flex items-center">Run mm2</span>
                </button>
                <div readOnly="readonly" id="wid_mm2_output" className="w-full h-[60vh] overflow-y-scroll rounded-lg bg-slate-800 shadow text-gray-300 p-4">
                {outputMessages.map((message, index) => {
          return <div className="text-base font-bold border-slate-700	border-b-2" key={index}><p className="">{message}</p></div>;
        })}
                    {/* <p className="text-xl font-bold">Once mm2 is run, daemon output is rendered here</p>               */}
                    <div ref={outputBottomRef} />
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="grid h-full grid-cols-1 gap-4">
              <section aria-labelledby="section-2-title" className="flex flex-col justify-between">

                <textarea id="wid_rpc_input" className="w-full h-[30vh] rounded-lg bg-slate-800 shadow text-gray-300 p-2" >{`[
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
]`}
                </textarea>
                <button id="wid_mm2_rpc_button" disabled="disabled" className="inline-flex justify-center rounded-lg text-sm font-semibold my-2 px-4 bg-slate-300 text-gray-500 hover:bg-slate-100  h-[32px] w-[142px] mx-auto">
                  <span className="my-auto flex items-center">Send request</span>
                </button>
                <textarea readOnly="readonly" id="wid_rpc_output" className="w-full h-[60vh] rounded-lg bg-slate-800 shadow text-gray-300 p-4">Once a request is sent, mm2's response is displayed here
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
