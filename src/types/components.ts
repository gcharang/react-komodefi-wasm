// Component prop types

import type { CoinElectrumConfig } from './coins';
import type { MethodCollection } from './api';

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

export interface ListBoxProps {
  searchParams: {
    get: (key: string) => string | null;
  };
  methods: MethodCollection;
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