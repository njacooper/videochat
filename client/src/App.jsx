import './assets/styles.css'

import { useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8080')

function App() {
  
  // Test connection to socket server
  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket.id: ', socket.id)
    })
  }, [])

  return (
    <main className='wrapper'>
      <h1>Video Chat</h1>
    </main>
  )
}

export default App
