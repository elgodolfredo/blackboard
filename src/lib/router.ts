import navaid from 'navaid'

export type PageName = 'login' | 'dashboard' | 'board'

export interface RouteState {
  page: PageName
  boardId?: string
}

let currentState: RouteState = { page: 'login' }
let stateCallbacks: ((state: RouteState) => void)[] = []
let isAuthenticated = false

const router = navaid()

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
    router.route(`/board/${boardId}`)
  } else if (pageName === 'dashboard') {
    router.route('/dashboard')
  } else if (pageName === 'login') {
    router.route('/')
  }
}

export function initRouter(initialAuthState: boolean): void {
  isAuthenticated = initialAuthState

  router
    .on('/', () => {
      if (isAuthenticated) {
        router.route('/dashboard', true)
      } else {
        notifyStateChange({ page: 'login' })
      }
    })
    .on('/dashboard', () => {
      if (!isAuthenticated) {
        router.route('/', true)
      } else {
        notifyStateChange({ page: 'dashboard' })
      }
    })
    .on('/board/:boardId', (params?: { boardId: string }) => {
      if (!isAuthenticated) {
        router.route('/', true)
      } else {
        notifyStateChange({ page: 'board', boardId: params?.boardId })
      }
    })

  // Start router
  router.listen()
}

export function updateAuthState(newAuthState: boolean): void {
  // Update the module-level auth state
  isAuthenticated = newAuthState

  // Update router based on new auth state
  if (!isAuthenticated) {
    router.route('/')
  } else {
    // If on login page, redirect to dashboard
    const currentRoute = window.location.pathname
    if (currentRoute === '/') {
      router.route('/dashboard')
    }
  }
}

export function stopRouter(): void {
  router.unlisten?.()
}
