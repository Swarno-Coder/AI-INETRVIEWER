'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useInterview() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  // Handle user response and get AI reply
  const handleUserResponse = useCallback(async (userText: string) => {
    console.log('💬 Processing user response:', userText);
    
    // Add user message to history
    const updatedHistory = [...conversationHistory, { role: 'user' as const, content: userText }];
    setConversationHistory(updatedHistory);
    
    console.log('📊 Updated conversation history:', updatedHistory);

    // Send to Gemini for processing
    try {
      console.log('🤖 Sending to Gemini API...');
      
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationHistory: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const { reply, shouldEnd } = await response.json();
      
      console.log('✅ Gemini response:', reply);

      // Add AI response to history
      const finalHistory = [...updatedHistory, { role: 'assistant' as const, content: reply }];
      setConversationHistory(finalHistory);

      // Play AI response
      await playTextToSpeech(reply);

      // Check if interview should end
      if (shouldEnd || reply.includes('Thank you for your time, we will get back to you soon')) {
        console.log('👋 Interview ending...');
        setIsInterviewActive(false);
        setIsMicActive(false);
      }

    } catch (error) {
      console.error('❌ Interview API error:', error);
      alert('Sorry, there was an error processing your response. Please try again.');
    }
  }, [conversationHistory]);

  // Stop microphone
  const stopMicrophone = () => {
    console.log('🛑 Stopping microphone...');
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('⏹️ Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('⏹️ Stopped track:', track.kind);
      });
      mediaStreamRef.current = null;
    }
    
    setIsMicActive(false);
    setAudioLevel(0);
    setCurrentTranscript('');
  };

  // Finalize transcript and send to AI
  const finalizeTranscript = useCallback(async () => {
    const finalText = accumulatedTranscriptRef.current.trim();
    
    if (!finalText) {
      console.log('⚠️ No transcript to finalize');
      return;
    }
    
    console.log('🎯 Finalizing transcript:', finalText);
    
    // Clear accumulated transcript
    accumulatedTranscriptRef.current = '';
    
    // Clear current transcript display
    setCurrentTranscript('');
    
    // Stop microphone
    stopMicrophone();
    
    // Process the transcript
    await handleUserResponse(finalText);
  }, [handleUserResponse]);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let animationId: number;
    
    const checkLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = average / 255;
      setAudioLevel(normalizedLevel);
      
      if (isMicActive || isAISpeaking) {
        animationId = requestAnimationFrame(checkLevel);
      }
    };
    
    checkLevel();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMicActive, isAISpeaking]);

  // Start the interview
  const startInterview = useCallback(async () => {
    setIsInterviewActive(true);
    
    // Greet the user
    const greeting = "Hello! Welcome to your interview session. I'm your AI interviewer today. Let's begin with a simple question: Can you tell me about yourself and your background?";
    
    setConversationHistory([{ role: 'assistant', content: greeting }]);
    
    // Play greeting via TTS
    await playTextToSpeech(greeting);
  }, []);

  // Play text using Deepgram TTS
  const playTextToSpeech = async (text: string) => {
    try {
      setIsAISpeaking(true);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS request failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Monitor audio playback for visualization
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const source = audioContextRef.current.createMediaElementSource(audio);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      monitorAudioLevel();

      audio.onended = () => {
        setIsAISpeaking(false);
        setAudioLevel(0);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsAISpeaking(false);
    }
  };

  // Toggle microphone with Web Speech API
  const toggleMicrophone = useCallback(async () => {
    if (!isMicActive) {
      // Start microphone
      try {
        console.log('🎤 Starting microphone...');
        
        // Check for Web Speech API support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
          alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setIsMicActive(true);

        // Setup audio analysis for visualization
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

        monitorAudioLevel();

        // Initialize Web Speech API
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognitionRef.current = recognition;

        // Reset accumulated transcript
        accumulatedTranscriptRef.current = '';

        recognition.onstart = () => {
          console.log('✅ Speech recognition started');
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              console.log('📝 Final transcript:', transcript);
            } else {
              interimTranscript += transcript;
              console.log('⏳ Interim transcript:', transcript);
            }
          }

          // Update current transcript for display (interim)
          if (interimTranscript) {
            setCurrentTranscript(interimTranscript);
          }

          // Accumulate final transcripts
          if (finalTranscript.trim()) {
            accumulatedTranscriptRef.current += finalTranscript;
            console.log('✅ Accumulated:', accumulatedTranscriptRef.current);
            setCurrentTranscript(accumulatedTranscriptRef.current);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            console.log('⚠️ No speech detected, continue listening...');
          } else if (event.error === 'aborted') {
            console.log('⚠️ Recognition aborted');
          } else {
            alert(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          console.log('🔚 Speech recognition ended');
          
          // Don't auto-send when recognition ends
          // User must click "Send Now" button or stop mic manually
          console.log('⏸️ Recognition ended, transcript saved. Click "Send Now" to submit.');
        };

        // Start recognition
        recognition.start();
        console.log('🎙️ Listening...');
        
      } catch (error) {
        console.error('❌ Microphone access error:', error);
        alert('Could not access microphone. Please check your browser permissions.');
      }
    } else {
      // Stop microphone
      stopMicrophone();
    }
  }, [isMicActive, monitorAudioLevel, finalizeTranscript]);

  // End interview
  const endInterview = useCallback(() => {
    console.log('🏁 Ending interview...');
    stopMicrophone();
    setIsInterviewActive(false);
    setConversationHistory([]);
    setAudioLevel(0);
    accumulatedTranscriptRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up...');
      stopMicrophone();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Manual submit for current transcript
  const submitCurrentTranscript = useCallback(async () => {
    const textToSubmit = accumulatedTranscriptRef.current.trim() || currentTranscript.trim();
    
    if (!textToSubmit) {
      console.log('⚠️ No transcript to submit');
      return;
    }
    
    console.log('📤 Manual submit:', textToSubmit);
    
    // If we have accumulated transcript, use that, otherwise use current
    if (accumulatedTranscriptRef.current.trim()) {
      await finalizeTranscript();
    } else if (currentTranscript.trim()) {
      // Manually set accumulated and finalize
      accumulatedTranscriptRef.current = currentTranscript.trim();
      await finalizeTranscript();
    }
  }, [currentTranscript, finalizeTranscript]);

  return {
    isInterviewActive,
    isMicActive,
    isAISpeaking,
    conversationHistory,
    currentTranscript,
    audioLevel,
    startInterview,
    toggleMicrophone,
    endInterview,
    submitCurrentTranscript,
  };
}
