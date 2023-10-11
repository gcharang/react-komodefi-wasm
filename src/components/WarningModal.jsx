import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useEffect } from "react";
import Cookies from "js-cookie";

export const WarningDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const lastDisplayTimestamp = +Cookies.get("lastDisplayTimestamp");
    console.log(lastDisplayTimestamp);
    const currentTimestamp = new Date().getTime();

    // If the last display timestamp is not set or more than 24 hours have passed, show the modal
    if (
      !lastDisplayTimestamp ||
      currentTimestamp - lastDisplayTimestamp > 24 * 60 * 60 * 1000
    ) {
      setIsDialogOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    // Set a cookie with the current timestamp to record when the modal was last displayed
    Cookies.set("lastDisplayTimestamp", new Date().getTime(), { expires: 1 }); // Expires in 1 day

    // Close the modal
    setIsDialogOpen(false);
  };
  return (
    <>
      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDialogOpen(false)}
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
                    className="text-lg font-medium leading-6 text-red-500"
                  >
                    Important Info!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      Use at your own risk. Do not store/load seeds/wallets with
                      coins/tokens of any significant value
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        handleCloseModal();
                      }}
                    >
                      I understand
                    </button>
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
