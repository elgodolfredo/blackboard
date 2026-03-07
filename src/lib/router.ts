import page, { type Context } from 'page'

export type PageName = 'login' | 'dashboard' | 'board'

export interface RouteState {
  page: PageName
  boardId?: string
}

let currentState: RouteState = { page: 'login' }
let stateCallbacks: ((state: RouteState) => void)[] = []
let isAuthenticated = false

export function subscribeToRouteChanges(callback: (state: RouteState) => void): () => void {
  stateCallbacks.push(callback)

  // Return unsubscribe function
  return () => {
    stateCallbacks = stateCallbacks.filter((cb) => cb !== callback)
  }
}

function notifyStateChange(state: RouteState): void {
  currentState = state
  stateCallbacks.forEach((callback) => callback(state))
}

export function getRouteState(): RouteState {
  return { ...currentState }
}

export function navigateTo(pageName: PageName, boardId?: string): void {
  if (pageName === 'board' && boardId) {
    page(`/board/${boardId}`)
  } else if (pageName === 'dashboard') {
    page('/dashboard')
  } else if (pageName === 'login') {
    page('/')
  }
}

export function initRouter(initialAuthState: boolean): void {
  isAuthenticated = initialAuthState

  page('/', (ctx: Context) => {
    if (isAuthenticated) {
      page('/dashboard')
    } else {
      notifyStateChange({ page: 'login' })
    }
  })

  page('/dashboard', (ctx: Context) => {
    if (!isAuthenticated) {
      page('/')
    } else {
      notifyStateChange({ page: 'dashboard' })
    }
  })

  page('/board/:boardId', (ctx: Context) => {
    if (!isAuthenticated) {
      page('/')
    } else {
      notifyStateChange({
        page: 'board',
        boardId: ctx.params.boardId as string,
      })
    }
  })

  // Start router
  page.start()
}

export function updateAuthState(newAuthState: boolean): void {
  // Update the module-level auth state
  isAuthenticated = newAuthState

  // Update router based on new auth state
  if (!isAuthenticated) {
    page('/')
  } else {
    // If on login page, redirect to dashboard
    const currentRoute = window.location.pathname
    if (currentRoute === '/') {
      page('/dashboard')
    }
  }
}

export function stopRouter(): void {
  page.stop()
}
