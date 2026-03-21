<script lang="ts">
  import type { Task, TaskGroup as TaskGroupType, ColorTheme } from './types'
  import { colorThemes, getColorForTheme } from './colorThemeService'
  import { getTheme, subscribeToThemeChanges } from './themeService'
  import type { Theme } from './themeService'
  import TaskItem from './TaskItem.svelte'
  import TaskModal from './TaskModal.svelte'
  import { showConfirm } from './confirmDialogService'

  interface Props {
    group: TaskGroupType
    onUpdateGroup: (group: TaskGroupType) => void
    onDeleteGroup: () => void
    onHeaderMouseDown?: (e: MouseEvent) => void
  }

  let { group, onUpdateGroup, onDeleteGroup, onHeaderMouseDown }: Props = $props()

  let selectedTask: Task | null = $state(null)
  let isModalOpen: boolean = $state(false)
  let newTaskTitle: string = $state('')
  let isEditingTitle: boolean = $state(false)
  let editedTitle: string = $state(group.title)
  let isMenuOpen: boolean = $state(false)
  let isColorPickerOpen: boolean = $state(false)
  let currentTheme: Theme = $state(getTheme())
  let menuContainerRef: HTMLDivElement | undefined = $state()

  // Subscribe to theme changes to re-render colors
  $effect(() => {
    const unsubscribe = subscribeToThemeChanges((theme) => {
      currentTheme = theme
    })
    return () => unsubscribe()
  })

  // Close menu when clicking outside
  $effect(() => {
    if (!isMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuContainerRef && !menuContainerRef.contains(event.target as Node)) {
        isMenuOpen = false
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  })

  const colorThemeOptions: ColorTheme[] = ['white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']

  // Get current colors based on theme
  $effect(() => {
    // This effect reruns when theme changes
  })

  function getColors() {
    return getColorForTheme(group.colorTheme, currentTheme)
  }

  function handleSelectTask(task: Task): void {
    selectedTask = task
    isModalOpen = true
  }

  function handleCloseModal(): void {
    isModalOpen = false
    selectedTask = null
  }

  function handleUpdateTask(updatedTask: Task): void {
    const updatedGroup: TaskGroupType = {
      ...group,
      tasks: group.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    }
    onUpdateGroup(updatedGroup)
    selectedTask = updatedTask
  }

  function handleDeleteTask(): void {
    const updatedGroup: TaskGroupType = {
      ...group,
      tasks: group.tasks.filter((t) => t.id !== selectedTask?.id),
    }
    onUpdateGroup(updatedGroup)
    handleCloseModal()
  }

  function handleToggleComplete(taskId: string, completed: boolean): void {
    const updatedGroup: TaskGroupType = {
      ...group,
      tasks: group.tasks.map((t) =>
        t.id === taskId ? { ...t, completed } : t
      ),
    }
    onUpdateGroup(updatedGroup)
  }

  function handleAddTask(): void {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: '',
      completed: false,
      createdAt: Date.now(),
    }

    const updatedGroup: TaskGroupType = {
      ...group,
      tasks: [...group.tasks, newTask],
    }
    onUpdateGroup(updatedGroup)
    newTaskTitle = ''
  }

  function handleEditTitle(): void {
    isEditingTitle = true
    editedTitle = group.title
  }

  function handleSaveTitle(): void {
    if (!editedTitle.trim()) {
      editedTitle = group.title
      isEditingTitle = false
      return
    }

    const updatedGroup: TaskGroupType = {
      ...group,
      title: editedTitle,
    }
    onUpdateGroup(updatedGroup)
    isEditingTitle = false
  }

  function handleCancelTitle(): void {
    isEditingTitle = false
    editedTitle = group.title
  }

  function handleChangeColor(colorTheme: ColorTheme): void {
    const updatedGroup: TaskGroupType = {
      ...group,
      colorTheme: colorTheme,
    }
    onUpdateGroup(updatedGroup)
    isColorPickerOpen = false
    isMenuOpen = false
  }

  function handleMenuClick(): void {
    isMenuOpen = !isMenuOpen
  }

  async function handleDeleteFromMenu(): Promise<void> {
    isMenuOpen = false
    const confirmed = await showConfirm({
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
    })
    if (confirmed) {
      onDeleteGroup()
    }
  }
</script>

