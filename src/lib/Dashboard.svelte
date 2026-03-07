<script lang="ts">
  import { subscribeToUserBoards, createBoard, deleteBoard } from './firestoreService'
  import { logout } from './authService'
  import { formatDate } from './dateUtils'
  import { toggleTheme, getTheme, subscribeToThemeChanges } from './themeService'
  import type { User } from 'firebase/auth'
  import type { Board } from './firestoreService'
  import type { Theme } from './themeService'

  interface Props {
    user: User
    onSelectBoard: (boardId: string) => void
    onLogout: () => void
  }

  let { user, onSelectBoard, onLogout }: Props = $props()

  let boards: Board[] = $state([])
  let newBoardTitle: string = $state('')
  let loading: boolean = $state(false)
  let error: string = $state('')
  let currentTheme: Theme = $state(getTheme())

  // Subscribe to boards
  $effect(() => {
    const unsubscribe = subscribeToUserBoards(user.uid, (updatedBoards) => {
      boards = updatedBoards
    })

    return () => unsubscribe()
  })

  // Subscribe to theme changes
  $effect(() => {
    const unsubscribe = subscribeToThemeChanges((theme) => {
      currentTheme = theme
    })

    return () => unsubscribe()
  })

  async function handleCreateBoard(): Promise<void> {
    if (!newBoardTitle.trim()) return

    loading = true
    error = ''

    try {
      const boardId = await createBoard(user.uid, newBoardTitle)
      newBoardTitle = ''
      onSelectBoard(boardId)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create board'
      error = errorMsg
    } finally {
      loading = false
    }
  }

  async function handleDeleteBoard(boardId: string, boardTitle: string): Promise<void> {
    if (confirm(`Delete board "${boardTitle}"?`)) {
      try {
        await deleteBoard(boardId)
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete board'
        error = errorMsg
      }
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await logout()
      onLogout()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to logout'
      error = errorMsg
    }
  }

  function handleToggleTheme(): void {
    toggleTheme()
  }
</script>

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Blackboard</h1>
    <div class="header-actions">
      <span class="user-email">{user.email}</span>
      <button onclick={handleToggleTheme} class="theme-btn" title="Toggle theme">
        {#if currentTheme === 'light'}
          <i class="fas fa-moon"></i>
        {:else}
          <i class="fas fa-sun"></i>
        {/if}
      </button>
      <button onclick={handleLogout} class="logout-btn">Logout</button>
    </div>
  </header>

  <main class="dashboard-main">
    <div class="create-board-section">
      <h2>My Boards</h2>
      <div class="create-board-form">
        <input
          type="text"
          bind:value={newBoardTitle}
          placeholder="Board title..."
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              handleCreateBoard()
            }
          }}
          disabled={loading}
        />
        <button onclick={handleCreateBoard} disabled={loading}>
          {loading ? 'Creating...' : 'Create Board'}
        </button>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}
    </div>

    <div class="boards-grid">
      {#if boards.length === 0}
        <div class="empty-state">
          <p>No boards yet. Create one to get started!</p>
        </div>
      {:else}
        {#each boards as board (board.id)}
          <div class="board-card">
            <h3 class="board-title">{board.title}</h3>
            <p class="board-meta">
              {board.appState.groups.length} groups · Created {formatDate(new Date(board.createdAt))}
            </p>
            <div class="board-actions">
              <button onclick={() => onSelectBoard(board.id)} class="open-btn">
                Open
              </button>
              <button
                onclick={() => handleDeleteBoard(board.id, board.title)}
                class="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </main>
</div>

<style>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--bg-primary);
  }

  .dashboard-header {
    background: var(--bg-secondary);
    border-bottom: 3px solid var(--border-color);
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: 1.75rem;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .user-email {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .theme-btn {
    font-size: 1.2rem;
    padding: 0.5rem;
    border: 2px solid var(--border-color);
    background-color: transparent;
    cursor: pointer;
    border-radius: 4px;
  }

  .theme-btn:hover {
    background-color: var(--bg-tertiary);
  }

  .logout-btn {
    padding: 0.5rem 1rem;
    border: 2px solid var(--border-color);
    background-color: transparent;
    color: var(--text-primary);
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .logout-btn:hover {
    background-color: var(--bg-tertiary);
  }

  .dashboard-main {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .create-board-section {
    margin-bottom: 2rem;
  }

  .create-board-section h2 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .create-board-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .create-board-form input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  .create-board-form input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  .create-board-form button {
    padding: 0.75rem 1.5rem;
    background-color: transparent;
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
  }

  .create-board-form button:hover:not(:disabled) {
    background-color: var(--bg-tertiary);
  }

  .create-board-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    background-color: var(--error-bg);
    color: var(--error-text);
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .boards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .board-card {
    background: var(--bg-secondary);
    border: 3px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .board-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .board-meta {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .board-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }

  .open-btn,
  .delete-btn {
    flex: 1;
    padding: 0.5rem;
    border: 2px solid var(--border-color);
    background-color: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    color: var(--text-primary);
  }

  .open-btn:hover,
  .delete-btn:hover {
    background-color: var(--bg-tertiary);
  }
</style>
