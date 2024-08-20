import { useEffect, useState } from 'react';

import { MenuIcon } from './components/IconComponents';
import Mm2LogsPanel from './components/Mm2LogsPanel';
import Mm2Panel from './components/Mm2Panel';
import RpcPanel from './components/RpcPanel';
import RpcResponsePanel from './components/RpcResponsePanel';
import SideBar from './components/SideBar';
import { WarningDialog } from './components/WarningModal';
import { rpcDefaultConfig } from './state-machine/staticData';

function App() {
  const [windowSizes, setWindowSizes] = useState({
    sidebar: 40,
    bottomBar: 220, // the menubar above it is 40px
    leftPane: null,
    rightPane: null,
  });

  return (
    <div className="h-full bg-primaryBg-900 min-h-screen relative">
      <WarningDialog />
      <div className="flex h-full m-auto max-w-[2200px]">
        <div className="h-full flex justify-between bg-primaryLight text-[#a2a3bd]">
          <div
            style={{
              width: windowSizes.sidebar,
            }}
            className="w-40"
          >
            <div className="w-full p-2 flex-[0_0_auto] bg-primaryLight text-[#a2a3bd] h-10">
              <MenuIcon className="cursor-not-allowed w-6 h-6 hover:text-white" />
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
                  flex: `0 0 ${!windowSizes.leftPane ? '50%' : `calc(${windowSizes.leftPane}px)`}`,
                }}
                className="h-full text-gray-300"
              >
                <Mm2Panel />
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
                <RpcPanel />
              </div>
            </div>
          </div>
          <div className="flex-[0_0_auto]">
            <div
              draggable
              onDragEnd={(elem) => {
                setWindowSizes({
                  ...windowSizes,
                  bottomBar:
                    window.innerHeight - elem.clientY >= 80
                      ? window.innerHeight - elem.clientY
                      : 40,
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
              <Mm2LogsPanel windowSizes={windowSizes} setWindowSizes={setWindowSizes} />
              <RpcResponsePanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
