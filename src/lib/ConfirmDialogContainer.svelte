<script lang="ts">
  import ConfirmDialog from './ConfirmDialog.svelte'
  import { confirmDialogs } from './confirmDialogService'
</script>

{#each $confirmDialogs as dialog (dialog.id)}
  <ConfirmDialog
    title={dialog.title}
    message={dialog.message}
    confirmText={dialog.confirmText}
    cancelText={dialog.cancelText}
    isDangerous={dialog.isDangerous}
    onConfirm={dialog.onConfirm}
    onCancel={dialog.onCancel}
  />
{/each}
