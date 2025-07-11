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
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md transform overflow-hidden rounded-lg bg-primary-bg-800/95 backdrop-blur-xl p-6 text-left align-middle shadow-2xl ring-1 ring-accent/20 transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-lg font-semibold text-text-primary">
            Import collection URL
          </DialogTitle>
          <div className="mt-4">
            <p className="text-sm text-text-muted mb-3">
              Allows you to use new methods from the dropdown in the
              menu bar above
            </p>
            <input
              className="w-full rounded-lg bg-primary-bg-900/50 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              type="url"
              placeholder="postman collection url"
              value={url}
              onChange={({ target: { value } }) => setUrl(value)}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary-bg-700 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-primary-bg-600 hover:text-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
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
