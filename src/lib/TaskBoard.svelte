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
  let contextMenu = $state<{ x: number; y: number } | null>(null)
  let boardElement: HTMLDivElement | undefined = $state()

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
    
    // Get the board container's position to calculate relative coordinates
    if (boardElement) {
      const rect = boardElement.getBoundingClientRect()
      contextMenu = { 
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    } else {
      contextMenu = { x: e.clientX, y: e.clientY }
    }
  }

  function handleAddGroup(): void {
    if (!contextMenu) return

    const newGroup: TaskGroupType = {
      id: `group-${Date.now()}`,
      title: `Group ${appState.groups.length + 1}`,
      tasks: [],
      position: {
        x: contextMenu.x,
        y: contextMenu.y,
      },
      colorTheme: 'white',
    }

    onUpdateState({ groups: [...appState.groups, newGroup] })
    contextMenu = null
  }

  function handleCloseContextMenu(): void {
    contextMenu = null
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
  role="main"
  bind:this={boardElement}
  oncontextmenu={handleContextMenu}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseUp}
  onclick={handleCloseContextMenu}
>
  {#if appState.groups.length === 0}
    <div class="empty-state">
      Right-click anywhere to create a group
    </div>
  {/if}

  {#each appState.groups as group (group.id)}
    <div
      class="group-wrapper"
      class:dragging={draggedGroupId === group.id}
      style="position: absolute; left: {group.position.x}px; top: {group.position.y}px;"
    >
      <TaskGroupComponent
        {group}
        onUpdateGroup={(updatedGroup) =>
          handleUpdateGroup(group.id, updatedGroup)}
        onDeleteGroup={() => handleDeleteGroup(group.id)}
        onHeaderMouseDown={(e) => handleGroupMouseDown(group.id, e)}
      />
    </div>
  {/each}

  {#if contextMenu && boardElement}
    {@const boardRect = boardElement.getBoundingClientRect()}
    <div
      class="context-menu"
      style="position: fixed; left: {boardRect.left + contextMenu.x}px; top: {boardRect.top + contextMenu.y}px;"
    >
      <button class="context-menu-item" onclick={handleAddGroup}>
        + Add Group
      </button>
    </div>
  {/if}
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


  .group-wrapper.dragging {
    z-index: 1000;
  }

  .context-menu {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    min-width: 150px;
    padding: 4px 0;
  }

  .context-menu-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: background-color 0.15s;
  }

  .context-menu-item:hover {
    background-color: var(--bg-tertiary);
  }
</style>
