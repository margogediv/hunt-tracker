import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createMigrate,
  persistReducer,
  persistStore,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { applicationsReducer } from '@/features/applications/api/applicationsSlice'
import { eventsReducer } from '@/features/applications/api/eventsSlice'
import { STORAGE_KEY, STORAGE_VERSION } from '@/shared/config/constants'

const rootReducer = combineReducers({
  applications: applicationsReducer,
  events: eventsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const persistConfig = {
  key: `${STORAGE_KEY}:v${STORAGE_VERSION}`,
  version: STORAGE_VERSION,
  storage,
  whitelist: ['applications', 'events'],
  migrate: createMigrate({}, { debug: false }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
})

export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
