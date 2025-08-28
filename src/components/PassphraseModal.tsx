import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Field,
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
  const ENT = (MS * 32) / 33;
  const CS = ENT / 32;
  
  // Verify ENT is a valid value (must be divisible by 32 and result in whole bits)
  if (ENT % 32 !== 0 || !Number.isInteger(ENT) || !Number.isInteger(CS)) {
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
    const hashBuf = await crypto.subtle.digest('SHA-256', entropy);
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
    onChange(index, newValue);
    
    if (newValue.length > 0) {
      const matches = BIP39_WORDLIST.filter(word => word.startsWith(newValue));
      setSuggestions(matches.slice(0, 5));
      setSelectedSuggestion(0);
      
      // Auto-complete if only one match
      if (matches.length === 1 && newValue !== matches[0]) {
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
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-semibold">
        {index + 1}
      </span>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-index={index}
        autoFocus={autoFocus}
        className={`w-full pl-8 pr-3 py-2 bg-primary-bg-900/50 border rounded-lg text-sm font-mono text-white transition-all duration-200 ${
          value.length > 0
            ? isValid
              ? 'border-success bg-success/10'
              : 'border-danger bg-danger/10'
            : 'border-border-primary'
        } focus:outline-none focus:ring-2 focus:ring-accent/50`}
        placeholder={`Word ${index + 1}`}
      />
      
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-primary-bg-800 border border-accent rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((word, i) => (
            <button
              key={word}
              onClick={() => {
                onChange(index, word);
                setSuggestions([]);
              }}
              className={`w-full px-3 py-2 text-left text-sm font-mono transition-colors ${
                i === selectedSuggestion
                  ? 'bg-accent/20 text-white'
                  : 'text-white hover:bg-primary-bg-700'
              }`}
            >
              <span className="text-accent font-semibold">{value}</span>
              {word.substring(value.length)}
            </button>
          ))}
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
    const extractedWords = text
      .toLowerCase()
      .split(/[\s,]+/)
      .map(w => w.replace(/[^a-z]/g, ''))
      .filter(w => w.length > 0 && BIP39_WORD_SET.has(w));
    
    if (VALID_MNEMONIC_LENGTHS.includes(extractedWords.length as ValidMnemonicLength)) {
      setWordCount(extractedWords.length as ValidMnemonicLength);
      const newWords = Array(extractedWords.length).fill('');
      extractedWords.forEach((word, i) => newWords[i] = word);
      setWords(newWords);
      setMethod('grid');
    }
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
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl bg-primary-bg-800 rounded-2xl shadow-2xl ring-1 ring-accent/20 overflow-hidden">
          {!showVerification ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-primary">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Key className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-text-primary">
                      Import Recovery Phrase
                    </DialogTitle>
                    <p className="text-sm text-text-muted">
                      Enter your {wordCount}-word BIP39 recovery phrase
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-primary-bg-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="h-2 bg-primary-bg-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-secondary-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Method Selector */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setMethod('grid')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      method === 'grid'
                        ? 'bg-gradient-to-r from-accent to-secondary-500 text-white'
                        : 'bg-primary-bg-700 text-text-secondary hover:bg-primary-bg-600'
                    }`}
                  >
                    Word by Word
                  </button>
                  <button
                    onClick={() => setMethod('manual')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      method === 'manual'
                        ? 'bg-gradient-to-r from-accent to-secondary-500 text-white'
                        : 'bg-primary-bg-700 text-text-secondary hover:bg-primary-bg-600'
                    }`}
                  >
                    Paste Full Phrase
                  </button>
                  <button
                    onClick={handleManualPaste}
                    className="px-4 py-2 bg-primary-bg-700 text-text-secondary hover:bg-primary-bg-600 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    Paste
                  </button>
                </div>

                {/* Word Count Selector */}
                {method === 'grid' && (
                  <div className="flex gap-2 mb-6">
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          wordCount === count
                            ? 'bg-accent/20 text-accent border border-accent'
                            : 'bg-primary-bg-700 text-text-secondary hover:bg-primary-bg-600 border border-transparent'
                        }`}
                      >
                        {count} words
                      </button>
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                {/* Input Methods */}
                {method === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
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
                  <div>
                    <textarea
                      value={manualInput}
                      onChange={(e) => {
                        setManualInput(e.target.value);
                        processManualInput(e.target.value);
                      }}
                      className="w-full h-32 p-4 bg-primary-bg-900/50 border border-border-primary rounded-lg text-sm font-mono text-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="Paste or type your recovery phrase here..."
                    />
                    <p className="mt-2 text-xs text-text-muted">
                      Words will be automatically extracted and validated
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 border-t border-border-primary">
                <button
                  onClick={() => {
                    setWords(Array(wordCount).fill(''));
                    setManualInput('');
                    setError('');
                  }}
                  className="px-6 py-2.5 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={verifyAndImport}
                  disabled={!canVerify || isVerifying}
                  className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    canVerify && !isVerifying
                      ? 'bg-gradient-to-r from-accent to-secondary-500 text-white hover:shadow-lg cursor-pointer'
                      : 'bg-primary-bg-700/50 text-text-muted cursor-not-allowed'
                  }`}
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Import'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verification Success */}
              <div className="p-6 border-b border-border-primary">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <div>
                    <DialogTitle className="text-lg font-semibold text-text-primary">
                      Verification Successful
                    </DialogTitle>
                    <p className="text-sm text-text-muted">
                      Your recovery phrase is valid. Please confirm to import.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-primary-bg-900/50 rounded-lg p-4">
                  <p className="text-xs text-text-muted mb-3">Your recovery phrase:</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {words.filter(w => w.length > 0).map((word, index) => (
                      <div
                        key={index}
                        className="bg-primary-bg-800 border border-border-primary rounded-lg px-3 py-2 text-center"
                      >
                        <span className="text-xs text-text-muted block">#{index + 1}</span>
                        <span className="text-sm font-mono text-white">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-border-primary">
                <button
                  onClick={() => setShowVerification(false)}
                  className="px-6 py-2.5 bg-primary-bg-700 text-text-primary hover:bg-primary-bg-600 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  Back to Edit
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-accent to-secondary-500 text-white hover:shadow-lg rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  Complete Import
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};