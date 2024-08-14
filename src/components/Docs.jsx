import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useVisibilityState } from "../store/modals";
import { ModalIds } from "../store/modals/modalIds";
import { docsBaseUrl } from "../store/staticData";
import { useMm2PanelState } from "../store/mm2";

export const DocsModal = () => {
  const { imVisible, hideModal, showModal } = useVisibilityState();
  const { mm2PanelState, setMm2PanelState } = useMm2PanelState();

  const [isIframeLoading, setIsIframeLoading] = useState(true); // Add loading state
  const iframeRef = useRef(null);

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  return (
    <div
      aria-hidden
      className={`fixed z-40 inset-0 overflow-y-auto ${
        imVisible(ModalIds.docsModal) ? "block" : "hidden"
      }`}
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-[2000px] h-[95vh] max-h- transform overflow-none pb-2 rounded-2xl bg-primaryLighter text-left align-middle shadow-xl transition-all">
          <div className="flex justify-end bg-[#051019]">
            <button
              onClick={() => hideModal(ModalIds.docsModal)}
              className="p-1 m-2 transition-background inline-flex text-sm border-2 rounded-lg text-sky-500 border-sky-700 dark:text-blue-400 bg-slate-800 hover:bg-slate-900"
            >
              Close Docs
            </button>
            <span className="text-white">
              {mm2PanelState.mm2Running ? "true" : "false"}
            </span>
          </div>
          {isIframeLoading && (
            <p className="text-white font-semibold text-center m-2">
              Loading Docs...
            </p>
          )}
          <iframe
            ref={iframeRef}
            id="docs-iframe"
            aria-hidden
            width={"100%"}
            height={"100%"}
            onLoad={handleIframeLoad}
            className="w-full h-full"
            src={docsBaseUrl + "/en/docs"}
          />
        </div>
      </div>
    </div>
  );
};
