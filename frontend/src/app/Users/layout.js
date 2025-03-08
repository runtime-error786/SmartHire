"use client"
import Navbar from "./Navbar/navbar";

export default function RootLayout({ children }) {
  return (
    <>
    <Navbar> </Navbar>
    {children}
    </>
  );
}