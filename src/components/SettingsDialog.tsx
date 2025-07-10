import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

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
    <Dialog
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
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
          <DialogTitle className="text-lg font-medium leading-6 text-white">
            Import collection URL
          </DialogTitle>
          <div className="mt-2">
            <p className="text-sm text-gray-400">
              Allows you to use new methods from the dropdown in the
              menu bar above
            </p>
            <input
              className="bg-transparent w-full rounded my-2 text-white"
              type="url"
              placeholder="postman collection url"
              value={url}
              onChange={({ target: { value } }) => setUrl(value)}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => processRequest()}
            >
              Import Collection
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
