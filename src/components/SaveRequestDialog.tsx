import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Field, Input, Label } from "@headlessui/react";
import { saveRequest, requestExists } from "../utils/savedRequestsManager";
import { getMethodNameFromConfig } from "../utils/getMethodName";
import { CloseIcon } from "./IconComponents";
import JsonMonacoEditor from "./JsonMonacoEditor";

interface SaveRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: string;
  onSaved?: (name: string) => void;
}

export const SaveRequestDialog: React.FC<SaveRequestDialogProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaved,
}) => {
  const [requestName, setRequestName] = useState("");
  const [error, setError] = useState("");

  // Auto-generate name when dialog opens
  useEffect(() => {
    if (isOpen) {
      const methodName = getMethodNameFromConfig(currentConfig);
      setRequestName(methodName);
    }
  }, [isOpen, currentConfig]);

  const handleSave = () => {
    setError("");

    if (!requestName.trim()) {
      setError("Please enter a name for this request");
      return;
    }

    if (requestExists(requestName)) {
      const confirmed = window.confirm(
        `A request named "${requestName}" already exists. Do you want to overwrite it?`
      );
      if (!confirmed) {
        // Don't overwrite - show error and let user choose a different name
        setError(
          `A request named "${requestName}" already exists. Please choose a different name.`
        );
        return;
      }
    }

    try {
      const savedName = saveRequest(requestName, currentConfig, true);
      onSaved?.(savedName);
      handleClose();
    } catch (err) {
      setError("Failed to save request. Please try again.");
    }
  };

  const handleClose = () => {
    setRequestName("");
    setError("");
    onClose();
  };

  // Reset to auto-generated name
  const resetToAutoName = () => {
    const methodName = getMethodNameFromConfig(currentConfig);
    setRequestName(methodName);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-lg w-full bg-primary-bg-800 rounded-lg shadow-2xl ring-1 ring-accent/20">
          <div className="flex items-center justify-between p-4 border-b border-border-primary">
            <DialogTitle className="text-lg font-medium text-text-primary">
              Save Request
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-primary-bg-700 rounded transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-text-primary mb-1">
                Request Name
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Enter a name for this request"
                  className="flex-1 px-3 py-2 bg-primary-bg-900/50 text-text-primary rounded-md border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder-text-muted"
                />
                <button
                  onClick={resetToAutoName}
                  className="px-3 py-2 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 rounded-md transition-colors text-sm"
                  title="Reset to auto-generated method name"
                >
                  Reset
                </button>
              </div>
            </Field>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-md">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="bg-primary-bg-900/50 rounded-md border border-border-primary overflow-hidden">
              <p className="text-xs text-text-muted px-3 pt-3 pb-1">Request Preview</p>
              <div className="h-[300px] md:h-[350px]">
                <JsonMonacoEditor
                  value={currentConfig}
                  onChange={() => {}}
                  disabled={true}
                  height="100%"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-border-primary">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent text-primary-bg-900 hover:bg-accent/90 rounded-md transition-colors font-medium"
            >
              Save Request
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
