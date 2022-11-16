import './assets/styles.css'

import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

import Peer from 'simple-peer'

const socket = io('http://localhost:8080')

function App () {
  const [myId, setMyId] = useState('')
  const [idToCall, setIdToCall] = useState('')

  const [isActiveCall, setIsActiveCall] = useState(false)
  const [isIncomingCall, setIsIncomingCall] = useState(false)
  const [isOutgoingCall, setIsOutgoingCall] = useState(false)

  const [stream, setStream] = useState()

  const myStream = useRef()
  const peerStream = useRef()

  const connRef = useRef()

  const [callDetails, setCallDetails] = useState({})

  useEffect(() => {
    // Stream webcam
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(videoStream => {
        setStream(videoStream)
        myStream.current.srcObject = videoStream
      })

    // Get unique Id
    socket.on('myId', id => setMyId(id))

    // On 'makeCall' store call state and signal
    socket.on('makeCall', ({ from, signal }) => {
      console.log('setting call from: ', from)
      console.log('setting call signal: ', signal)

      setCallDetails({ from, signal })
      setIsIncomingCall(true)
    })
  }, [])

  // Handle to making of a call
  function handleCall () {
    console.log('Making call to: ', idToCall)
    setIsActiveCall(true)
    setIsOutgoingCall(true)

    const peer = new Peer({ initiator: true, trickle: false, stream })

    peer.on('signal', data => {
      socket.emit('makeCall', {
        to: idToCall,
        signal: data,
        from: myId
      })
    })

    peer.on('stream', videoStream => {
      peerStream.current.srcObject = videoStream
    })

    socket.on('callAccepted', signal => {
      console.log('call accepted')
      setIsActiveCall(true)

      peer.signal(signal)
    })

    connRef.current = peer
  }

  // Handle the answering of a call
  function handleAnswerCall () {
    console.log('Answering call...')
    setIsActiveCall(true)
    setIsIncomingCall(false)

    const peer = new Peer({ initiator: false, trickle: false, stream })

    peer.on('signal', data => {
      console.log('emitting answer call...')
      socket.emit('answerCall', { signal: data, to: callDetails.from })
    })

    peer.on('stream', videoStream => {
      peerStream.current.srcObject = videoStream
    })

    peer.signal(callDetails.signal)

    connRef.current = peer
  }

  // Handle ending the call
  function handleEndCall () {
    console.log('Ending call...')
    setIsActiveCall(false)
    setIsIncomingCall(false)
    setIsOutgoingCall(false)
  }

  return (
    <main className='w-[960px] text-center'>
      <header>
        <h1 className='mb-8 mt-8'>Video Chat</h1>
      </header>

      <section className=''>
        <div className='flex flex-row w-[960px] justify-center'>
          <div className='bg-green-500'>
            <h2>You</h2>
            <div className='bg-red-500'>
              <video
                playsInline
                autoPlay
                ref={myStream}
                className='object-cover w-[400px] h-[300px]'
              />
            </div>
            <h3 className='m-4'>ID: {myId}</h3>
          </div>

          <div className='bg-orange-500'>
            <h2>Them</h2>

            <div className='bg-yellow-500'>
              <video
                playsInline
                autoPlay
                ref={peerStream}
                className='object-cover w-[400px] h-[300px]'
              />
            </div>

            {isIncomingCall && !isActiveCall ? (
              <>
                <button
                  onClick={handleAnswerCall}
                  className='bg-blue-500 p-3 mx-2'
                >
                  Answer
                </button>
                <span>Incoming Call</span>
              </>
            ) : null}

            {isActiveCall === true ? (
              <button onClick={handleEndCall} className='bg-blue-500 p-3 mx-2'>
                End Call
              </button>
            ) : null}

            {!isOutgoingCall && !isIncomingCall && !isActiveCall && (
              <>
                <span>Call: </span>

                <input
                  value={idToCall}
                  onChange={e => {
                    setIdToCall(e.target.value)
                  }}
                  className='bg-white border-2 border-solid my-4 mx-2'
                />

                <button onClick={handleCall} className='bg-blue-500 p-3 mx-2'>
                  Call
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      <div className='bg-stone-300'>
        <p>myId: {myId}</p>
        <p>idToCall: {idToCall}</p>
        <p>isActiveCall: {isActiveCall.toString()}</p>
        <p>isOutgoingCall: {isOutgoingCall.toString()}</p>
        <p>isIncomingCall: {isIncomingCall.toString()}</p>
        <p>callDetails.from: {callDetails.from}</p>
      </div>
    </main>
  )
}

export default App
