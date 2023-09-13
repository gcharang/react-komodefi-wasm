import { useState } from "react";
import Mm2LogsPanel from "./components/Mm2LogsPanel";
import Mm2Panel from "./components/Mm2Panel";
import RpcPanel from "./components/RpcPanel";
import SideBar from "./components/SideBar";
import RpcResponsePanel from "./components/RpcResponsePanel";
import { rpcDefaultConfig } from "./state-machine/staticData";
import { MenuIcon } from "./components/IconComponents";
// #a2a3bd

function App() {
  const [windowSizes, setWindowSizes] = useState({
    sidebar: 40,
    bottomBar: 220,
    leftPane: null,
    rightPane: null,
  });

  const [mm2State, setMm2State] = useState({
    mm2Running: false,
    startCommand: "Run MM2",
    mm2UserPass: "",
    mm2Config: `{
      "gui": "WASMTEST",
      "mm2": 1,
      "passphrase": "wasmtest",
      "allow_weak_password": true,
      "rpc_password": "testpsw",
      "netid": 7777
    }`,
    defaultConfig: `{}`,
  });

  const [rpcRequest, setRpcRequest] = useState({
    config: rpcDefaultConfig,
    requestResponse: ``,
  });

  const [mm2Logs, setMm2Logs] = useState({
    // add new logs here
    outputMessages: [
      ["Once mm2 is run, daemon output is rendered here", "blue"],
    ],
  });

  return (
    <div className="h-full min-h-screen relative">
      {/* <p className="h-10 text-xl text-center text-white">
        Use at your own risk. Do not store/load seeds/wallets with coins/tokens
        of any significant value
      </p> */}
      <div className="flex h-full">
        <div className="h-full flex justify-between bg-[#11182f] text-[#a2a3bd]">
          <div
            style={{
              width: windowSizes.sidebar,
            }}
            className="w-40"
          >
            <div className="w-full p-2 flex-[0_0_auto] bg-[#11182f] text-[#a2a3bd] h-10">
              <MenuIcon className="w-6 h-6 cursor-pointer hover:text-white" />
            </div>
            <SideBar />
          </div>
          {/* <div
            draggable
            onDragEnd={(elem) => {
              setWindowSizes({
                ...windowSizes,
                sidebar: elem.clientX,
              });
            }}
            className="cursor-ew-resize hover:border-t-gray-300 border-r border-r-gray-800 hover:bg-gray-700 hover:border-none p-1 h-full"
          ></div> */}
        </div>
        <div className="w-full h-full flex flex-col">
          <div className="flex-[1_0_auto]">
            <div className="flex w-full h-full">
              <div
                style={{
                  flex: `0 0 ${
                    !windowSizes.leftPane
                      ? "50%"
                      : `calc(${windowSizes.leftPane}px)`
                  }`,
                }}
                className="h-full text-gray-300"
              >
                <Mm2Panel
                  mm2State={mm2State}
                  setMm2State={setMm2State}
                  setMm2Logs={setMm2Logs}
                />
              </div>
              <div
                draggable
                onDragEnd={(elem) => {
                  console.log(elem.clientX);

                  setWindowSizes((previousValues) => ({
                    ...windowSizes,
                    leftPane: elem.clientX - windowSizes.sidebar,
                  }));
                }}
                className="cursor-ew-resize hover:border-t-gray-300 border-r border-r-gray-800 hover:bg-gray-700 hover:border-none p-1 h-full"
              ></div>
              <div className="flex-1 h-full text-gray-300">
                <RpcPanel
                  isMm2Running={mm2State.mm2Running}
                  rpcRequest={rpcRequest}
                  setRpcRequest={setRpcRequest}
                />
              </div>
            </div>
          </div>
          <div className="flex-[0_0_auto]">
            <div
              draggable
              onDragEnd={(elem) => {
                setWindowSizes({
                  ...windowSizes,
                  bottomBar: window.innerHeight - elem.clientY,
                });
              }}
              className="cursor-ns-resize hover:border-t-gray-300 w-full border-b border-b-gray-800 hover:bg-gray-700 hover:border-none p-1"
            ></div>
            <div
              style={{
                height: windowSizes.bottomBar,
              }}
              className="flex text-white"
            >
              <Mm2LogsPanel
                mm2Logs={mm2Logs.outputMessages}
                setMm2Logs={setMm2Logs}
              />
              <RpcResponsePanel
                rpcRequestResponse={rpcRequest.requestResponse}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
