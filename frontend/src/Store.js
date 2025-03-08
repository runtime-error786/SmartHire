import { configureStore, combineReducers } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use localStorage for web
import { Root } from "./Redux/Root";

const persistConfig = {
  key: "root",   
  storage,        
  blacklist: ['show_search', 'show_search_reducer','admin_search_bar_reducer','search_bar_reducer'],
};

const persistedReducer = persistReducer(persistConfig, Root);

const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,  
      serializableCheck: false,  
    }),
});

const persistor = persistStore(Store);  

export { Store, persistor };