<div
  class="task-group"
  role="region"
  aria-label="Task group: {group.title}"
  oncontextmenu={(e) => e.stopPropagation()}
  style="background-color: {getColors().bg}; color: {getColors().text}; cursor: drag"
  onmousedown={onHeaderMouseDown}
>
  <div class="group-header">
    {#if isEditingTitle}
      <input
        type="text"
        bind:value={editedTitle}
        class="group-title-input"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            handleSaveTitle()
          } else if (e.key === 'Escape') {
            handleCancelTitle()
          }
        }}
        autofocus
        onmousedown={(e) => e.stopPropagation()}
      />
      <div class="title-actions">
        <button onclick={handleSaveTitle} class="save-btn" title="Save">
          <i class="fas fa-check"></i>
        </button>
        <button onclick={handleCancelTitle} class="cancel-btn" title="Revert">
          <i class="fas fa-undo"></i>
        </button>
      </div>
    {:else}
      <button class="group-title" onclick={handleEditTitle} title="Click to edit">
        {group.title}
      </button>
      <div class="menu-container" bind:this={menuContainerRef}>
        <button onclick={handleMenuClick} class="menu-btn" title="Menu">
          ⋯
        </button>
        {#if isMenuOpen}
          <div class="menu-dropdown" role="menu" tabindex="0" onclick={(e) => e.stopPropagation()}>
             {#if isColorPickerOpen}
                <div class="color-picker" role="group" aria-label="Color options">
                  {#each colorThemeOptions as colorTheme (colorTheme)}
                    {@const colors = getColorForTheme(colorTheme, currentTheme)}
                    <button
                      onclick={() => handleChangeColor(colorTheme)}
                      class="color-square"
                      style="background-color: {colors.bg}; border-color: {colors.text};"
                      title="Choose color"
                    />
                  {/each}
                </div>
             {:else}
               <button onclick={() => (isColorPickerOpen = true)} class="menu-item">
                 Change Color
               </button>
               <button onclick={handleDeleteFromMenu} class="menu-item delete-item">
                 Delete Group
               </button>
             {/if}
           </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="task-list">
    {#each group.tasks as task (task.id)}
      <TaskItem
        {task}
        onToggleComplete={(completed) =>
          handleToggleComplete(task.id, completed)}
        onClick={() => handleSelectTask(task)}
      />
    {/each}
  </div>

  <div class="add-task-form">
    <input
      type="text"
      bind:value={newTaskTitle}
      placeholder="New task..."
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          handleAddTask()
        }
      }}
      onmousedown={(e) => e.stopPropagation()}
    />
  </div>
</div>

{#if selectedTask}
  <TaskModal
    task={selectedTask}
    isOpen={isModalOpen}
    onClose={handleCloseModal}
    onUpdate={handleUpdateTask}
    onDelete={handleDeleteTask}
  />
{/if}

<style>
  .task-group {
    border: 3px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    min-width: 250px;
    background: white;
    cursor: grab;
  }

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    user-select: none;
  }

  .task-group:active {
    cursor: grabbing;
  }

  .group-title {
    display: inline-block;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    color: inherit;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
    text-align: left;
    transition: all 0.15s;
  }

  .group-title:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .group-title:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .menu-container {
    position: relative;
  }

  .menu-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    flex-shrink: 0;
  }

  .menu-btn:hover {
    opacity: 0.6;
  }

  .menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    min-width: 150px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }

  .menu-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .menu-item:hover {
    background-color: var(--bg-tertiary);
  }

  .menu-item.delete-item:hover {
    background-color: var(--error-bg);
    color: var(--error-text);
  }

  .color-picker {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .color-square {
    width: 40px;
    height: 40px;
    border: 2px solid;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .color-square:hover {
    transform: scale(1.1);
  }

  .group-title-input {
    flex: 1;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    border: 2px solid var(--accent-color);
    border-radius: 4px;
    margin-right: 0.5rem;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  .group-title-input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  .title-actions {
    display: flex;
    gap: 0.25rem;
  }

  .save-btn,
  .cancel-btn {
    background-color: transparent;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    min-width: 30px;
    color: var(--text-primary);
  }

  .save-btn:hover,
  .cancel-btn:hover {
    background-color: var(--bg-tertiary);
  }

  .task-list {
    margin-bottom: 1rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .task-list:empty {
    display: none;
  }

  .add-task-form {
    display: flex;
    gap: 0.5rem;
  }

  .add-task-form input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
</style>
