<script lang="ts">
  import { toggleTheme, getTheme, subscribeToThemeChanges } from './themeService'
  import { updateBoardTitle } from './firestoreService'
  import type { Theme } from './themeService'

  interface Props {
    boardTitle: string
    boardId: string | undefined
    onBackToBoards: () => void
    onLogout: () => void
  }

  let { boardTitle, boardId, onBackToBoards, onLogout }: Props = $props()

  let isOpen = $state(false)
  let isEditingTitle = $state(false)
  let editedTitle: string = $state(boardTitle)
  let isSaving = $state(false)
  let currentTheme: Theme = $state(getTheme())

  // Subscribe to theme changes
  $effect(() => {
    const unsubscribe = subscribeToThemeChanges((theme) => {
      currentTheme = theme
    })
    return () => unsubscribe()
  })

  function toggleMenu(): void {
    isOpen = !isOpen
  }

  function handleToggleTheme(): void {
    toggleTheme()
    isOpen = false
  }

  function handleBackToBoards(): void {
    onBackToBoards()
    isOpen = false
  }

  function handleLogout(): void {
    onLogout()
    isOpen = false
  }

  function handleEditTitle(): void {
    isEditingTitle = true
    editedTitle = boardTitle
  }

  async function handleSaveTitle(): Promise<void> {
    if (!boardId || editedTitle.trim() === '' || editedTitle === boardTitle) {
      isEditingTitle = false
      return
    }

    isSaving = true
    try {
      await updateBoardTitle(boardId, editedTitle.trim())
    } catch (error) {
      console.error('Failed to update board title:', error)
      editedTitle = boardTitle
    } finally {
      isSaving = false
      isEditingTitle = false
    }
  }

  function handleCancelEdit(): void {
    isEditingTitle = false
    editedTitle = boardTitle
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }
</script>

<div class="app-menu-container">
  <div class="title-section">
    {#if isEditingTitle}
      <input
        type="text"
        bind:value={editedTitle}
        onkeydown={handleKeyDown}
        disabled={isSaving}
        class="title-input"
        maxlength="500"
        autofocus
      />
      <div class="title-actions">
        <button
          onclick={handleSaveTitle}
          disabled={isSaving}
          class="action-btn"
          title="Save"
        >
          <i class="fas fa-check"></i>
        </button>
        <button
          onclick={handleCancelEdit}
          disabled={isSaving}
          class="action-btn"
          title="Revert"
        >
          <i class="fas fa-undo"></i>
        </button>
      </div>
    {:else}
      <h2 class="board-title" onclick={handleEditTitle} title="Click to edit">
        {boardTitle}
      </h2>
    {/if}
  </div>

  <button class="menu-button" onclick={toggleMenu} title="Menu">
    <i class="fas fa-bars"></i>
  </button>

  {#if isOpen}
    <div class="menu-dropdown">
      <button class="menu-item" onclick={handleToggleTheme} title="Toggle theme">
        {#if currentTheme === 'light'}
          <i class="fas fa-moon"></i>
        {:else}
          <i class="fas fa-sun"></i>
        {/if}
        <span>{currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>
      <button class="menu-item" onclick={handleBackToBoards}>
        <i class="fas fa-arrow-left"></i>
        <span>Back to Boards</span>
      </button>
      <button class="menu-item logout-item" onclick={handleLogout}>
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .app-menu-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }

  .board-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s;
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .board-title:hover {
    opacity: 0.7;
    background-color: var(--bg-tertiary);
  }

  .title-input {
    padding: 0.5rem 0.75rem;
    font-size: 1.25rem;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    width: 300px;
    max-width: 400px;
  }

  .title-input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  .title-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .title-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 0.75rem;
    background-color: transparent;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-btn:hover:not(:disabled) {
    background-color: var(--bg-tertiary);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-button {
    font-size: 1.25rem;
    padding: 0.5rem;
    border: 2px solid var(--border-color);
    background-color: transparent;
    color: var(--text-primary);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
  }

  .menu-button:hover {
    background-color: var(--bg-tertiary);
  }

  .menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 4px;
    min-width: 180px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 0.5rem;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: background-color 0.2s;
  }

  .menu-item:hover {
    background-color: var(--bg-tertiary);
  }

  .menu-item.logout-item:hover {
    background-color: var(--error-bg);
    color: var(--error-text);
  }

  .menu-item i {
    width: 1.25rem;
    text-align: center;
  }

  .menu-dropdown .menu-item:first-child {
    border-bottom: 1px solid var(--border-color);
  }
</style>
