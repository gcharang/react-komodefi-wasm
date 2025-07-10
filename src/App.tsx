import { useEffect, useState } from "react";
import Mm2LogsPanel from "./components/Mm2LogsPanel";
import Mm2Panel from "./components/Mm2Panel";
import RpcPanel from "./components/RpcPanel";
import SideBar from "./components/SideBar";
import RpcResponsePanel from "./components/RpcResponsePanel";
import { MenuIcon } from "./components/IconComponents";
import { WarningDialog } from "./components/WarningModal";

interface WindowSizes {
  sidebar: number;
  bottomBar: number;
  leftPane: number | null;
  rightPane: number | null;
}

function App() {
  const [windowSizes, setWindowSizes] = useState<WindowSizes>({
    sidebar: 48, // Slightly wider for better visual balance
    bottomBar: 280, // More space for logs
    leftPane: null, // Will use 50% by default
    rightPane: null,
  });

  return (
    <div className="h-full bg-gradient-to-br from-primary-bg-950 to-primary-bg-900 min-h-screen relative">
      <WarningDialog />
      <div className="flex h-full m-auto max-w-[2200px]">
        <div className="h-full flex justify-between bg-primary-bg-800/50 backdrop-blur-sm text-text-secondary border-r border-border-primary">
          <div
            style={{
              width: windowSizes.sidebar,
            }}
            className="w-40"
          >
            <div className="w-full p-2 flex-[0_0_auto] bg-primary-bg-800/50 text-text-secondary h-10 border-b border-border-primary">
              <MenuIcon className="cursor-not-allowed w-6 h-6 hover:text-accent transition-colors duration-200" />
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
                      ? "calc(50% - 0.25rem)" // Account for half of the w-2 (0.5rem) divider
                      : `${windowSizes.leftPane}px`
                  }`,
                }}
                className="h-full text-gray-300"
              >
                <Mm2Panel />
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  // Calculate the actual current width of the left panel
                  const leftPanelElement = e.currentTarget.previousElementSibling as HTMLElement;
                  const startWidth = windowSizes.leftPane || leftPanelElement.offsetWidth;

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const newWidth = startWidth + deltaX;
                    const minWidth = 300;
                    const maxWidth = window.innerWidth - windowSizes.sidebar - 300;
                    
                    setWindowSizes(prev => ({
                      ...prev,
                      leftPane: Math.max(minWidth, Math.min(maxWidth, newWidth)),
                    }));
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = '';
                    document.body.classList.remove('resizing');
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  document.body.style.cursor = 'ew-resize';
                  document.body.classList.add('resizing');
                }}
                className="cursor-ew-resize w-2 bg-primary-bg-800/50 hover:bg-accent/30 transition-all duration-200 h-full relative group resize-handle"
                title="Drag to resize panels"
              >
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-px bg-border-primary group-hover:bg-accent/50 transition-colors duration-200"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex flex-col gap-1">
                    <div className="w-1 h-1 bg-accent rounded-full"></div>
                    <div className="w-1 h-1 bg-accent rounded-full"></div>
                    <div className="w-1 h-1 bg-accent rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 h-full text-gray-300">
                <RpcPanel />
              </div>
            </div>
          </div>
          <div className="flex-[0_0_auto]">
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = windowSizes.bottomBar;

                const handleMouseMove = (e: MouseEvent) => {
                  const deltaY = startY - e.clientY;
                  const newHeight = startHeight + deltaY;
                  const minHeight = 100;
                  const maxHeight = window.innerHeight * 0.6;
                  
                  setWindowSizes(prev => ({
                    ...prev,
                    bottomBar: Math.max(minHeight, Math.min(maxHeight, newHeight)),
                  }));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  document.body.style.cursor = '';
                  document.body.classList.remove('resizing');
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = 'ns-resize';
                document.body.classList.add('resizing');
              }}
              className="cursor-ns-resize w-full h-2 bg-primary-bg-800/50 hover:bg-accent/30 transition-all duration-200 relative group resize-handle"
              title="Drag to resize panels"
            >
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-px bg-border-primary group-hover:bg-accent/50 transition-colors duration-200"></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-accent rounded-full"></div>
                  <div className="w-1 h-1 bg-accent rounded-full"></div>
                  <div className="w-1 h-1 bg-accent rounded-full"></div>
                </div>
              </div>
            </div>
            <div
              style={{
                height: windowSizes.bottomBar,
              }}
              className="flex text-white bg-primary-bg-900/50 relative rounded-b-lg overflow-hidden shadow-lg"
            >
              <div className="flex-1 overflow-hidden">
                <Mm2LogsPanel
                  windowSizes={windowSizes}
                  setWindowSizes={setWindowSizes}
                />
              </div>
              <div className="relative">
                <div className="w-px h-full bg-gradient-to-b from-transparent via-border-primary to-transparent"></div>
                <div className="absolute inset-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent blur-sm"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <RpcResponsePanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
