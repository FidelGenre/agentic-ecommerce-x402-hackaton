import { useState, useEffect, useCallback } from 'react'

export function useVoiceInput() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Browser does not support speech recognition.')
            return
        }
    }, [])

    const startListening = useCallback(() => {
        setError(null)
        setIsListening(true)
        setTranscript('')

        try {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript
                setTranscript(text)
                setIsListening(false)
            }

            recognition.onerror = (event: any) => {
                setError(event.error)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognition.start()
        } catch (err) {
            setError('Failed to start recording')
            setIsListening(false)
        }
    }, [])

    return { isListening, transcript, startListening, error }
}
