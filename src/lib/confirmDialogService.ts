import { writable, type Writable } from 'svelte/store'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export interface ConfirmDialog extends ConfirmOptions {
  id: string
  onConfirm: () => void
  onCancel: () => void
}

export const confirmDialogs: Writable<ConfirmDialog[]> = writable([])

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const id = `confirm-${Date.now()}`
    
    const dialog: ConfirmDialog = {
      id,
      ...options,
      onConfirm: () => {
        confirmDialogs.update((dialogs) => dialogs.filter((d) => d.id !== id))
        resolve(true)
      },
      onCancel: () => {
        confirmDialogs.update((dialogs) => dialogs.filter((d) => d.id !== id))
        resolve(false)
      },
    }

    confirmDialogs.update((dialogs) => [...dialogs, dialog])
  })
}
