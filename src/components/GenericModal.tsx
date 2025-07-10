import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useVisibilityState, useGenericModal } from "../store/useStore";
import { ModalIds } from "../store/modalIds";

export const GenericModal = () => {
  const { imVisible, hideModal } = useVisibilityState();
  const { genericModalState } = useGenericModal();

  return (
    <Dialog
      open={imVisible(ModalIds.genericModal)}
      onClose={() => hideModal(ModalIds.genericModal)}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-lighter p-6 text-left align-middle shadow-xl transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-lg font-medium leading-6 text-slate-300">
            {genericModalState.titleComponent}
          </DialogTitle>
          <div className="mt-2 text-sm text-gray-400">
            {genericModalState.messageComponent}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              className="min-w-[100px] inline-flex justify-center rounded-md border bg-transparent border-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-[#182347] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => {
                genericModalState.onCancel();
                hideModal(ModalIds.genericModal);
              }}
            >
              {genericModalState.cancelBtnMessage}
            </button>
            {genericModalState.onProceed && (
              <button
                type="button"
                className="min-w-[100px] inline-flex justify-center rounded-md border border-transparent bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => {
                  genericModalState.onProceed?.();
                  hideModal(ModalIds.genericModal);
                }}
              >
                {genericModalState.proceedBtnMessage}
              </button>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
