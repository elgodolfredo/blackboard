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
import type { AppState, TaskGroup, Board, UserProfile, Collaborator, BoardVisibility } from './types'

// Create a new board
export async function createBoard(userId: string, title: string): Promise<string> {
  const boardId = doc(collection(db, 'boards')).id
  const now = Timestamp.now()
  const newBoard: Omit<Board, 'id'> = {
    userId,
    title,
    createdAt: now.toMillis(),
    updatedAt: now.toMillis(),
    appState: { groups: [] },
    visibility: 'private',
    collaborators: [],
    archived: false,
  }

  await setDoc(doc(db, 'boards', boardId), {
    ...newBoard,
  })

  return boardId
}

// Get all boards for a user (excluding archived)
export async function getUserBoards(userId: string): Promise<Board[]> {
  const q = query(
    collection(db, 'boards'),
    where('userId', '==', userId),
    where('archived', '==', false)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      appState: data.appState,
      visibility: data.visibility || 'private',
      collaborators: data.collaborators || [],
      archived: data.archived || false,
    } as Board
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
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    appState: data.appState,
    visibility: data.visibility || 'private',
    collaborators: data.collaborators || [],
    archived: data.archived || false,
  } as Board
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      appState: migratedAppState,
      visibility: data.visibility || 'private',
      collaborators: data.collaborators || [],
      archived: data.archived || false,
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
    updatedAt: Timestamp.now().toMillis(),
  })
}

// Update board title
export async function updateBoardTitle(boardId: string, title: string): Promise<void> {
  await updateDoc(doc(db, 'boards', boardId), {
    title,
    updatedAt: Timestamp.now().toMillis(),
  })
}

// Soft delete board (archive)
export async function deleteBoard(boardId: string): Promise<void> {
  await updateDoc(doc(db, 'boards', boardId), {
    archived: true,
    updatedAt: Timestamp.now().toMillis(),
  })
}

// Subscribe to user's boards (real-time list, excluding archived)
export function subscribeToUserBoards(
  userId: string,
  callback: (boards: Board[]) => void
): () => void {
  const q = query(
    collection(db, 'boards'),
    where('userId', '==', userId),
    where('archived', '==', false)
  )
  return onSnapshot(q, (snapshot) => {
    const boards = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        appState: data.appState,
        visibility: data.visibility || 'private',
        collaborators: data.collaborators || [],
        archived: data.archived || false,
      } as Board
    })
    callback(boards)
  })
}

// USER PROFILE FUNCTIONS

// Create or update user profile
export async function upsertUserProfile(user: { uid: string; email: string; displayName?: string | null; photoURL?: string | null }): Promise<void> {
  const now = Timestamp.now().toMillis()
  const existingProfile = await getDoc(doc(db, 'users', user.uid))
  
  const profileData: Omit<UserProfile, 'uid'> = {
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: user.photoURL || null,
    createdAt: existingProfile.exists() ? (existingProfile.data() as UserProfile).createdAt : now,
    updatedAt: now,
  }
  
  await setDoc(doc(db, 'users', user.uid), profileData, { merge: true })
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid))
  if (!snapshot.exists()) return null
  
  const data = snapshot.data()
  return {
    uid: snapshot.id,
    ...data,
  } as UserProfile
}

// COLLABORATOR FUNCTIONS

// Add collaborator to board
export async function addCollaborator(
  boardId: string,
  uid: string,
  role: 'editor' | 'viewer'
): Promise<void> {
  const board = await getBoard(boardId)
  if (!board) throw new Error('Board not found')
  
  const collaboratorExists = board.collaborators.some((c) => c.uid === uid)
  if (collaboratorExists) throw new Error('Collaborator already exists')
  
  const newCollaborator: Collaborator = {
    uid,
    role,
    addedAt: Timestamp.now().toMillis(),
  }
  
  await updateDoc(doc(db, 'boards', boardId), {
    collaborators: [...board.collaborators, newCollaborator],
    updatedAt: Timestamp.now().toMillis(),
  })
}

// Remove collaborator from board
export async function removeCollaborator(boardId: string, uid: string): Promise<void> {
  const board = await getBoard(boardId)
  if (!board) throw new Error('Board not found')
  
  const updatedCollaborators = board.collaborators.filter((c) => c.uid !== uid)
  
  await updateDoc(doc(db, 'boards', boardId), {
    collaborators: updatedCollaborators,
    updatedAt: Timestamp.now().toMillis(),
  })
}

// Update collaborator role
export async function updateCollaboratorRole(
  boardId: string,
  uid: string,
  role: 'editor' | 'viewer'
): Promise<void> {
  const board = await getBoard(boardId)
  if (!board) throw new Error('Board not found')
  
  const updatedCollaborators = board.collaborators.map((c) =>
    c.uid === uid ? { ...c, role } : c
  )
  
  await updateDoc(doc(db, 'boards', boardId), {
    collaborators: updatedCollaborators,
    updatedAt: Timestamp.now().toMillis(),
  })
}

// Update board visibility
export async function updateBoardVisibility(
  boardId: string,
  visibility: BoardVisibility
): Promise<void> {
  await updateDoc(doc(db, 'boards', boardId), {
    visibility,
    updatedAt: Timestamp.now().toMillis(),
  })
}
