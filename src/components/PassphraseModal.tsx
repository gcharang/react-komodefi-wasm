import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Input,
} from '@headlessui/react';
import { Key, ClipboardPaste, CheckCircle, AlertCircle, X } from 'lucide-react';
import type { PassphraseModalProps, WordInputProps } from '../types/components';
import { 
  BIP39_WORDLIST, 
  BIP39_WORD_SET, 
  BIP39_WORD_MAP,
  VALID_MNEMONIC_LENGTHS,
  type ValidMnemonicLength 
} from '../staticData/bip39-wordlist';

// Helper functions for BIP39 checksum validation
function toBinary(n: number, width: number): string {
  return n.toString(2).padStart(width, '0');
}

function bitsToBytes(bits: string): Uint8Array {
  const len = bits.length / 8;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return out;
}

async function verifyBip39Checksum(words: string[]): Promise<{ ok: boolean; reason?: string }> {
  // Get word indices
  const indices = words.map(w => BIP39_WORD_MAP.get(w));
  if (indices.some(v => v === undefined)) {
    return { ok: false, reason: 'unknown_word' };
  }
  
  // Convert words to bits (11 bits per word)
  const MS = words.length * 11; // Total mnemonic sentence bits
  const bitString = indices.map(i => toBinary(i!, 11)).join('');
  
  // Calculate entropy and checksum lengths
  // MS = ENT + CS, where CS = ENT / 32
  // MS = ENT + ENT/32 = ENT * (1 + 1/32) = ENT * 33/32
  // Therefore: ENT = MS * 32/33
  const ENT = Math.floor((MS * 32) / 33);
  const CS = Math.floor(ENT / 32);
  
  // Verify ENT is valid (must be 128-256 bits and divisible by 32)
  if (ENT < 128 || ENT > 256) {
    return { ok: false, reason: 'invalid_entropy_length' };
  }
  
  if (ENT % 32 !== 0) {
    return { ok: false, reason: 'invalid_length' };
  }
  
  // Split into entropy and checksum parts
  const entropyBits = bitString.slice(0, ENT);
  const checksumBits = bitString.slice(ENT, ENT + CS);
  
  // Convert entropy bits to bytes for hashing
  const entropy = bitsToBytes(entropyBits);
  
  // Check if Web Crypto API is available
  if (!(window.crypto && window.crypto.subtle)) {
    return { ok: false, reason: 'webcrypto_unavailable' };
  }
  
  try {
    // Calculate SHA-256 hash of entropy
    // Create a new ArrayBuffer to ensure compatibility with crypto.subtle.digest
    const entropyBuffer = new ArrayBuffer(entropy.length);
    const entropyView = new Uint8Array(entropyBuffer);
    entropyView.set(entropy);
    
    const hashBuf = await crypto.subtle.digest('SHA-256', entropyBuffer);
    const hashArray = new Uint8Array(hashBuf);
    
    // Convert first byte(s) of hash to binary and take CS bits as expected checksum
    const hashBits = Array.from(hashArray)
      .map(b => b.toString(2).padStart(8, '0'))
      .join('');
    const expectedChecksum = hashBits.slice(0, CS);
    
    // Compare checksums
    return { ok: expectedChecksum === checksumBits };
  } catch (error) {
    return { ok: false, reason: 'checksum_error' };
  }
}

