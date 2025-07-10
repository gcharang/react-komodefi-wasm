// Component prop types

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
  windowSizes: WindowSizes;
  setWindowSizes: React.Dispatch<React.SetStateAction<WindowSizes>>;
}

export interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}