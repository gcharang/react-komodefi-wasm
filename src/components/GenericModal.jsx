import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useVisibilityState } from "../store/modals";
import { ModalIds } from "../store/modals/modalIds";
import { useGenericModal } from "../store/genericModal";

export const GenericModal = () => {
  const { imVisible, hideModal } = useVisibilityState();
  const { genericModalState } = useGenericModal();

  return (
    <>
      <Transition appear show={imVisible(ModalIds.genericModal)} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => hideModal(ModalIds.genericModal)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-primaryLighter p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-slate-300"
                  >
                    {genericModalState.titleComponent}
                  </Dialog.Title>
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
                          genericModalState.onProceed();
                          hideModal(ModalIds.genericModal);
                        }}
                      >
                        {genericModalState.proceedBtnMessage}
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
