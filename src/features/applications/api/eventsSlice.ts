import {
  createEntityAdapter,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { nanoid, nowIso } from '@/shared/lib/id'
import type { ApplicationEvent, ApplicationEventDraft } from '../types'
import type { RootState } from '@/app/store'

const adapter = createEntityAdapter<ApplicationEvent>({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
})

const slice = createSlice({
  name: 'events',
  initialState: adapter.getInitialState(),
  reducers: {
    eventAdded: {
      reducer(state, action: PayloadAction<ApplicationEvent>) {
        adapter.addOne(state, action.payload)
      },
      prepare(draft: ApplicationEventDraft) {
        const event: ApplicationEvent = {
          ...draft,
          id: nanoid(),
          date: draft.date ?? nowIso(),
        }
        return { payload: event }
      },
    },

    eventsForApplicationDeleted(state, action: PayloadAction<string>) {
      const ids = Object.values(state.entities)
        .filter((e) => e.applicationId === action.payload)
        .map((e) => e.id)
      adapter.removeMany(state, ids)
    },

    eventsReplaced(state, action: PayloadAction<ApplicationEvent[]>) {
      adapter.setAll(state, action.payload)
    },
  },
})

export const { eventAdded, eventsForApplicationDeleted, eventsReplaced } = slice.actions

export const eventsReducer = slice.reducer

const baseSelectors = adapter.getSelectors<RootState>((state) => state.events)
export const selectAllEvents = baseSelectors.selectAll
export const selectEventById = baseSelectors.selectById

export const selectEventsByApplicationId = createSelector(
  [selectAllEvents, (_: RootState, applicationId: string) => applicationId],
  (events, applicationId) => events.filter((e) => e.applicationId === applicationId),
)
