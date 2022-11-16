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

    // When call is ended
    socket.on('callEnded', () => {
      console.log('received call ended...')

      // Reset relevant state variables
      setIsActiveCall(false)
      setIsIncomingCall(false)
      setIsOutgoingCall(false)
      setCallDetails({})

      // Reset connection
      const peer = new Peer({ initiator: true, trickle: false, stream })
      socket.off('callAccepted')
      connRef.current = peer

      // Replace peer stream with empty stream object
      const emptyStream = new MediaStream()
      peerStream.current.srcObject = emptyStream
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
      console.log('call accepted', signal)
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

    console.log('to:', idToCall)
    console.log('from:', myId)

    socket.emit('endCall', {
      to: idToCall || callDetails.from,
      from: myId
    })
  }

  return (
    <main className='w-[450px] md:w-[768px] text-center mx-auto'>
      <header>
        <h1 className='mb-8 mt-8'>Video Chat</h1>
      </header>

      <section className='justify-center'>
        <div className='grid grid-cols-1 gap-2 place-items-center md:grid-cols-2'>
          <div className='bg-slate-200 rounded p-2'>
            <h2 className='font-bold p-2 text-lg'>You</h2>
            <div>
              <video
                playsInline
                autoPlay
                ref={myStream}
                className='object-cover w-[400px] h-[300px]'
              />
            </div>
            <h3 className='m-4 font-bold p-3'>ID: {myId}</h3>
          </div>

          <div className='bg-slate-200 rounded p-2'>
            <h2 className='font-bold p-2 text-lg'>Them</h2>

            <div className='bg-slate-900'>
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
                  className='bg-blue-500 py-1 px-3 mx-2 text-white font-bold rounded my-6'
                >
                  Answer
                </button>
                <span>Incoming Call</span>
              </>
            ) : null}

            {isActiveCall === true ? (
              <button
                onClick={handleEndCall}
                className='bg-blue-500 py-1 px-3 mx-2 text-white font-bold rounded my-6'
              >
                End Call
              </button>
            ) : null}

            {!isOutgoingCall && !isIncomingCall && !isActiveCall && (
              <>
                <span className='font-bold'>Call: </span>

                <input
                  value={idToCall}
                  onChange={e => {
                    setIdToCall(e.target.value)
                  }}
                  placeholder='Enter Caller ID'
                  className='bg-white border-2 border-solid my-4 mx-2 p-2 rounded'
                />

                <button
                  onClick={handleCall}
                  className='bg-blue-500 py-1 px-3 mx-2 text-white font-bold rounded'
                >
                  Call
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      <div className='devData'>
        <p>
          <span>myId: </span>
          {myId}
        </p>
        <p>
          <span>idToCall: </span>
          {idToCall}
        </p>
        <p>
          <span>isActiveCall: </span>
          {isActiveCall.toString()}
        </p>
        <p>
          <span>isOutgoingCall: </span>
          {isOutgoingCall.toString()}
        </p>
        <p>
          <span>isIncomingCall: </span>
          {isIncomingCall.toString()}
        </p>
        <p>
          <span>callDetails.from: </span>
          {callDetails.from}
        </p>
      </div>
    </main>
  )
}

export default App
