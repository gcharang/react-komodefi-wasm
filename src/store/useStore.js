import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { mm2DefaultConfig, rpcDefaultConfig } from '../staticData';

export const useStore = create(
  devtools(
    (set, get) => ({
      // MM2 Panel State
      mm2Panel: {
        mm2Running: false,
        startCommand: "Run MM2",
        mm2UserPass: "",
        mm2Config: mm2DefaultConfig,
        dataHasErrors: false,
      },
      setMm2Panel: (updates) =>
        set((state) => ({
          mm2Panel: { ...state.mm2Panel, ...updates },
        })),

      // RPC Panel State
      rpcPanel: {
        config: rpcDefaultConfig,
        dataHasErrors: false,
      },
      setRpcPanel: (updates) =>
        set((state) => ({
          rpcPanel: { ...state.rpcPanel, ...updates },
        })),

      // MM2 Logs State
      mm2Logs: {
        outputMessages: [["Once kdf is run, daemon output is rendered here", "blue"]],
      },
      setMm2Logs: (updates) =>
        set((state) => ({
          mm2Logs: { ...state.mm2Logs, ...updates },
        })),
      addMm2Log: (message, color = "white") =>
        set((state) => ({
          mm2Logs: {
            outputMessages: [...state.mm2Logs.outputMessages, [message, color]],
          },
        })),

      // RPC Response State
      rpcResponse: {
        requestResponse: "",
      },
      setRpcResponse: (updates) =>
        set((state) => ({
          rpcResponse: { ...state.rpcResponse, ...updates },
        })),

      // Modal Visibility State
      modalVisibility: [],
      showModal: (modalId) =>
        set((state) => ({
          modalVisibility: state.modalVisibility.includes(modalId)
            ? state.modalVisibility
            : [...state.modalVisibility, modalId],
        })),
      hideModal: (modalId) =>
        set((state) => ({
          modalVisibility: state.modalVisibility.filter((id) => id !== modalId),
        })),
      imVisible: (modalId) => get().modalVisibility.includes(modalId),
      hidePreviousThenShowNext: (previousModalId, nextModalId) => {
        const { hideModal, showModal } = get();
        hideModal(previousModalId);
        showModal(nextModalId);
      },

      // Generic Modal State
      genericModal: {
        titleComponent: "Hello, world!",
        messageComponent: (
          <p className="text-sm text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>
        ),
        proceedBtnMessage: "I understand",
        cancelBtnMessage: "Close",
        onProceed: null,
        onCancel: () => null,
      },
      setGenericModal: (updates) =>
        set((state) => ({
          genericModal: { ...state.genericModal, ...updates },
        })),

      // Methods State
      methods: null,
      setMethods: (methods) => set({ methods }),
    }),
    {
      name: 'komodefi-store', // name for devtools
    }
  )
);

// Export individual hooks for backward compatibility
export const useMm2PanelState = () => {
  const mm2PanelState = useStore((state) => state.mm2Panel);
  const setMm2PanelState = useStore((state) => state.setMm2Panel);
  return {
    mm2PanelState,
    setMm2PanelState,
  };
};

export const useRpcPanelState = () => {
  const rpcPanelState = useStore((state) => state.rpcPanel);
  const setRpcPanelState = useStore((state) => state.setRpcPanel);
  return {
    rpcPanelState,
    setRpcPanelState,
  };
};

export const useMm2LogsPanelState = () => {
  const mm2LogsPanelState = useStore((state) => state.mm2Logs);
  const setMm2LogsPanelState = useStore((state) => state.setMm2Logs);
  const addMm2Log = useStore((state) => state.addMm2Log);
  return {
    mm2LogsPanelState,
    setMm2LogsPanelState,
    addMm2Log,
  };
};

export const useRpcResponseState = () => {
  const rpcResponseState = useStore((state) => state.rpcResponse);
  const setRpcResponseState = useStore((state) => state.setRpcResponse);
  return {
    rpcResponseState,
    setRpcResponseState,
  };
};

export const useVisibilityState = () => {
  const modalVisibilityState = useStore((state) => state.modalVisibility);
  const showModal = useStore((state) => state.showModal);
  const hideModal = useStore((state) => state.hideModal);
  const imVisible = useStore((state) => state.imVisible);
  const hidePreviousThenShowNext = useStore((state) => state.hidePreviousThenShowNext);
  
  return {
    modalVisibilityState,
    showModal,
    hideModal,
    imVisible,
    hidePreviousThenShowNext,
  };
};

export const useGenericModal = () => {
  const genericModalState = useStore((state) => state.genericModal);
  const setGenericModalState = useStore((state) => state.setGenericModal);
  return {
    genericModalState,
    setGenericModalState,
  };
};

export const useRpcMethods = () => {
  const methods = useStore((state) => state.methods);
  const setMethods = useStore((state) => state.setMethods);
  return {
    methods,
    setMethods,
  };
};

export default useStore;