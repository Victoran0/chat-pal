import { createStore } from 'zustand/vanilla'

export type ChatPalState = {
  getResponse: boolean;
  isListening: boolean;
  isLoading: boolean;
  visualizeHuman: boolean;
  refreshSTTCount: number;
  chatPalResponse: string;
  isConnecting: boolean;
  isSpeaking: boolean;
}

export type ChatPalActions = {
  toggleBoolean: (key: keyof ChatPalState, val?: boolean) => void;
  setRefreshSTTCount: () => void;
  setChatPalResponse: (response: string) => void;
}

export type ChatPalStore = ChatPalState & ChatPalActions

export const initChatPalStore = (): ChatPalState => {
  return { 
    getResponse: false,
    isListening: false,
    isLoading: false,
    visualizeHuman: false,
    refreshSTTCount: 0,
    chatPalResponse: "",
    isConnecting: false,
    isSpeaking: false,
  }
}

export const defaultInitState: ChatPalState = {
  getResponse: false,
  isListening: false,
  isLoading: false,
  visualizeHuman: false,
  refreshSTTCount: 0,
  chatPalResponse: "",
  isConnecting: false,
  isSpeaking: false,
}

export const createChatPalStore = (
  initState: ChatPalState = defaultInitState,
) => {
  return createStore<ChatPalStore>()((set, get) => ({
    ...initState,
    toggleBoolean: (key, val = false) => {
      set((state) => ({ [key]: val !== undefined ? val : !state[key] }))
    },
    setRefreshSTTCount: () => set((state) => ({ refreshSTTCount: state.refreshSTTCount + 1})),
    setChatPalResponse: (response: string) => set(() => ({ chatPalResponse: response })),
  }))
}
