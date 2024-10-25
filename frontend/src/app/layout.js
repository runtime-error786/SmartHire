"use client"
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Store, persistor } from "@/Store";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Protect from "./others/protected_routes";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={Store}>
          <PersistGate loading={null} persistor={persistor}>
              <Protect>
            <GoogleOAuthProvider clientId="166424008698-umf0iijpbmf0he2qdg70ebpbjhv9ol4b.apps.googleusercontent.com">
                {children}
            </GoogleOAuthProvider>
              </Protect>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}