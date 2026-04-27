export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION:', err)
    })
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION:', err)
      // Log nhưng không exit
    })
  }
}