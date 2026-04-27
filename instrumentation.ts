export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('uncaughtException', (err) => {
      console.error('Caught exception:', err.message)
      // Không exit process
    })
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection:', reason)
      // Không exit process
    })
  }
}