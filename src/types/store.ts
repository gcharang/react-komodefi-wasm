// Store Types

export interface MM2PanelState {
  mm2Running: boolean;
  startCommand: string;
  mm2UserPass: string;
  mm2Config: string;
  dataHasErrors: boolean;
}

export interface RpcPanelState {
  config: string;
  dataHasErrors: boolean;
}

export interface MM2LogsState {
  outputMessages: [string, string][];
}

export interface RpcResponseState {
  requestResponse: string;
}

export interface GenericModalState {
  titleComponent: React.ReactNode;
  messageComponent: React.ReactNode;
  proceedBtnMessage: string;
  cancelBtnMessage: string;
  onProceed: (() => void) | null;
  onCancel: () => void;
}

export interface StoreState {
  // MM2 Panel State
  mm2Panel: MM2PanelState;
  setMm2Panel: (updates: Partial<MM2PanelState>) => void;

  // RPC Panel State
  rpcPanel: RpcPanelState;
  setRpcPanel: (updates: Partial<RpcPanelState>) => void;

  // MM2 Logs State
  mm2Logs: MM2LogsState;
  setMm2Logs: (updates: Partial<MM2LogsState>) => void;
  addMm2Log: (message: string, color?: string) => void;

  // RPC Response State
  rpcResponse: RpcResponseState;
  setRpcResponse: (updates: Partial<RpcResponseState>) => void;

  // Modal Visibility State
  modalVisibility: string[];
  showModal: (modalId: string) => void;
  hideModal: (modalId: string) => void;
  imVisible: (modalId: string) => boolean;
  hidePreviousThenShowNext: (previousModalId: string, nextModalId: string) => void;

  // Generic Modal State
  genericModal: GenericModalState;
  setGenericModal: (updates: Partial<GenericModalState>) => void;

  // Methods State
  methods: any; // TODO: Define proper type for methods
  setMethods: (methods: any) => void;
}

// Hook return types
export interface UseMm2PanelStateReturn {
  mm2PanelState: MM2PanelState;
  setMm2PanelState: (updates: Partial<MM2PanelState>) => void;
}

export interface UseRpcPanelStateReturn {
  rpcPanelState: RpcPanelState;
  setRpcPanelState: (updates: Partial<RpcPanelState>) => void;
}

export interface UseMm2LogsPanelStateReturn {
  mm2LogsPanelState: MM2LogsState;
  setMm2LogsPanelState: (updates: Partial<MM2LogsState>) => void;
  addMm2Log: (message: string, color?: string) => void;
}

export interface UseRpcResponseStateReturn {
  rpcResponseState: RpcResponseState;
  setRpcResponseState: (updates: Partial<RpcResponseState>) => void;
}

export interface UseVisibilityStateReturn {
  modalVisibilityState: string[];
  showModal: (modalId: string) => void;
  hideModal: (modalId: string) => void;
  imVisible: (modalId: string) => boolean;
  hidePreviousThenShowNext: (previousModalId: string, nextModalId: string) => void;
}

export interface UseGenericModalReturn {
  genericModalState: GenericModalState;
  setGenericModalState: (updates: Partial<GenericModalState>) => void;
}

export interface UseRpcMethodsReturn {
  methods: any; // TODO: Define proper type for methods
  setMethods: (methods: any) => void;
}