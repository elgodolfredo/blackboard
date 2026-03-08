<script lang="ts">
  interface Props {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    isDangerous?: boolean
    onConfirm: () => void
    onCancel: () => void
  }

  let {
    title = 'Confirm',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
    onConfirm,
    onCancel,
  }: Props = $props()
</script>

<div class="confirm-overlay" role="presentation" onclick={onCancel}>
  <div class="confirm-dialog" role="alertdialog" tabindex="0" onclick={(e) => e.stopPropagation()}>
    {#if title}
      <div class="confirm-header">
        <h3>{title}</h3>
      </div>
    {/if}
    <div class="confirm-body">
      <p>{message}</p>
    </div>
    <div class="confirm-footer">
      <button class="btn-cancel" onclick={onCancel}>
        {cancelText}
      </button>
      <button class="btn-confirm" class:btn-danger={isDangerous} onclick={onConfirm}>
        {confirmText}
      </button>
    </div>
  </div>
</div>

<style>
  .confirm-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  }

  .confirm-dialog {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    padding: 0;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .confirm-header {
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .confirm-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .confirm-body {
    padding: 1.5rem;
    color: var(--text-primary);
  }

  .confirm-body p {
    margin: 0;
    line-height: 1.5;
  }

  .confirm-footer {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    justify-content: flex-end;
  }

  button {
    padding: 0.6em 1.2em;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: transparent;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.15s;
  }

  button:hover {
    background-color: var(--bg-tertiary);
  }

  .btn-confirm {
    background-color: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .btn-confirm:hover {
    opacity: 0.9;
    background-color: var(--accent-color);
  }

  .btn-confirm.btn-danger {
    background-color: var(--error-text);
    border-color: var(--error-text);
  }

  .btn-confirm.btn-danger:hover {
    background-color: #ff5252;
  }

  .btn-cancel {
    background-color: transparent;
  }
</style>
