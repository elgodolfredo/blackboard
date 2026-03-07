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
  <span class="task-title" onclick={onClick}>
    {task.title}
  </span>
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
  }

  .task-item.completed .task-title {
    text-decoration: line-through;
    color: var(--text-secondary);
  }
</style>
