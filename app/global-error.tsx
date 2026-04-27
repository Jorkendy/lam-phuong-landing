'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (error.message?.includes('Server Action') || 
        error.message?.includes('workers')) {
      window.location.reload()
    }
  }, [error])

  return (
    <html>
      <body>
        <h2>Đang tải lại...</h2>
      </body>
    </html>
  )
}