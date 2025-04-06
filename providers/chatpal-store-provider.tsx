'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import {
  type ChatPalStore,
  createChatPalStore,
  initChatPalStore,
} from '@/stores/chatpal-store'

export type ChatPalStoreApi = ReturnType<typeof createChatPalStore>

export const ChatPalStoreContext = createContext<ChatPalStoreApi | undefined>(
  undefined,
)

export interface ChatPalStoreProviderProps {
  children: ReactNode
}

export const ChatPalStoreProvider = ({
  children,
}: ChatPalStoreProviderProps) => {
  const storeRef = useRef<ChatPalStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createChatPalStore(initChatPalStore())
  }

  return (
    <ChatPalStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatPalStoreContext.Provider>
  )
}

export const useChatPalStore = <T,>(
  selector: (store: ChatPalStore) => T,
): T => {
  const chatPalStoreContext = useContext(ChatPalStoreContext)

  if (!chatPalStoreContext) {
    throw new Error(`useChatPalStore must be used within ChatPalStoreProvider`)
  }

  return useStore(chatPalStoreContext, selector)
}