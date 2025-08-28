import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Field, Input, Label } from "@headlessui/react";
import { saveMm2Config, configExists, generateUniqueName } from "../utils/savedMm2ConfigsManager";
import { X } from "lucide-react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import type { SaveMm2ConfigDialogProps } from "../types/components";

export const SaveMm2ConfigDialog: React.FC<SaveMm2ConfigDialogProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaved,
}) => {
  const [configName, setConfigName] = useState("");
  const [error, setError] = useState("");

  // Auto-generate name when dialog opens
  useEffect(() => {
    if (isOpen) {
      const autoName = generateUniqueName("mm2_config");
      setConfigName(autoName);
    }
  }, [isOpen]);

  const handleSave = () => {
    setError("");

    if (!configName.trim()) {
      setError("Please enter a name for this configuration");
      return;
    }

    if (configExists(configName)) {
      const confirmed = window.confirm(
        `A configuration named "${configName}" already exists. Do you want to overwrite it?`
      );
      if (!confirmed) {
        // Don't overwrite - show error and let user choose a different name
        setError(
          `A configuration named "${configName}" already exists. Please choose a different name.`
        );
        return;
      }
    }

    try {
      const savedName = saveMm2Config(configName, currentConfig, true);
      onSaved?.(savedName);
      handleClose();
    } catch (err) {
      setError("Failed to save configuration. Please try again.");
    }
  };

  const handleClose = () => {
    setConfigName("");
    setError("");
    onClose();
  };

  // Reset to auto-generated name
  const resetToAutoName = () => {
    const autoName = generateUniqueName("mm2_config");
    setConfigName(autoName);
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
              Save MM2 Configuration
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-primary-bg-700 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <Field>
              <Label className="block text-sm font-medium text-text-primary mb-1">
                Configuration Name
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="Enter a name for this configuration"
                  className="flex-1 px-3 py-2 bg-primary-bg-900/50 text-text-primary rounded-md border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder-text-muted"
                />
                <button
                  onClick={resetToAutoName}
                  className="px-3 py-2 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 rounded-md transition-colors text-sm cursor-pointer"
                  title="Reset to auto-generated name"
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
              <p className="text-xs text-text-muted px-3 pt-3 pb-1">Configuration Preview (passphrase will be set to 'wasmtest')</p>
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
              className="px-4 py-2 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent text-primary-bg-900 hover:bg-accent/90 rounded-md transition-colors font-medium cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};