// WordInput component
const WordInput: React.FC<WordInputProps> = ({ 
  index, 
  value, 
  onChange, 
  onPaste,
  isValid,
  autoFocus 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow the raw value to be set first (this allows backspace to work)
    const rawValue = e.target.value;
    
    // Only filter out non-alphabetic characters if there's actual content
    const newValue = rawValue.toLowerCase().replace(/[^a-z]/g, '');
    // Compare against the current value prop to detect deletion
    const isDeleting = newValue.length < value.length;
    
    onChange(index, newValue);
    
    if (newValue.length > 0) {
      const matches = BIP39_WORDLIST.filter(word => word.startsWith(newValue));
      setSuggestions(matches.slice(0, 5));
      setSelectedSuggestion(0);
      
      // Auto-complete only when adding characters, not deleting
      if (!isDeleting && matches.length === 1 && newValue !== matches[0]) {
        onChange(index, matches[0]);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion(prev => Math.max(prev - 1, 0));
      } else if ((e.key === 'Enter' || e.key === 'Tab') && suggestions[selectedSuggestion]) {
        e.preventDefault();
        onChange(index, suggestions[selectedSuggestion]);
        setSuggestions([]);
        // Focus next input
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText
      .toLowerCase()
      .split(/[\s,]+/)
      .map(w => w.replace(/[^a-z]/g, ''))
      .filter(w => w.length > 0);
    
    if (words.length > 0) {
      onPaste(index, words);
    }
  };

  return (
    <div className="relative group">
      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold transition-all duration-200 z-10 ${
        isFocused ? 'text-accent' : value.length > 0 ? isValid ? 'text-success' : 'text-danger' : 'text-white/40'
      }`}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => {
          setIsFocused(true);
          // Restore suggestions when focusing back
          if (value.length > 0) {
            const matches = BIP39_WORDLIST.filter(word => word.startsWith(value));
            setSuggestions(matches.slice(0, 5));
            setSelectedSuggestion(0);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          setSuggestions([]); // Clear suggestions when losing focus
        }}
        data-index={index}
        autoFocus={autoFocus}
        className={`w-full pl-10 pr-3 py-3 bg-black/30 backdrop-blur-sm border-2 rounded-xl text-sm font-mono text-white transition-all duration-300 ${
          isFocused
            ? 'border-accent bg-accent/5 shadow-lg shadow-accent/20 scale-[1.02]'
            : value.length > 0
              ? isValid
                ? 'border-success/50 bg-success/5 hover:border-success'
                : 'border-danger/50 bg-danger/5 hover:border-danger'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        } focus:outline-none placeholder:text-white/30`}
        placeholder="enter word"
      />
      
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border-2 border-accent/30 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {suggestions.map((word, i) => (
            <button
              key={word}
              onClick={() => {
                onChange(index, word);
                setSuggestions([]);
              }}
              className={`relative w-full px-4 py-2.5 text-left text-sm font-mono transition-all duration-150 cursor-pointer ${
                i === selectedSuggestion
                  ? 'bg-accent/20 text-white pl-6'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {i === selectedSuggestion && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
              )}
              <span className="font-bold text-accent">{value}</span>
              <span className="text-white/60">{word.substring(value.length)}</span>
              {i === selectedSuggestion && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">↵</span>
              )}
            </button>
          ))}
          <div className="px-3 py-1.5 bg-white/5 border-t border-white/10 text-xs text-white/40">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑↓</kbd> navigate
              <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Enter</kbd> select
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PassphraseModal: React.FC<PassphraseModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [method, setMethod] = useState<'grid' | 'manual'>('grid');
  const [wordCount, setWordCount] = useState<ValidMnemonicLength>(12);
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [manualInput, setManualInput] = useState('');
  const [validWords, setValidWords] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isUpdatingFromManual, setIsUpdatingFromManual] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setWords(Array(wordCount).fill(''));
      setValidWords(new Set());
      setError('');
      setShowVerification(false);
    }
  }, [isOpen, wordCount]);

  // Validate words
  useEffect(() => {
    const newValidWords = new Set<number>();
    words.forEach((word, index) => {
      if (word && BIP39_WORD_SET.has(word)) {
        newValidWords.add(index);
      }
    });
    setValidWords(newValidWords);
  }, [words]);

  // Sync manual input when words change (but not when updating from manual)
  useEffect(() => {
    if (!isUpdatingFromManual) {
      const validWordsText = words
        .filter(w => w.length > 0)
        .join(' ');
      setManualInput(validWordsText);
    }
  }, [words, isUpdatingFromManual]);

  const handleWordChange = useCallback((index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
    setError('');
  }, [words]);

  const handlePaste = useCallback((startIndex: number, pastedWords: string[]) => {
    // Determine appropriate word count
    const totalNeeded = startIndex + pastedWords.length;
    let newWordCount = wordCount;
    
    for (const count of VALID_MNEMONIC_LENGTHS) {
      if (totalNeeded <= count) {
        newWordCount = count;
        break;
      }
    }
    
    if (newWordCount !== wordCount && newWordCount <= 24) {
      setWordCount(newWordCount);
      const newWords = Array(newWordCount).fill('');
      words.forEach((word, i) => newWords[i] = word || '');
      pastedWords.forEach((word, i) => {
        if (startIndex + i < newWordCount) {
          newWords[startIndex + i] = word;
        }
      });
      setWords(newWords);
    } else {
      const newWords = [...words];
      pastedWords.forEach((word, i) => {
        if (startIndex + i < words.length) {
          newWords[startIndex + i] = word;
        }
      });
      setWords(newWords);
    }
    
    setError('');
  }, [words, wordCount]);

  const handleManualPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setManualInput(text);
      processManualInput(text);
    } catch (err) {
      setError('Unable to access clipboard. Please paste manually.');
    }
  };

  const processManualInput = (text: string) => {
    setIsUpdatingFromManual(true);
    
    const extractedWords = text
      .toLowerCase()
      .split(/[\s,]+/)
      .map(w => w.replace(/[^a-z]/g, ''))
      .filter(w => w.length > 0);
    
    // Keep ALL words (including invalid ones) to preserve user input during editing
    // We'll validate them but still keep partial words
    
    // Determine the appropriate word count based on total words
    let targetCount = wordCount;
    if (extractedWords.length > 0) {
      for (const count of VALID_MNEMONIC_LENGTHS) {
        if (extractedWords.length <= count) {
          targetCount = count;
          break;
        }
      }
      
      // If we have more than 24 words, cap at 24
      if (extractedWords.length > 24) {
        targetCount = 24;
      }
      
      setWordCount(targetCount);
      const newWords = Array(targetCount).fill('');
      
      // Fill with all words, not just valid ones
      extractedWords.forEach((word, i) => {
        if (i < targetCount) newWords[i] = word;
      });
      
      setWords(newWords);
    } else {
      // If no words, keep current word count but clear array
      setWords(Array(wordCount).fill(''));
    }
    
    // Reset the flag after a short delay to allow the effect to run
    setTimeout(() => setIsUpdatingFromManual(false), 100);
  };

  const verifyAndImport = async () => {
    setIsVerifying(true);
    setError('');
    
    const validPhrase = words.filter(w => w.length > 0);
    
    // Check all words are valid
    const invalidWords = validPhrase.filter(w => !BIP39_WORD_SET.has(w));
    if (invalidWords.length > 0) {
      setError(`Invalid word(s): ${invalidWords.join(', ')}`);
      setIsVerifying(false);
      return;
    }
    
    // Check valid length
    if (!VALID_MNEMONIC_LENGTHS.includes(validPhrase.length as ValidMnemonicLength)) {
      setError('Phrase must be 12, 15, 18, 21, or 24 words');
      setIsVerifying(false);
      return;
    }
    
    // Verify checksum
    const result = await verifyBip39Checksum(validPhrase);
    if (!result.ok) {
      if (result.reason === 'webcrypto_unavailable') {
        setError('Cannot verify checksum (Web Crypto unavailable)');
      } else {
        setError('Invalid checksum. Please check your phrase.');
      }
      setIsVerifying(false);
      return;
    }
    
    setIsVerifying(false);
    setShowVerification(true);
  };

  const confirmImport = () => {
    const passphrase = words.filter(w => w.length > 0).join(' ');
    onImport(passphrase);
    onClose();
  };

  const progress = useMemo(() => {
    if (method === 'manual') {
      const extractedWords = manualInput
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(w => w.length > 0 && BIP39_WORD_SET.has(w));
      return (extractedWords.length / wordCount) * 100;
    }
    return (validWords.size / wordCount) * 100;
  }, [validWords, wordCount, method, manualInput]);

  const canVerify = validWords.size === wordCount && wordCount > 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl bg-gradient-to-br from-primary-bg-800/95 via-primary-bg-800/98 to-primary-bg-900/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-2 ring-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          {!showVerification ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="relative p-3 bg-gradient-to-br from-accent/30 to-secondary-500/30 rounded-xl shadow-lg shadow-accent/20">
                    <Key className="w-5 h-5 text-white relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary-500 rounded-xl opacity-20 blur-xl" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Import Recovery Phrase
                    </DialogTitle>
                    <p className="text-sm text-white/60 mt-0.5">
                      Enter your {wordCount}-word BIP39 mnemonic phrase
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer group"
                >
                  <X className="w-5 h-5 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="relative h-3 bg-black/30 rounded-full overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 animate-pulse" />
                  <div
                    className="relative h-full bg-gradient-to-r from-accent via-secondary-500 to-accent bg-[length:200%_100%] animate-gradient rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ 
                      width: `${progress}%`,
                      boxShadow: progress > 0 ? '0 0 20px rgba(34, 211, 238, 0.5)' : 'none'
                    }}
                  >
                    {progress > 0 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/40">{validWords.size} of {wordCount} words</span>
                  <span className="text-xs text-white/40">{Math.round(progress)}% complete</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Method Selector */}
                <div className="flex gap-2 mb-6 p-1 bg-black/30 rounded-xl">
                  <button
                    onClick={() => setMethod('grid')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                      method === 'grid'
                        ? 'bg-gradient-to-r from-accent to-secondary-500 text-white shadow-lg shadow-accent/30 scale-[1.02]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {method === 'grid' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                    )}
                    <span className="relative">Word by Word</span>
                  </button>
                  <button
                    onClick={() => setMethod('manual')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                      method === 'manual'
                        ? 'bg-gradient-to-r from-accent to-secondary-500 text-white shadow-lg shadow-accent/30 scale-[1.02]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {method === 'manual' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                    )}
                    <span className="relative">Paste Full Phrase</span>
                  </button>
                  <button
                    onClick={handleManualPaste}
                    className="px-4 py-2.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer group"
                  >
                    <ClipboardPaste className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Paste</span>
                  </button>
                </div>

                {/* Word Count Selector */}
                {method === 'grid' && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {VALID_MNEMONIC_LENGTHS.map(count => (
                      <button
                        key={count}
                        onClick={() => {
                          setWordCount(count);
                          const newWords = Array(count).fill('');
                          words.forEach((word, i) => {
                            if (i < count) newWords[i] = word;
                          });
                          setWords(newWords);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                          wordCount === count
                            ? 'bg-gradient-to-r from-accent/30 to-secondary-500/30 text-white border-2 border-accent shadow-lg shadow-accent/20 scale-105'
                            : 'bg-black/30 text-white/60 hover:bg-white/10 hover:text-white border-2 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {count}
                        <span className="ml-1 text-xs opacity-70">words</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-danger/10 border-2 border-danger/50 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-danger/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-danger animate-pulse" />
                    </div>
                    <p className="text-sm text-white font-medium">{error}</p>
                  </div>
                )}

                {/* Input Methods */}
                {method === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-visible p-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {words.map((word, index) => (
                      <WordInput
                        key={index}
                        index={index}
                        value={word}
                        onChange={handleWordChange}
                        onPaste={handlePaste}
                        isValid={validWords.has(index)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="relative">
                      <textarea
                        value={manualInput}
                        onChange={(e) => {
                          setManualInput(e.target.value);
                          processManualInput(e.target.value);
                        }}
                        className="w-full h-40 p-5 bg-black/30 backdrop-blur-sm border-2 border-white/10 hover:border-white/20 focus:border-accent rounded-xl text-sm font-mono text-white resize-none focus:outline-none transition-all duration-300 placeholder:text-white/30"
                        placeholder="Paste or type your recovery phrase here..."
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className="text-xs text-white/40">
                          {manualInput.split(/\s+/).filter(w => w.length > 0 && BIP39_WORD_SET.has(w.toLowerCase())).length} valid words detected
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-white/50 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-accent/50 rounded-full animate-pulse" />
                      Words will be automatically extracted and validated
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
                <button
                  onClick={() => {
                    setWords(Array(wordCount).fill(''));
                    setManualInput('');
                    setError('');
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl font-semibold transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/20"
                >
                  Clear All
                </button>
                <button
                  onClick={verifyAndImport}
                  disabled={!canVerify || isVerifying}
                  className={`flex-1 relative px-6 py-3 rounded-xl font-bold transition-all duration-300 overflow-hidden group ${
                    canVerify && !isVerifying
                      ? 'bg-gradient-to-r from-accent to-secondary-500 text-white hover:shadow-2xl hover:shadow-accent/30 hover:scale-[1.02] cursor-pointer'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {canVerify && !isVerifying && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Import'
                    )}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verification Success */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-transparent via-success/10 to-transparent animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-4">
                  <div className="relative p-3 bg-success/20 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-success animate-in zoom-in spin-in-180 duration-500" />
                    <div className="absolute inset-0 bg-success rounded-xl opacity-20 blur-xl animate-pulse" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Verification Successful
                    </DialogTitle>
                    <p className="text-sm text-white/60 mt-0.5">
                      Your recovery phrase is valid. Please confirm to import.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border-2 border-white/10">
                  <p className="text-xs text-white/50 mb-4 font-semibold uppercase tracking-wider">Your recovery phrase:</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {words.filter(w => w.length > 0).map((word, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in fade-in zoom-in-95 duration-500"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <span className="text-[10px] text-accent/70 block font-bold">#{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-sm font-mono text-white font-semibold">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
                <button
                  onClick={() => setShowVerification(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl font-semibold transition-all duration-300 cursor-pointer border-2 border-white/10 hover:border-white/20"
                >
                  Back to Edit
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-1 relative px-6 py-3 bg-gradient-to-r from-success to-secondary-500 text-white hover:shadow-2xl hover:shadow-success/30 hover:scale-[1.02] rounded-xl font-bold transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Complete Import</span>
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};