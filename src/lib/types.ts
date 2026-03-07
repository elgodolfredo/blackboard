export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: number
}

export type ColorTheme = 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export interface TaskGroup {
  id: string
  title: string
  tasks: Task[]
  position: { x: number; y: number }
  colorTheme: ColorTheme
}

export interface AppState {
  groups: TaskGroup[]
}

export type BoardVisibility = 'private' | 'public' | 'collaborative'

export type CollaboratorRole = 'editor' | 'viewer'

export interface Collaborator {
  uid: string
  role: CollaboratorRole
  addedAt: number
}

export interface Board {
  id: string
  userId: string
  title: string
  createdAt: number
  updatedAt: number
  appState: AppState
  visibility: BoardVisibility
  collaborators: Collaborator[]
  archived: boolean
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  createdAt: number
  updatedAt: number
}
