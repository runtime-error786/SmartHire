"use client"
import { Provider } from "react-redux";
import { Store } from "@/Store";

export default function RootLayout({ children }) {
  return (
    <Provider store={Store}>
    <html lang="en">
      
      <body>
      {children}
      </body>
    </html>
    </Provider>
  );
}