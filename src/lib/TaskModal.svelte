<script lang="ts">
  import type { Task } from './types'

  interface Props {
    task: Task
    isOpen: boolean
    onClose: () => void
    onUpdate: (task: Task) => void
    onDelete: () => void
  }

  let { task, isOpen, onClose, onUpdate, onDelete }: Props = $props()

  let editTitle: string = $state(task.title)
  let editDescription: string = $state(task.description)
  let isEditing: boolean = $state(false)

  function handleEdit(): void {
    isEditing = true
  }

  function handleSave(): void {
    const updatedTask: Task = {
      ...task,
      title: editTitle,
      description: editDescription,
    }
    onUpdate(updatedTask)
    isEditing = false
  }

  function handleCancel(): void {
    editTitle = task.title
    editDescription = task.description
    isEditing = false
  }

  function handleDeleteClick(): void {
    if (confirm('Delete this task?')) {
      onDelete()
      onClose()
    }
  }

  $effect(() => {
    if (isOpen) {
      editTitle = task.title
      editDescription = task.description
    }
  })
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={onClose}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      {#if isEditing}
        <div class="modal-header">
          <h2>Edit Task</h2>
          <button onclick={onClose} class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="title">Title</label>
            <input
              id="title"
              type="text"
              bind:value={editTitle}
              placeholder="Task title"
            />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              bind:value={editDescription}
              placeholder="Task description"
              rows="6"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick={handleSave} class="btn btn-primary">Save</button>
          <button onclick={handleCancel} class="btn btn-secondary">
            Cancel
          </button>
        </div>
      {:else}
        <div class="modal-header">
          <h2>{task.title}</h2>
          <button onclick={onClose} class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="task-status">
            <input
              type="checkbox"
              checked={task.completed}
              onchange={(e: Event) => {
                const target = e.target as HTMLInputElement
                const updated = {
                  ...task,
                  completed: target.checked,
                }
                onUpdate(updated)
              }}
            />
            <span>{task.completed ? 'Completed' : 'Pending'}</span>
          </div>
          <div class="task-created">
            Created: {new Date(task.createdAt).toLocaleString()}
          </div>
          <div class="task-description">
            <h3>Description</h3>
            <p>{task.description || '(No description)'}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button onclick={handleEdit} class="btn btn-primary">Edit</button>
          <button onclick={handleDeleteClick} class="btn btn-danger">
            Delete
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    z-index: 1001;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: var(--text-primary);
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: inherit;
    font-size: inherit;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .task-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .task-created {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .task-description h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .task-description p {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--text-primary);
  }

  .btn {
    padding: 0.5rem 1rem;
    border: 2px solid var(--border-color);
    background-color: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: inherit;
    color: var(--text-primary);
  }

  .btn:hover {
    background-color: var(--bg-tertiary);
  }

  .btn-primary {
    border-color: var(--accent-color);
  }

  .btn-secondary {
    border-color: var(--border-color);
  }

  .btn-danger {
    border-color: var(--error-text);
  }
</style>
