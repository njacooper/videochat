import './assets/styles.css'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8080')

function App() {
  const [myId, setMyId] = useState('abcid')
  const [idToCall, setIdToCall] = useState('')

  const [isActiveCall, setIsActiveCall] = useState(false)
  const [isIncomingCall, setIsIncomingCall] = useState(true)
  const [isOutgoingCall, setIsOutgoingCall] = useState(false)

  // Test connection to socket server
  useEffect(() => {
    socket.on('connect', () => {
      console.log('socket.id: ', socket.id)
    })
  }, [])

  function handleCall() {
    console.log('Making call to: ', idToCall)
    setIsActiveCall(true)
    setIsOutgoingCall(true)
  }
  function handleAnswerCall() {
    console.log('Answering call...')
    setIsActiveCall(true)
    setIsIncomingCall(false)
  }
  function handleEndCall() {
    console.log('Ending call...')
    setIsActiveCall(false)
    setIsIncomingCall(false)
    setIsOutgoingCall(false)
  }

  return (
    <main className="w-[960px] text-center">
      <header>
        <h1 className="mb-8 mt-8">Video Chat</h1>
      </header>

      <section className="">
        <div className="flex flex-row w-[960px] justify-center">
          <div className="bg-green-500">
            <h2>You</h2>
            <div className="bg-red-500">
              <video playsInline autoPlay />
            </div>
            <h3 className="m-4">ID: {myId}</h3>
          </div>

          <div className="bg-orange-500">
            <h2>Them</h2>

            <div className="bg-yellow-500">
              <video playsInline autoPlay />
            </div>

            {isIncomingCall && !isActiveCall ? (
              <>
                <button
                  onClick={handleAnswerCall}
                  className="bg-blue-500 p-3 mx-2"
                >
                  Answer
                </button>
                <span>Incoming Call</span>
              </>
            ) : null}

            {isActiveCall === true ? (
              <button onClick={handleEndCall} className="bg-blue-500 p-3 mx-2">
                End Call
              </button>
            ) : null}

            {!isOutgoingCall && !isIncomingCall && !isActiveCall && (
              <>
                <span>Call: </span>

                <input
                  value={idToCall}
                  onChange={(e) => {
                    setIdToCall(e.target.value)
                  }}
                  className="bg-white border-2 border-solid my-4 mx-2"
                />

                <button onClick={handleCall} className="bg-blue-500 p-3 mx-2">
                  Call
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      <div className="bg-stone-300">
        <p>myId: {myId}</p>
        <p>idToCall: {idToCall}</p>
        <p>isActiveCall: {isActiveCall.toString()}</p>
        <p>isOutgoingCall: {isOutgoingCall.toString()}</p>
        <p>isIncomingCall: {isIncomingCall.toString()}</p>
      </div>
    </main>
  )
}

export default App
