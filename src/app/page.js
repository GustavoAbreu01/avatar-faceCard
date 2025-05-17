'use client'

import { BsMouse2Fill } from "react-icons/bs"
import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import { WritingText } from "@/components/animate-ui/text/writing"
import { FaArrowRight } from "react-icons/fa";

const EMOJI_MAP = {
  neutral: '😐',
  happy: '😃',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
}

const ERROR_MAP = {
  error: '❌',
  alert: '⚠',
}
const ERROR_KEYS = Object.keys(ERROR_MAP)

export default function Home() {
  const videoRef = useRef(null)

  const EXPRESSIONS = Object.keys(EMOJI_MAP)
  const [sequence, setSequence] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState('loading')
  const [topExpression, setTopExpression] = useState(null)
  const [wrongIndices, setWrongIndices] = useState([])
  const [spilledErr, setSpilledErr] = useState([])
  const [showLossModal, setShowLossModal] = useState(false)
  const [spilledWin, setSpilledWin] = useState([])
  useEffect(() => {
    const MODEL_URL = '/models'
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      setStatus('ready')
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream
        })
        .catch(console.error)
    })
  }, [])
  function startGame() {
    const seq = []
    let prev = null
    while (seq.length < 10) {
      const pick = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
      if (pick !== prev) {
        seq.push(pick)
        prev = pick
      }
    }
    setSequence(seq)
    setCurrentIndex(0)
    setWrongIndices([])
    setSpilledErr([])
    setShowLossModal(false)
    setSpilledWin([])
    setStatus('playing')
  }
  useEffect(() => {
    if (status !== 'playing') return
    const interval = setInterval(async () => {
      if (!videoRef.current) return
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()
      if (!det?.expressions) return

      const [label] = Object
        .entries(det.expressions)
        .sort(([, a], [, b]) => b - a)[0]
      setTopExpression(label)

      const target = sequence[currentIndex]

      if (label === target) {
        if (currentIndex + 1 >= sequence.length) {
          clearInterval(interval)
          setStatus('finished')
        } else {
          setCurrentIndex(i => i + 1)
        }
      } else if (
        !wrongIndices.includes(currentIndex) &&
        det.expressions[label] > 0.8
      ) {
        setWrongIndices(prev => [...prev, currentIndex])
        setCurrentIndex(i => i + 1)
        let newPick
        do {
          newPick = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
        } while (newPick === sequence[sequence.length - 1])
        setSequence(prev => [...prev, newPick])
        if (wrongIndices.length + 1 >= 7) {
          clearInterval(interval)
          setStatus('lost')
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [status, currentIndex, sequence, wrongIndices])
  useEffect(() => {
    if (status !== 'lost') return
    let count = 0
    const iv = setInterval(() => {
      if (count >= 500) {
        clearInterval(iv)
        setShowLossModal(true)
      } else {
        const key = ERROR_KEYS[Math.floor(Math.random() * ERROR_KEYS.length)]
        setSpilledErr(prev => [
          ...prev,
          { id: count, label: ERROR_MAP[key], x: Math.random() * 100, y: Math.random() * 100 }
        ])
        count++
      }
    }, 10)
    return () => clearInterval(iv)
  }, [status])
  useEffect(() => {
    if (status !== 'finished') return
    let count = 0
    const iv = setInterval(() => {
      if (count >= 500) {
        clearInterval(iv)
      } else {
        const pick = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
        setSpilledWin(prev => [
          ...prev,
          { id: count, label: EMOJI_MAP[pick], x: Math.random() * 100, y: Math.random() * 100 }
        ])
        count++
      }
    }, 10)
    return () => clearInterval(iv)
  }, [status])

  return (
    <div className="bg-[var(--color_2)] w-screen h-screen flex items-center justify-center">
      {spilledWin.map(e => (
        <span
          key={e.id}
          className="fixed text-4xl animate-fade"
          style={{ left: `${e.x}%`, top: `${e.y}%`, pointerEvents: 'none' }}
        >{e.label}</span>
      ))}
      {spilledErr.map(e => (
        <span
          key={e.id}
          className="fixed text-4xl animate-fade"
          style={{ left: `${e.x}%`, top: `${e.y}%`, pointerEvents: 'none' }}
        >{e.label}</span>
      ))}
      {status === 'lost' && showLossModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade">
          <div className="bg-gray-700 p-8 rounded-lg shadow-2xl text-center space-y-4">
            <h2 className="text-2xl text-white font-bold">Você <span className="font-(--color_1)">Dev</span> se isolar!!</h2>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-[var(--color_1)] font-bold text-white rounded"
            >Recomeçar</button>
          </div>
        </div>
      )}
      <div className="absolute top-22 left-0 right-0 flex justify-center space-x-4">
        {sequence.map((exp, i) => (
          <div key={i} className="relative text-3xl">
            <span className={i === currentIndex && status === 'playing' ? 'animate-pulse' : ''}>
              {EMOJI_MAP[exp]}
            </span>
            {i < currentIndex && !wrongIndices.includes(i) && (
              <span className="absolute top-0 right-0 text-xl">✅</span>
            )}
            {wrongIndices.includes(i) && (
              <span className="absolute top-0 left-0 text-xl text-red-500">❌</span>
            )}
          </div>
        ))}
      </div>
      {status === 'ready' && (
        <>
          <button
            onClick={startGame}
            className="absolute right-69 bottom-29.5 z-10 w-9.5 h-10.5 bg-[var(--color_1)] rounded-tl-full cursor-pointer"
          />
          <div
            onClick={startGame}
            className="absolute right-69 bottom-29.5 z-10 w-9.5 h-10.5 bg-[var(--color_1)] rounded-tl-full animate-ping cursor-pointer"
          />
        </>
      )}
      <div>
        <div className="
          relative mx-auto border-gray-800 dark:border-gray-900
          bg-gray-900 border-[28px] rounded-t-xl
          h-[172px] max-w-[801px]
          md:h-[494px] md:max-w-[812px]"
        >
          <div className="rounded-xl overflow-hidden h-[140px] md:h-[462px]">
            <video
              ref={videoRef}
              autoPlay muted playsInline
              className="h-[180px] md:h-[562px] w-full rounded-xl object-cover"
            />
          </div>
        </div>
        <div className="relative mx-auto bg-gray-900 dark:bg-gray-900 rounded-b-xl
                        h-[24px] max-w-[401px] md:h-[42px] md:max-w-[812px]" />
        <div className="relative mx-auto bg-gray-800
                        h-[55px] max-w-[123px] md:h-[95px] md:max-w-[142px]" />
        <div className="relative mx-auto bg-gray-900 rounded-xl
                        h-[55px] max-w-[183px] md:h-[45px] md:max-w-[442px]" />
      </div>
      <div className="fixed inset-0 flex items-center justify-center text-white p-3 rounded-md">
        {status === 'finished' && (
          <div className="bg-gray-700 p-8 rounded-lg shadow-2xl text-center space-y-4">
            <h2 className="text-2xl text-white font-bold">Você está permitido a conviver em sociedade!!</h2>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-[var(--color_1)] font-bold text-white rounded"
            >Jogar Novamente</button>
          </div>
        )}
      </div>
      <div className="absolute right-54 bottom-10">
        <BsMouse2Fill className="text-gray-900 text-2xl size-30" />
      </div>
      {status !== 'playing' && status === 'ready' && (
        <div className="absolute right-85 bottom-30 animate-pulse bg-gray-700 px-4 py-2 rounded-md gap-2 text-white flex items-center shadow-xl">
          <p className="font-bold">Click</p>
          <FaArrowRight />
        </div>
      )}
      {status === 'playing' && (
        <div className="fixed bottom-8 bg-gray-800 rounded-lg text-white p-4">
          <p>Faça: <strong>{sequence[currentIndex]}</strong> — Você está: <em>{topExpression || '—'}</em></p>
        </div>
      )}
      <div className="absolute bottom-10 left-10 p-3 bg-gray-900 max-w-130 gap-10 rounded-lg shadow-xl">
        <h1 className="mb-4 text-4xl font-extrabold text-gray-400 dark:text-white">
          Challenge <mark className="px-3 text-white bg-[var(--color_1)] rounded-sm">Emotion</mark> Dev
        </h1>
        <WritingText
          className="text-lg font-normal text-gray-200 lg:text-xl"
          text="Ensinando Dev's a se expressarem, para retornarem a sociedade."
          spacing={9}
        />
      </div>
    </div>
  )
}
