import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import { thunk } from 'redux-thunk';
import { Root } from "./Redux/Root";

let Store = configureStore({
    reducer: Root
},
    applyMiddleware(thunk)
);

export { Store };