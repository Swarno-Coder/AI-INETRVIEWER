'use client';

import { useState, useRef, useEffect } from 'react';
import VoiceBubble from '@/components/VoiceBubble';
import { useInterview } from '@/hooks/useInterview';

export default function Home() {
  const {
    isInterviewActive,
    isMicActive,
    isAISpeaking,
    conversationHistory,
    currentTranscript,
    startInterview,
    toggleMicrophone,
    endInterview,
    audioLevel,
    submitCurrentTranscript,
  } = useInterview();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-corporate-dark via-corporate-primary to-corporate-secondary">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Hello, I'm Swarnodip
          </h1>
          <p className="text-corporate-light text-lg">
            Ask me anything - I'll answer as Swarnodip would
          </p>
        </div>

        {/* Main Interview Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          {/* Voice Bubble Animation */}
          <div className="flex justify-center mb-8">
            <VoiceBubble 
              isActive={isAISpeaking || isMicActive} 
              isSpeaking={isAISpeaking}
              audioLevel={audioLevel}
            />
          </div>

          {/* Conversation Display */}
          <div className="mb-8 min-h-[200px] max-h-[300px] overflow-y-auto bg-white/5 rounded-xl p-6 backdrop-blur">
            {conversationHistory.length === 0 && !isInterviewActive ? (
              <p className="text-center text-corporate-light/70 text-lg">
                Click "Start Session" to begin asking questions
              </p>
            ) : (
              <div className="space-y-4">
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-corporate-accent text-white'
                          : 'bg-white/90 text-corporate-dark'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {msg.role === 'user' ? 'Interviewer' : 'Swarnodip (AI)'}
                      </p>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
                {currentTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-corporate-accent/50 text-white border border-corporate-accent">
                      <p className="text-sm font-medium mb-1">Interviewer (speaking...)</p>
                      <p className="italic">{currentTranscript}</p>
                      <button
                        onClick={submitCurrentTranscript}
                        className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-all"
                      >
                        Send Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6">
            {!isInterviewActive ? (
              <button
                onClick={startInterview}
                className="px-8 py-4 bg-gradient-to-r from-corporate-secondary to-corporate-accent text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Session
              </button>
            ) : (
              <>
                {/* Microphone Button */}
                <button
                  onClick={toggleMicrophone}
                  aria-label={isMicActive ? 'Stop microphone' : 'Start microphone'}
                  title={isMicActive ? 'Stop microphone' : 'Start microphone'}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 ${
                    isMicActive
                      ? 'bg-red-500 hover:bg-red-600 scale-110'
                      : 'bg-corporate-secondary hover:bg-corporate-accent scale-100'
                  }`}
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMicActive ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    )}
                  </svg>
                </button>

                <p className="text-white text-sm">
                  {isMicActive 
                    ? 'Listening to your question... (Press again to stop, then click "Send Now")' 
                    : 'Click to ask a question'}
                </p>

                {/* End Interview Button */}
                <button
                  onClick={endInterview}
                  className="mt-4 px-6 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full font-medium shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  End Session
                </button>
              </>
            )}
          </div>

          {/* Status Indicator */}
          {isAISpeaking && (
            <div className="mt-6 text-center">
              <p className="text-corporate-light text-sm animate-pulse">
                Swarnodip is answering...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-corporate-light/60 text-sm">
            Powered by Deepgram, & Google Gemini
          </p>
        </div>
      </div>
    </main>
  );
}
