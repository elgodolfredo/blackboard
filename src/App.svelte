<script lang="ts">
  import type { AppState } from './lib/types'
  import type { User } from 'firebase/auth'
  import type { RouteState } from './lib/router'
  import TaskBoard from './lib/TaskBoard.svelte'
  import Login from './lib/Login.svelte'
  import Dashboard from './lib/Dashboard.svelte'
  import AppMenu from './lib/AppMenu.svelte'
  import ConfirmDialogContainer from './lib/ConfirmDialogContainer.svelte'
  import { subscribeToAuthState, logout } from './lib/authService'
  import { subscribeToBoardUpdates, updateBoardState } from './lib/firestoreService'
  import { initRouter, subscribeToRouteChanges, navigateTo, updateAuthState } from './lib/router'

  let currentUser: User | null = $state(null)
  let routeState: RouteState = $state({ page: 'login' })
  let boardState: AppState = $state({ groups: [] })
  let currentBoard: any = $state(null)
  let unsubscribeBoard: (() => void) | null = $state(null)
  let routerInitialized = false
  let authLoading: boolean = $state(true)

  // Subscribe to route changes
  $effect(() => {
    const unsubscribeRoutes = subscribeToRouteChanges((state) => {
      routeState = state

      // If navigating to a board, subscribe to board updates
      if (state.page === 'board' && state.boardId) {
        if (unsubscribeBoard) {
          unsubscribeBoard()
        }

        unsubscribeBoard = subscribeToBoardUpdates(state.boardId, (board) => {
          if (board) {
            currentBoard = board
            boardState = board.appState
          }
        })
      } else if (state.page !== 'board' && unsubscribeBoard) {
        // Unsubscribe from board updates when leaving board page
        unsubscribeBoard()
        unsubscribeBoard = null
      }
    })

    return () => {
      unsubscribeRoutes()
    }
  })

  // Subscribe to auth state
  $effect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      currentUser = user
      
      // Initialize router once we know auth state
      if (!routerInitialized) {
        routerInitialized = true
        initRouter(!!user)
      } else {
        // Update router when auth state changes
        updateAuthState(!!user)
      }

      if (!user) {
        if (unsubscribeBoard) {
          unsubscribeBoard()
          unsubscribeBoard = null
        }
      }

      // Auth state has been determined
      authLoading = false
    })

    return () => unsubscribe()
  })

  function handleLoginSuccess(): void {
    navigateTo('dashboard')
  }

  function handleSelectBoard(boardId: string): void {
    navigateTo('board', boardId)
  }

  function handleUpdateBoardState(newState: AppState): void {
    boardState = newState
    if (routeState.boardId) {
      updateBoardState(routeState.boardId, newState)
    }
  }

  function handleBackToDashboard(): void {
    navigateTo('dashboard')
  }

  async function handleLogout(): Promise<void> {
    try {
      if (unsubscribeBoard) {
        unsubscribeBoard()
        unsubscribeBoard = null
      }
      await logout()
      currentUser = null
      // Navigation will happen automatically when auth state changes
    } catch (err) {
      console.error('Logout error:', err)
    }
  }
</script>

<ConfirmDialogContainer />

{#if authLoading}
  <div class="loading-screen">
    <div class="loading-content">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
{:else if routeState.page === 'login'}
  <Login onLoginSuccess={handleLoginSuccess} />
{:else if routeState.page === 'dashboard' && currentUser}
  <Dashboard
    user={currentUser}
    onSelectBoard={handleSelectBoard}
    onLogout={handleLogout}
  />
  {:else if routeState.page === 'board' && currentUser}
   <div class="board-container">
     <div class="board-header">
       <AppMenu 
         boardTitle={currentBoard?.title || 'Board'} 
         boardId={routeState.boardId}
         onBackToBoards={handleBackToDashboard} 
         onLogout={handleLogout} 
       />
     </div>
     <TaskBoard appState={boardState} onUpdateState={handleUpdateBoardState} />
   </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .board-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--bg-secondary);
    border-bottom: 3px solid var(--border-color);
    z-index: 10;
  }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: var(--bg-primary);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--bg-tertiary);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-content p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin: 0;
  }
</style>
