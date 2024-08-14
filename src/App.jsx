import { Tab } from "@headlessui/react";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { MenuIcon } from "./components/IconComponents";
import Mm2LogsPanel from "./components/Mm2LogsPanel";
import Mm2Panel from "./components/Mm2Panel";
import RpcPanel from "./components/RpcPanel";
import RpcResponsePanel from "./components/RpcResponsePanel";
import SideBar from "./components/SideBar";
import { WarningDialog } from "./components/WarningModal";
import { debounce } from "./shared-functions/debounce";
import { DocsModal } from "./components/Docs";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function App() {
  const [windowSizes, setWindowSizes] = useState({
    sidebar: 40,
    bottomBar: 220, // the menubar above it is 40px
    leftPane: null,
    rightPane: null,
  });

  const [currentLayout, setCurrentLayout] = useState("initializing");

  const handleUiLayoutBtwMobileAndDesktop = () => {
    if (window.innerWidth >= 640) setCurrentLayout("desktop");
    else setCurrentLayout("mobile");
  };
  const debounceOnResize = debounce(handleUiLayoutBtwMobileAndDesktop);
  useEffect(() => {
    handleUiLayoutBtwMobileAndDesktop();
    window.addEventListener("resize", debounceOnResize, {
      passive: true,
    });
    return () => {
      window.removeEventListener("resize", debounceOnResize, true);
    };
  }, []);

  return (
    <div
      className={`${inter.className} h-full bg-primaryBg-900 min-h-screen relative`}
    >
      <DocsModal />
      <WarningDialog />
      {currentLayout === "initializing" ||
        (currentLayout === "desktop" && (
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
                      flex: `0 0 ${
                        !windowSizes.leftPane
                          ? "50%"
                          : `calc(${windowSizes.leftPane}px)`
                      }`,
                    }}
                    className="h-full text-gray-300"
                  >
                    <Mm2Panel />
                  </div>
                  <div
                    draggable
                    onDragEnd={(elem) => {
                      // console.log(elem.clientX);

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
                  <Mm2LogsPanel
                    windowSizes={windowSizes}
                    setWindowSizes={setWindowSizes}
                  />
                  <RpcResponsePanel />
                </div>
              </div>
            </div>
          </div>
        ))}

      {currentLayout === "mobile" && (
        <Tab.Group as="div" className="w-full h-full flex flex-col">
          <div className="flex-none">
            <Tab.List className="flex w-full space-x-1 bg-[#182347] p-1 mx-auto">
              {["MM2", "CONFIG", "LOGS", "RESULT"].map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                      "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white text-blue-700 shadow"
                        : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <Tab.Panels className="flex-1 overflow-y-auto">
            <Tab.Panel className="h-full">
              <div className="h-full text-gray-300">
                <Mm2Panel />
              </div>
            </Tab.Panel>
            <Tab.Panel className="h-full">
              <div className="h-full text-gray-300">
                <RpcPanel />
              </div>
            </Tab.Panel>
            <Tab.Panel className="h-full">
              <div className="h-full text-gray-300">
                <Mm2LogsPanel />
              </div>
            </Tab.Panel>
            <Tab.Panel className="h-full">
              <div className="h-full text-gray-300">
                <RpcResponsePanel />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
}

export default App;
