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
  dir?: "top" | "bottom" | "bottom-right";
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
  disabled?: boolean;
  className?: string;
  width?: string | number;
  height?: string | number;
}

// Toast component props
export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

// App component types
export type TabType = 'mm2' | 'rpc' | 'logs' | 'response';