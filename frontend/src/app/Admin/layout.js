"use client"
import AdminNavbar from "./Navbar/Admin_navbar";

export default function RootLayout({ children }) {
  return (
    <>
    <AdminNavbar></AdminNavbar>
    {children}
    </>
  );
}