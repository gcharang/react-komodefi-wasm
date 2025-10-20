// Component prop types

import type { CoinElectrumConfig } from './coins';
import type { MethodCollection } from './api';
import type { useRouter } from 'next/navigation';

// Window sizes for App layout
export interface AppWindowSizes {
  bottomBar: number;
  leftPane: number | null;
  rightPane: number | null;
}

// Legacy window sizes (if still needed)
export interface WindowSizes {
  leftWidth: number;
  rightHeight: number;
  sidebarWidth: number;
}

export interface DraggableVerticalDividerProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export interface DraggableHorizontalDividerProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export interface Mm2LogsPanelProps {
  windowSizes: AppWindowSizes;
  setWindowSizes: React.Dispatch<React.SetStateAction<AppWindowSizes>>;
}

export interface RpcPanelProps {
  isMobile?: boolean;
  onSwitchToResponse?: () => void;
}

export interface TooltipProps {
  label: string;
  dir?: 'top' | 'bottom' | 'bottom-right';
  children: React.ReactNode;
}

export interface SettingsDialogProps {
  isDialogOpen?: boolean;
  setIsDialogOpen?: (value: boolean) => void;
  generateRpcMethods: (url?: string) => void;
}

// Icon component props
export type IconProps = React.SVGProps<SVGSVGElement>;

// RPC Panel component props
export interface MenuItemProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Old ListBox props - may be unused, keeping for compatibility
export interface ListBoxMethodsProps {
  searchParams: {
    get: (key: string) => string | null;
  };
  methods: MethodCollection;
}

// ListBox component props from RpcPanel
export interface ListBoxProps {
  methods: MethodCollection;
  router: ReturnType<typeof useRouter>;
}

// ElectrumCoinsModal component props
export interface ElectrumCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CoinItemProps {
  coin: CoinElectrumConfig;
  isSelected: boolean;
  onToggle: (coinName: string) => void;
}

export interface JsonMonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPaste?: (pastedContent: string) => void;
  disabled?: boolean;
  className?: string;
  width?: string | number;
  height?: string | number;
}

// Toast component props
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

// App component types
export type TabType = 'mm2' | 'rpc' | 'logs' | 'response';

// SaveRequestDialog component props
export interface SaveRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: string;
  onSaved?: (name: string) => void;
}

// LoadRequestModal component props
export interface LoadRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (config: string) => void;
}

// SaveMm2ConfigDialog component props
export interface SaveMm2ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: string;
  onSaved?: (name: string) => void;
}

// LoadMm2ConfigModal component props
export interface LoadMm2ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (config: string) => void;
}

export interface PassphraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (passphrase: string) => void;
}

export interface WordInputProps {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onPaste: (index: number, pastedWords: string[]) => void;
  isValid?: boolean;
  autoFocus?: boolean;
}

export type SortOption = 'usage' | 'lastUsed' | 'dateCreated';
