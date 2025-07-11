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
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md transform overflow-hidden rounded-lg bg-primary-bg-800/95 backdrop-blur-xl p-6 text-left align-middle shadow-2xl ring-1 ring-accent/20 transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-lg font-semibold text-text-primary">
            {genericModalState.titleComponent}
          </DialogTitle>
          <div className="mt-2 text-sm text-text-muted">
            {genericModalState.messageComponent}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              className="min-w-[100px] inline-flex justify-center rounded-lg bg-primary-bg-700 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-primary-bg-600 hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
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
                className="min-w-[100px] inline-flex justify-center rounded-lg bg-primary-bg-700 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
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
