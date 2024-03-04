import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage"; 
import { persistReducer, persistStore } from "redux-persist";

import cartSlice from "./slice/cartSlice";

const persistConfig = {
  key: "root", // key is the name of the storage
  storage, // define which storage to use
};

// Combine reducers if you have more; right now it's just cartSlice
const rootReducer = combineReducers({
  cart: cartSlice,
  // other reducers go here
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore serializability checks for these action types
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
  // other store enhancers if any
});

export const persistor = persistStore(store);
export default store;
