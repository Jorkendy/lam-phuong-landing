'use client'
import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Nếu lỗi do stale deployment, reload trang
        if (error.message.includes('Server Action')) {
            window.location.reload()
        }
    }, [error])

    return (
        <div>
            <h2>Có lỗi xảy ra </h2>
            < button onClick={() => reset()
            }> Thử lại </button>
        </div>
    )
}