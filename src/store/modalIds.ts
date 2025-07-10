export const ModalIds = {
  usageWarning: "usageWarning",
  genericModal: "genericModal",
} as const;

export type ModalId = typeof ModalIds[keyof typeof ModalIds];