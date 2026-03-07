<script lang="ts">
  import type { TaskGroup as TaskGroupType, AppState } from './types'
  import TaskGroupComponent from './TaskGroup.svelte'

  interface Props {
    appState: AppState
    onUpdateState: (state: AppState) => void
  }

  let { appState, onUpdateState }: Props = $props()

  let draggedGroupId: string | null = $state(null)
  let dragOffset = $state({ x: 0, y: 0 })

  function handleGroupMouseDown(groupId: string, e: MouseEvent): void {
    draggedGroupId = groupId
    const group = appState.groups.find((g) => g.id === groupId)
    if (group) {
      dragOffset = {
        x: e.clientX - group.position.x,
        y: e.clientY - group.position.y,
      }
    }
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!draggedGroupId) return

    const updatedGroups = appState.groups.map((g) => {
      if (g.id === draggedGroupId) {
        return {
          ...g,
          position: {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          },
        }
      }
      return g
    })
    onUpdateState({ groups: updatedGroups })
  }

  function handleMouseUp(): void {
    if (draggedGroupId) {
      draggedGroupId = null
    }
  }

  function handleContextMenu(e: MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
    console.log('Context menu triggered at:', e.clientX, e.clientY)

    const newGroup: TaskGroupType = {
      id: `group-${Date.now()}`,
      title: `Group ${appState.groups.length + 1}`,
      tasks: [],
      position: {
        x: e.clientX,
        y: e.clientY,
      },
      colorTheme: 'white',
    }

    onUpdateState({ groups: [...appState.groups, newGroup] })
  }

  function handleUpdateGroup(
    groupId: string,
    updatedGroup: TaskGroupType
  ): void {
    const updatedGroups = appState.groups.map((g) =>
      g.id === groupId ? updatedGroup : g
    )
    onUpdateState({ groups: updatedGroups })
  }

  function handleDeleteGroup(groupId: string): void {
    const updatedGroups = appState.groups.filter((g) => g.id !== groupId)
    onUpdateState({ groups: updatedGroups })
  }
</script>

<div
  class="task-board"
  oncontextmenu={handleContextMenu}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseUp}
>
  {#if appState.groups.length === 0}
    <div class="empty-state">
      Right-click anywhere or use the button below to create a group
      <button onclick={() => handleContextMenu({ clientX: 100, clientY: 100 } as MouseEvent)}>
        + Add Group
      </button>
    </div>
  {/if}

  {#each appState.groups as group (group.id)}
    <div
      class="group-wrapper"
      class:dragging={draggedGroupId === group.id}
      style="position: absolute; left: {group.position.x}px; top: {group.position.y}px;"
      onmousedown={(e) => handleGroupMouseDown(group.id, e)}
    >
      <TaskGroupComponent
        {group}
        onUpdateGroup={(updatedGroup) =>
          handleUpdateGroup(group.id, updatedGroup)}
        onDeleteGroup={() => handleDeleteGroup(group.id)}
      />
    </div>
  {/each}
</div>

<style>
  .task-board {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg-primary);
    user-select: none;
    overflow: auto;
  }

  .empty-state {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .empty-state button {
    padding: 0.75rem 1.5rem;
    background-color: transparent;
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .empty-state button:hover {
    background-color: var(--bg-tertiary);
  }

  .group-wrapper {
    cursor: grab;
  }

  .group-wrapper.dragging {
    cursor: grabbing;
    z-index: 1000;
  }

  .group-wrapper:hover {
  }
</style>
