import type { ReactNode } from "react"
import "./globals.css"

export const metadata = {
  title: "Rafetal Bitcoin UI Kit — The ShadCN of Bitcoin",
  description:
    "Copy-paste UI components for Bitcoin and Lightning apps. Headless, accessible, BigInt-safe.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
