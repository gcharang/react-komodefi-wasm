import { useState, useEffect } from "react";
import type { AppWindowSizes, TabType } from "./types/components";
import Mm2LogsPanel from "./components/Mm2LogsPanel";
import Mm2Panel from "./components/Mm2Panel";
import RpcPanel from "./components/RpcPanel";
import RpcResponsePanel from "./components/RpcResponsePanel";
import { MenuIcon } from "./components/IconComponents";
import { WarningDialog } from "./components/WarningModal";
import Toast from "./components/Toast";
import { useToastState } from "./store/useStore";

function App() {
  const [windowSizes, setWindowSizes] = useState<AppWindowSizes>({
    bottomBar: 280, // More space for logs
    leftPane: null, // Will use 50% by default
    rightPane: null,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('mm2');
  const { toast, hideToast } = useToastState();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-primary-bg-950 to-primary-bg-900 min-h-screen relative">
      <WarningDialog />
      <div className="h-full m-auto max-w-[2200px] p-2 md:p-4">
        <div className="w-full h-full flex flex-col">
          {isMobile ? (
            // Mobile Layout with Tabs
            <div className="flex flex-col h-full">
              {/* Tab Navigation */}
              <div className="flex border-b border-border-primary bg-primary-bg-800/95 backdrop-blur-xl rounded-t-lg">
                <button
                  onClick={() => setActiveTab('mm2')}
                  className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 ${
                    activeTab === 'mm2'
                      ? 'text-accent border-b-2 border-accent bg-primary-bg-700/50'
                      : 'text-text-muted hover:text-text-primary hover:bg-primary-bg-700/30'
                  }`}
                >
                  MM2 Config
                </button>
                <button
                  onClick={() => setActiveTab('rpc')}
                  className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 ${
                    activeTab === 'rpc'
                      ? 'text-accent border-b-2 border-accent bg-primary-bg-700/50'
                      : 'text-text-muted hover:text-text-primary hover:bg-primary-bg-700/30'
                  }`}
                >
                  RPC
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 ${
                    activeTab === 'logs'
                      ? 'text-accent border-b-2 border-accent bg-primary-bg-700/50'
                      : 'text-text-muted hover:text-text-primary hover:bg-primary-bg-700/30'
                  }`}
                >
                  Logs
                </button>
                <button
                  onClick={() => setActiveTab('response')}
                  className={`flex-1 py-2 px-3 text-xs font-medium transition-all duration-200 ${
                    activeTab === 'response'
                      ? 'text-accent border-b-2 border-accent bg-primary-bg-700/50'
                      : 'text-text-muted hover:text-text-primary hover:bg-primary-bg-700/30'
                  }`}
                >
                  Response
                </button>
              </div>
              
              {/* Active Panel Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'mm2' && <Mm2Panel />}
                {activeTab === 'rpc' && (
                  <RpcPanel 
                    isMobile={true} 
                    onSwitchToResponse={() => setActiveTab('response')} 
                  />
                )}
                {activeTab === 'logs' && (
                  <div className="h-full bg-primary-bg-800/95 backdrop-blur-xl rounded-b-lg shadow-2xl ring-1 ring-accent/20">
                    <Mm2LogsPanel windowSizes={windowSizes} setWindowSizes={setWindowSizes} />
                  </div>
                )}
                {activeTab === 'response' && (
                  <div className="h-full bg-primary-bg-800/95 backdrop-blur-xl rounded-b-lg shadow-2xl ring-1 ring-accent/20">
                    <RpcResponsePanel />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Desktop Layout (existing)
            <>
              <div className="flex-1 min-h-0">
                <div className="flex w-full h-full">
              <div
                style={{
                  flex: `0 0 ${
                    !windowSizes.leftPane
                      ? "calc(50% - 0.25rem)" // Account for half of the w-2 (0.5rem) divider
                      : `${windowSizes.leftPane}px`
                  }`,
                }}
                className="h-full text-gray-300 min-w-0"
              >
                <Mm2Panel />
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  // Calculate the actual current width of the left panel
                  const leftPanelElement = e.currentTarget
                    .previousElementSibling as HTMLElement;
                  const startWidth =
                    windowSizes.leftPane || leftPanelElement.offsetWidth;

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const newWidth = startWidth + deltaX;
                    const minWidth = 300;
                    const maxWidth = window.innerWidth - 300;

                    setWindowSizes((prev) => ({
                      ...prev,
                      leftPane: Math.max(
                        minWidth,
                        Math.min(maxWidth, newWidth)
                      ),
                    }));
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    document.body.style.cursor = "";
                    document.body.classList.remove("resizing");
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                  document.body.style.cursor = "ew-resize";
                  document.body.classList.add("resizing");
                }}
                className="cursor-ew-resize w-2 bg-primary-bg-500/50 hover:bg-accent/30 transition-all duration-200 h-full relative group resize-handle"
                title="Drag to resize panels"
              >
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-px bg-border-primary group-hover:bg-accent/50 transition-colors duration-200"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex flex-col gap-1">
                    <div className="w-1 h-1 bg-text-muted group-hover:bg-accent rounded-full transition-colors duration-200"></div>
                    <div className="w-1 h-1 bg-text-muted group-hover:bg-accent rounded-full transition-colors duration-200"></div>
                    <div className="w-1 h-1 bg-text-muted group-hover:bg-accent rounded-full transition-colors duration-200"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 h-full text-gray-300">
                <RpcPanel isMobile={false} />
              </div>
            </div>
          </div>
          <div className="flex-[0_0_auto] min-h-0">
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

                  setWindowSizes((prev) => ({
                    ...prev,
                    bottomBar: Math.max(
                      minHeight,
                      Math.min(maxHeight, newHeight)
                    ),
                  }));
                };

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                  document.body.style.cursor = "";
                  document.body.classList.remove("resizing");
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = "ns-resize";
                document.body.classList.add("resizing");
              }}
              className="cursor-ns-resize w-full h-2 bg-primary-bg-500/50 hover:bg-accent/30 transition-all duration-200 relative group resize-handle"
              title="Drag to resize panels"
            >
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-px bg-border-primary group-hover:bg-accent/50 transition-colors duration-200"></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-text-muted group-hover:bg-accent rounded-full transition-colors duration-200"></div>
                  <div className="w-1 h-1 bg-text-muted group-hover:bg-accent rounded-full transition-colors duration-200"></div>
                  <div className="w-1 h-1 bg-text-muted group-hover:bg-accent rounded-full transition-colors duration-200"></div>
                </div>
              </div>
            </div>
            <div
              style={{
                height: windowSizes.bottomBar,
              }}
              className="flex text-white bg-primary-bg-800/95 backdrop-blur-xl relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-accent/20"
            >
              <div className="flex-1 min-w-0 overflow-hidden">
                <Mm2LogsPanel
                  windowSizes={windowSizes}
                  setWindowSizes={setWindowSizes}
                />
              </div>
              <div className="relative mx-1">
                {/* <div className="w-px h-full bg-gradient-to-b from-transparent via-border-primary to-transparent"></div> */}
                <div className="w-px h-full bg-primary-bg-500/50"></div>
                <div className="absolute inset-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent blur-sm"></div>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <RpcResponsePanel />
              </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default App;
