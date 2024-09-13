import { useEffect, useRef, useState } from "react";
import { useExternalDocsState } from "../store/externalDocs";
import { useVisibilityState } from "../store/modals";
import { ModalIds } from "../store/modals/modalIds";
import { docsBaseUrl } from "../store/staticData";

export const DocsModal = () => {
  const { imVisible, hideModal, visibleModals } = useVisibilityState();
  const { externalDocsState } = useExternalDocsState();

  const [isIframeLoading, setIsIframeLoading] = useState(true); // Add loading state
  const iframeRef = useRef(null);

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };
  useEffect(() => {
    if (!isIframeLoading && externalDocsState.response) {
      iframeRef.current.contentWindow.postMessage(
        {
          requestId: externalDocsState.id,
          response: externalDocsState.response,
          label: externalDocsState.label,
          tag: externalDocsState.tag,
        },
        {
          targetOrigin: docsBaseUrl,
        }
      );
    }
  }, [externalDocsState, isIframeLoading]);

  useEffect(() => {
    if (imVisible(ModalIds.docsModal))
      iframeRef.current?.contentWindow?.focus();
  }, [imVisible(ModalIds.docsModal)]);

  const removeTrailingSlash = (string) => {
    return string.replace(/\/+$/, "");
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
          </div>
          {isIframeLoading && (
            <p className="text-white font-semibold text-center m-2">
              Loading Docs...
            </p>
          )}
          <iframe
            ref={iframeRef}
            allow="clipboard-read *; clipboard-write *"
            id="docs-iframe"
            aria-hidden
            width={"100%"}
            height={"100%"}
            onLoad={handleIframeLoad}
            className="w-full h-full"
            src={
              externalDocsState.sourceUrl
                ? `${removeTrailingSlash(externalDocsState.sourceUrl)}#${externalDocsState.id}`
                : docsBaseUrl + "/en/docs/start-here/"
            }
          />
        </div>
      </div>
    </div>
  );
};
