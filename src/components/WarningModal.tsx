import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { useState } from "react";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useVisibilityState } from "../store/useStore";
import { ModalIds } from "../store/modalIds";

export const WarningDialog = () => {
  const { imVisible, hideModal, showModal } = useVisibilityState();

  useEffect(() => {
    const lastDisplayTimestamp = +(Cookies.get("lastDisplayTimestamp") || 0);
    const currentTimestamp = new Date().getTime();

    // If the last display timestamp is not set or more than 24 hours have passed, show the modal
    if (
      !lastDisplayTimestamp ||
      currentTimestamp - lastDisplayTimestamp > 24 * 60 * 60 * 1000
    ) {
      showModal(ModalIds.usageWarning);
    }
  }, []);

  const handleCloseModal = () => {
    // Set a cookie with the current timestamp to record when the modal was last displayed
    Cookies.set("lastDisplayTimestamp", new Date().getTime().toString(), {
      expires: 1,
    }); // Expires in 1 day

    // Close the modal
    hideModal(ModalIds.usageWarning);
  };
  return (
    <Dialog
      open={imVisible(ModalIds.usageWarning)}
      onClose={() => hideModal(ModalIds.usageWarning)}
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
          <DialogTitle className="text-lg font-semibold text-warning">
            Important Info!
          </DialogTitle>
          <Description className="mt-2 text-sm text-text-muted">
            Use at your own risk. Do not store/load seeds/wallets with
            coins/tokens of any significant value
          </Description>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary-bg-700 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
              onClick={handleCloseModal}
            >
              I understand
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
