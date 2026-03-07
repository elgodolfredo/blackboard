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
