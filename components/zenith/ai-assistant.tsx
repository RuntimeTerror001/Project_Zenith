"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Mic, MicOff, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = [
  'What planets are visible tonight?',
  'When will ISS pass over New York?',
  'Tell me about Orion constellation',
  'What meteor showers are active?',
  'How far is the Moon from Earth?',
  'What is a nebula?',
];

const RESPONSES: Record<string, string> = {
  default: "That's a fascinating space question! While I'm connecting to the cosmic knowledge base, here are some thoughts: the universe is full of incredible phenomena worth exploring. For precise real-time data, the NASA Open APIs provide live telemetry from the ISS and planetary positions.",
  planet: "Tonight's visible planets depend on your location and date. Generally, Venus and Jupiter are the brightest — often visible just after sunset or before sunrise. Mars is currently in Aquarius and can be spotted low on the eastern horizon around midnight. Saturn is rising in Pisces.",
  iss: "The ISS orbits Earth every 90 minutes at 408 km altitude traveling at 7.66 km/s. From most cities, it passes overhead 2-5 times per night and appears as a bright, fast-moving star. NASA's Spot the Station tool can give you exact pass times for your location.",
  orion: "Orion is one of the most recognizable constellations in the winter sky. Look for his distinctive belt of three stars (Alnitak, Alnilam, Mintaka). His brightest star is Rigel (blue supergiant, 860 light-years away) at the lower right, and Betelgeuse (red supergiant) at the upper left — which may go supernova in our lifetime!",
  meteor: "Currently active meteor showers: The Perseids (peak August 12) are among the best with 100+ meteors/hour. The Geminids (December 14) produce the richest shower at 150+ meteors/hour. Right now, you may catch sporadic meteors from minor showers. Look toward the darkest part of the sky after midnight.",
  moon: "The Moon is about 384,400 km from Earth on average (it varies between 356,500 km at perigee and 406,700 km at apogee). Light takes 1.3 seconds to travel this distance. The Moon is slowly moving away at 3.8 cm per year due to tidal forces.",
  nebula: "A nebula is a cloud of gas and dust in space — the birthplace of stars. The Orion Nebula (M42) is visible to the naked eye and is one of the most photographed objects in the sky. The Eagle Nebula contains the famous 'Pillars of Creation' captured beautifully by the Hubble and Webb telescopes.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('planet') || lower.includes('visible') || lower.includes('venus') || lower.includes('jupiter')) return RESPONSES.planet;
  if (lower.includes('iss') || lower.includes('space station') || lower.includes('pass over')) return RESPONSES.iss;
  if (lower.includes('orion')) return RESPONSES.orion;
  if (lower.includes('meteor') || lower.includes('shower')) return RESPONSES.meteor;
  if (lower.includes('moon') || lower.includes('lunar')) return RESPONSES.moon;
  if (lower.includes('nebula') || lower.includes('cloud')) return RESPONSES.nebula;
  return RESPONSES.default;
}

export function AISpaceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm your AI Space Guide. Ask me anything about planets, constellations, the ISS, meteor showers, or any cosmic wonder!" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInputText('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = getResponse(text);
    setIsTyping(false);
    setMessages((m) => [...m, { role: 'assistant', text: response }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <>
      {/* Floating orb button */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(6,182,212,0.2)',
              }}
            >
              <Sparkles className="w-7 h-7 text-white" />
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(124,58,237,0.5)' }}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20, transformOrigin: 'bottom right' }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 right-0 w-[calc(100vw-2rem)] sm:w-[360px] rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(10,10,30,0.97)',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: '0 0 60px rgba(124,58,237,0.2), 0 20px 80px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">AI Space Guide</div>
                    <div className="flex items-center gap-1.5 text-xs text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                  <X className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 hide-scrollbar">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'text-white rounded-br-md'
                          : 'text-white/85 rounded-bl-md'
                      }`}
                      style={{
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                          : 'rgba(255,255,255,0.07)',
                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 0.2, 0.4].map((delay) => (
                          <motion.div key={delay} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} className="w-2 h-2 rounded-full bg-cyan-400" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(s)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs text-white/60 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about space..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsListening((l) => !l)}
                    className={`p-1.5 rounded-lg transition-colors ${isListening ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!inputText.trim()}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
