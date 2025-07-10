import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

interface SettingsDialogProps {
  isDialogOpen?: boolean;
  setIsDialogOpen?: (value: boolean) => void;
  generateRpcMethods: (url?: string) => void;
}

export const SettingsDialog = ({
  isDialogOpen = false,
  setIsDialogOpen = () => {},
  generateRpcMethods,
}: SettingsDialogProps) => {
  const [url, setUrl] = useState<string>("");
  const processRequest = () => {
    generateRpcMethods(url);
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
            <div className="fixed inset-0 bg-black/25" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-lighter p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Import collection URL
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      Allows you to use new methods from the dropdown in the
                      menu bar above
                    </p>
                    <input
                      className="bg-transparent w-full rounded-sm my-2 text-white"
                      type="url"
                      placeholder="postman collection url"
                      value={url}
                      onChange={({ target: { value } }) => setUrl(value)}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => processRequest()}
                    >
                      Import Collection
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
