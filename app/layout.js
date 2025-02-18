import './globals.css'

export const metadata = {
  title: 'Netflix Renewal Tracker',
  description: 'Track Netflix account renewals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}