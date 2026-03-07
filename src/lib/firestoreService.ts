import { db } from './firebase'
import { migrateOldColorFormat } from './colorThemeService'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import type { AppState, TaskGroup } from './types'

export interface Board {
  id: string
  userId: string
  title: string
  createdAt: Date
  appState: AppState
}

// Create a new board
export async function createBoard(userId: string, title: string): Promise<string> {
  const boardId = doc(collection(db, 'boards')).id
  const newBoard: Board = {
    id: boardId,
    userId,
    title,
    createdAt: new Date(),
    appState: { groups: [] },
  }

  await setDoc(doc(db, 'boards', boardId), {
    ...newBoard,
    createdAt: Timestamp.fromDate(newBoard.createdAt),
  })

  return boardId
}

// Get all boards for a user
export async function getUserBoards(userId: string): Promise<Board[]> {
  const q = query(collection(db, 'boards'), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt.toDate(),
      appState: data.appState,
    }
  })
}

// Get a single board
export async function getBoard(boardId: string): Promise<Board | null> {
  const snapshot = await getDoc(doc(db, 'boards', boardId))
  if (!snapshot.exists()) return null

  const data = snapshot.data()
  return {
    id: snapshot.id,
    userId: data.userId,
    title: data.title,
    createdAt: data.createdAt.toDate(),
    appState: data.appState,
  }
}

// Subscribe to board updates (real-time)
export function subscribeToBoardUpdates(
  boardId: string,
  callback: (board: Board | null) => void
): () => void {
  return onSnapshot(doc(db, 'boards', boardId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }

    const data = snapshot.data()
    
    // Migrate old color format if needed
    const migratedAppState: AppState = {
      groups: data.appState.groups.map((group: TaskGroup | any) => ({
        ...group,
        colorTheme: migrateOldColorFormat(group),
      })) as TaskGroup[],
    }

    const board: Board = {
      id: snapshot.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt.toDate(),
      appState: migratedAppState,
    }
    callback(board)
  })
}

// Update board state
export async function updateBoardState(
  boardId: string,
  appState: AppState
): Promise<void> {
  // Ensure all groups have colorTheme (migrate if needed)
  const migratedAppState: AppState = {
    groups: appState.groups.map((group: any) => ({
      ...group,
      colorTheme: group.colorTheme || migrateOldColorFormat(group),
    })),
  }
  
  await updateDoc(doc(db, 'boards', boardId), {
    appState: migratedAppState,
  })
}

// Update board title
export async function updateBoardTitle(boardId: string, title: string): Promise<void> {
  await updateDoc(doc(db, 'boards', boardId), {
    title,
  })
}

// Delete board
export async function deleteBoard(boardId: string): Promise<void> {
  await deleteDoc(doc(db, 'boards', boardId))
}

// Subscribe to user's boards (real-time list)
export function subscribeToUserBoards(
  userId: string,
  callback: (boards: Board[]) => void
): () => void {
  const q = query(collection(db, 'boards'), where('userId', '==', userId))
  return onSnapshot(q, (snapshot) => {
    const boards = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        createdAt: data.createdAt.toDate(),
        appState: data.appState,
      }
    })
    callback(boards)
  })
}
