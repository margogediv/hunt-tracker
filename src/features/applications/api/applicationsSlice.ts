import {
  createEntityAdapter,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { nanoid, nowIso } from '@/shared/lib/id'
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationDraft,
  type ApplicationStatus,
} from '../types'
import type { RootState } from '@/app/store'

const adapter = createEntityAdapter<Application>({
  sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
})

const slice = createSlice({
  name: 'applications',
  initialState: adapter.getInitialState(),
  reducers: {
    applicationAdded: {
      reducer(state, action: PayloadAction<Application>) {
        adapter.addOne(state, action.payload)
      },
      prepare(draft: ApplicationDraft) {
        const now = nowIso()
        const application: Application = {
          ...draft,
          id: nanoid(),
          status: draft.status ?? 'wishlist',
          createdAt: now,
          updatedAt: now,
        }
        return { payload: application }
      },
    },

    applicationUpdated(
      state,
      action: PayloadAction<{
        id: string
        changes: Partial<Omit<Application, 'id' | 'createdAt'>>
      }>,
    ) {
      adapter.updateOne(state, {
        id: action.payload.id,
        changes: { ...action.payload.changes, updatedAt: nowIso() },
      })
    },

    applicationDeleted(state, action: PayloadAction<string>) {
      adapter.removeOne(state, action.payload)
    },

    applicationStatusChanged(
      state,
      action: PayloadAction<{ id: string; status: ApplicationStatus }>,
    ) {
      adapter.updateOne(state, {
        id: action.payload.id,
        changes: { status: action.payload.status, updatedAt: nowIso() },
      })
    },

    applicationsReplaced(state, action: PayloadAction<Application[]>) {
      adapter.setAll(state, action.payload)
    },
  },
})

export const {
  applicationAdded,
  applicationUpdated,
  applicationDeleted,
  applicationStatusChanged,
  applicationsReplaced,
} = slice.actions

export const applicationsReducer = slice.reducer

const baseSelectors = adapter.getSelectors<RootState>((state) => state.applications)

export const selectAllApplications = baseSelectors.selectAll
export const selectApplicationById = baseSelectors.selectById
export const selectApplicationIds = baseSelectors.selectIds
export const selectTotalApplications = baseSelectors.selectTotal

export const selectApplicationsByStatus = createSelector(
  [selectAllApplications, (_: RootState, status: ApplicationStatus) => status],
  (apps, status) => apps.filter((a) => a.status === status),
)

export const selectApplicationsCountByStatus = createSelector([selectAllApplications], (apps) => {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<
    ApplicationStatus,
    number
  >
  for (const app of apps) counts[app.status] += 1
  return counts
})
