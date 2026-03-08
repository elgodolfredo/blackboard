<script lang="ts">
  import type { Task } from './types'

  interface Props {
    task: Task
    onToggleComplete: (completed: boolean) => void
    onClick: () => void
  }

  let { task, onToggleComplete, onClick }: Props = $props()

  function handleCheckboxChange(e: Event): void {
    const target = e.target as HTMLInputElement
    onToggleComplete(target.checked)
  }
</script>

<div class="task-item" class:completed={task.completed}>
  <input
    type="checkbox"
    checked={task.completed}
    onchange={handleCheckboxChange}
    class="task-checkbox"
  />
  <button class="task-title" onclick={onClick}>
    {task.title}
  </button>
</div>

<style>
  .task-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    cursor: pointer;
  }

  .task-checkbox {
    cursor: pointer;
    flex-shrink: 0;
  }

  .task-title {
    flex: 1;
    word-break: break-word;
    font-size: 0.875rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font-family: inherit;
    text-align: left;
    transition: opacity 0.15s;
  }

  .task-title:hover {
    opacity: 0.7;
  }

  .task-item.completed .task-title {
    text-decoration: line-through;
    color: var(--text-secondary);
  }
</style>
