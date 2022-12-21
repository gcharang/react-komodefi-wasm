import { Fragment } from 'react'
import { Menu, Popover, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'


function App() {

  return (
    <div className="h-full">
      <main className="h-full">
        <div className="h-[96vh] mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="sr-only">Page title</h1>
          {/* Main 3 column grid */}
          <div className="pt-10 pb-8 h-[96vh] grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
            {/* Left column */}
            <div className="grid h-full grid-cols-1 gap-4">
              <section aria-labelledby="section-2-title" className="flex flex-col justify-between">
                <h2 className="sr-only" id="section-2-title">
                  Section title
                </h2>

                <textarea id="wid_conf_input" class="w-full h-[28%] rounded-lg bg-slate-800 shadow text-gray-300 p-2">{`{
    "gui": "WASMTEST",
    "mm2": 1,
    "passphrase": "wasmtest",
    "allow_weak_password": true,
    "rpc_password": "testpsw",
    "netid": 7777
}`}
                </textarea>

                <button id="wid_run_mm2_button" disabled="disabled" className="inline-flex justify-center rounded-lg text-sm font-semibold  px-4 m-4 bg-slate-300 text-gray-500 hover:bg-slate-100 h-[5%] w-[40%] mx-auto">
                  <span class="my-auto flex items-center">Run mm2</span>
                </button>
                <textarea id="wid_conf_input" class="w-full h-[58%] rounded-lg bg-slate-800 shadow text-gray-300 p-2" >{`[
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
                <button id="wid_mm2_rpc_button" disabled="disabled" className="inline-flex justify-center rounded-lg text-sm font-semibold m-4 px-4 bg-slate-300 text-gray-500 hover:bg-slate-100 h-[5%] w-[40%] mx-auto">
                  <span class="my-auto flex items-center">Send request</span>
                </button>
              </section>
            </div>

            {/* Right column */}
            <div className="grid h-[90vh] max-h-[90vh] grid-cols-1 gap-4 lg:col-span-2">
              <section aria-labelledby="section-1-title">
                <h2 className="sr-only" id="section-1-title">
                  Section title
                </h2>
                <div className="overflow-y-scroll h-full rounded-lg bg-slate-800 shadow">
                  <div className="p-6">{/* Your content */}</div>
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
