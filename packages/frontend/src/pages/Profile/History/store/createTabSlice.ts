import { ActiveTab, StateTabSlice } from '../types'

export const createTabSlice: StateTabSlice = (set) => ({
    activeTab: ActiveTab.Post,
    setActiveTabToPost: () =>
        set((state) => {
            state.activeTab = ActiveTab.Post
        }),
    setActiveTabToComment: () =>
        set((state) => {
            state.activeTab = ActiveTab.Comment
        }),
    setActiveTabToVote: () =>
        set((state) => {
            state.activeTab = ActiveTab.Vote
        }),
})
