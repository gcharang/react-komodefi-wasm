import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Upload,
  Download,
} from "lucide-react";
import {
  getSavedRequests,
  loadRequest,
  deleteRequest,
  exportRequests,
  importRequests,
  clearAllRequests,
} from "../utils/savedRequestsManager";
import type { SavedRequest } from "../utils/savedRequestsManager";
import { X, ChevronDown, ChevronLeft } from "lucide-react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import type { LoadRequestModalProps, SortOption } from "../types/components";

const sortOptions = [
  { value: "usage" as const, label: "Usage Count" },
  { value: "lastUsed" as const, label: "Last Used" },
  { value: "dateCreated" as const, label: "Date Created" },
];

export const LoadRequestModal: React.FC<LoadRequestModalProps> = ({
  isOpen,
  onClose,
  onLoad,
}) => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<SavedRequest | null>(
    null
  );
  const [sortBy, setSortBy] = useState<SortOption>("dateCreated");
  const [sortDescending, setSortDescending] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedRequests();
      setShowMobilePreview(false); // Reset mobile view when opening
    }
  }, [isOpen]);

  const loadSavedRequests = () => {
    const requests = getSavedRequests();
    setSavedRequests(Object.values(requests));
  };

  const filteredAndSortedRequests = useMemo(() => {
    // First filter by search term
    const filtered = savedRequests.filter((req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort based on selected option
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "usage":
          comparison = b.usageCount - a.usageCount;
          break;
        case "lastUsed":
          // Sort by lastUsedAt, fallback to savedAt if never used
          const aLastUsed = a.lastUsedAt || a.savedAt;
          const bLastUsed = b.lastUsedAt || b.savedAt;
          comparison =
            new Date(bLastUsed).getTime() - new Date(aLastUsed).getTime();
          break;
        case "dateCreated":
        default:
          comparison =
            new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
          break;
      }

      // Reverse comparison if ascending order
      return sortDescending ? comparison : -comparison;
    });
  }, [savedRequests, searchTerm, sortBy, sortDescending]);

  const handleLoad = (name: string) => {
    const request = loadRequest(name);
    if (request) {
      onLoad(request.config);
      onClose();
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteRequest(name);
      loadSavedRequests();
      if (selectedRequest?.name === name) {
        setSelectedRequest(null);
      }
    }
  };

  const handleExport = () => {
    const data = exportRequests();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kdf_saved_requests_wasm_pg_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      // Ask user if they want to merge or overwrite
      const shouldOverwrite = window.confirm(
        "Do you want to replace all existing saved requests?\n\n" +
          "Click 'OK' to replace all existing requests\n" +
          "Click 'Cancel' to merge with existing requests"
      );

      importRequests(text, shouldOverwrite);
      loadSavedRequests();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(
        `Successfully imported requests (${
          shouldOverwrite ? "replaced" : "merged"
        })`
      );
    } catch (error) {
      alert(
        "Failed to import requests. Please ensure the file is a valid JSON export."
      );
      console.error("Import error:", error);
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL saved requests? This cannot be undone."
      )
    ) {
      clearAllRequests();
      loadSavedRequests();
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center md:p-4">
        <DialogPanel className="mx-auto max-w-full md:max-w-4xl w-full h-full md:h-[600px] bg-primary-bg-800 md:rounded-lg shadow-2xl ring-1 ring-accent/20 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border-b border-border-primary space-y-3 md:space-y-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base md:text-lg font-medium text-text-primary">
                Load Saved Request
              </DialogTitle>
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-primary-bg-700 rounded transition-colors md:hidden"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className={`${showMobilePreview ? 'hidden md:flex' : 'flex'} items-center justify-between md:gap-3`}>
              <div className="flex gap-1.5 md:gap-2">
                <Listbox value={sortBy} onChange={setSortBy}>
                  <div className="relative">
                    <ListboxButton className="relative px-2 md:px-3 py-1.5 bg-primary-bg-900/50 text-text-primary rounded-md border border-border-primary text-left focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center gap-1 md:gap-2">
                      <span className="text-xs md:text-sm">
                        <span className="hidden sm:inline">Sort: </span>
                        {sortOptions.find((opt) => opt.value === sortBy)?.label}
                      </span>
                      <ChevronDown className="w-3.5 md:w-4 h-3.5 md:h-4 text-text-muted" />
                    </ListboxButton>
                    <ListboxOptions className="absolute z-10 mt-1 left-0 md:right-0 bg-primary-bg-800 rounded-md border border-border-primary shadow-lg focus:outline-none">
                      {sortOptions.map((option) => (
                        <ListboxOption
                          key={option.value}
                          value={option.value}
                          className={({ focus, selected }) =>
                            `px-3 py-2 text-xs md:text-sm cursor-pointer whitespace-nowrap ${
                              focus
                                ? "bg-primary-bg-700 text-text-primary"
                                : "text-text-primary"
                            } ${selected ? "font-medium" : ""}`
                          }
                        >
                          {option.label}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
                <button
                  onClick={() => setSortDescending(!sortDescending)}
                  className="p-1.5 bg-primary-bg-900/50 text-text-primary rounded-md border border-border-primary hover:bg-primary-bg-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                  title={sortDescending ? "Sort descending" : "Sort ascending"}
                >
                  {sortDescending ? (
                    <ArrowDownWideNarrow className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  ) : (
                    <ArrowUpNarrowWide className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 md:gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleImport}
                  className="p-1.5 md:p-2 hover:bg-primary-bg-700 rounded transition-colors"
                  title="Import saved requests from file"
                >
                  <Upload className="w-4 md:w-5 h-4 md:h-5 text-text-muted" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-1.5 md:p-2 hover:bg-primary-bg-700 rounded transition-colors"
                  title="Export all saved requests"
                >
                  <Download className="w-4 md:w-5 h-4 md:h-5 text-text-muted" />
                </button>
                <button
                  onClick={onClose}
                  className="hidden md:block p-2 hover:bg-primary-bg-700 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>
            
            {/* Mobile back button when previewing */}
            {showMobilePreview && (
              <div className="flex md:hidden">
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-bg-900/50 hover:bg-primary-bg-800/50 text-text-primary rounded-md border border-border-primary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to List</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile: Show either list or preview, Desktop: Show both */}
            <div className={`${showMobilePreview ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-1/2 md:border-r border-border-primary`}>
              <div className="p-3 md:p-4">
                <Field>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search saved requests..."
                    className="w-full px-3 py-2 bg-primary-bg-900/50 text-text-primary text-sm rounded-md border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder-text-muted"
                  />
                </Field>
              </div>

              <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4">
                {filteredAndSortedRequests.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    {searchTerm ? "No requests found" : "No saved requests yet"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredAndSortedRequests.map((req) => (
                      <div
                        key={req.name}
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowMobilePreview(true);
                        }}
                        className={`py-2 px-2.5 rounded-md border cursor-pointer transition-all ${
                          selectedRequest?.name === req.name
                            ? "bg-accent/10 border-accent"
                            : "bg-primary-bg-900/30 border-border-primary hover:bg-primary-bg-900/50"
                        }`}
                      >
                        <div className="font-medium text-sm text-text-primary leading-tight">
                          {req.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                          <span>{formatDate(req.savedAt)}</span>
                          <span className="text-text-muted/50">•</span>
                          <span>{req.usageCount}x used</span>
                          {/* {req.includesPassword && (
                            <>
                              <span className="text-text-muted/50">•</span>
                              <span className="text-warning text-xs">pwd</span>
                            </>
                          )} */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {savedRequests.length > 0 && (
                <div className="p-3 md:p-4 border-t border-border-primary">
                  <button
                    onClick={handleClearAll}
                    className="text-xs md:text-sm text-danger hover:text-danger/80 transition-colors cursor-pointer"
                  >
                    Clear All Saved Requests
                  </button>
                </div>
              )}
            </div>

            {/* Preview Panel - Full width on mobile when shown, half on desktop */}
            <div className={`${showMobilePreview ? 'flex' : 'hidden'} md:flex flex-col absolute md:relative inset-0 md:inset-auto w-full md:w-1/2 bg-primary-bg-800 z-10 md:z-auto`}>
              {selectedRequest ? (
                <>
                  <div className="p-3 md:p-4 border-b border-border-primary">
                    <div className="mb-2">
                      <h3 className="font-medium text-text-primary text-sm md:text-base">
                        {selectedRequest.name}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleLoad(selectedRequest.name);
                          setShowMobilePreview(false);
                        }}
                        className="px-3 py-1.5 bg-accent text-primary-bg-900 hover:bg-accent/90 rounded-md transition-colors text-xs md:text-sm font-medium"
                      >
                        Load Request
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(selectedRequest.name);
                          setShowMobilePreview(false);
                        }}
                        className="px-3 py-1.5 bg-danger/20 text-danger hover:bg-danger/30 rounded-md transition-colors text-xs md:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <JsonMonacoEditor
                      value={selectedRequest.config}
                      onChange={() => {}}
                      disabled={true}
                      height="100%"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted">
                  Select a request to preview
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
