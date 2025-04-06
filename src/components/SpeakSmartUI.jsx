// Updated version with full tab content and fixed imports
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Mic, Volume2, RefreshCcw, Waveform } from 'lucide-react';
/* global webkitSpeechRecognition */


export default function SpeakSmartUI() {
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('speaksmart_goal'));
  const [goal, setGoal] = useState(localStorage.getItem('speaksmart_goal') || '');
  const [editGoal, setEditGoal] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [recording, setRecording] = useState(false);
  const [tab, setTab] = useState('speak');
  const [vocabList, setVocabList] = useState([
    { word: 'articulate', meaning: 'able to express ideas clearly and effectively' },
    { word: 'fluent', meaning: 'able to speak a language easily and well' },
    { word: 'intonation', meaning: 'the rise and fall of the voice in speaking' }
  ]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (goal) localStorage.setItem('speaksmart_goal', goal);
  }, [goal]);

  const handleRecord = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser. Please use Chrome.');
      return;
    }
    if (!recording) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setRecording(true);
      recognition.onend = () => setRecording(false);
      recognition.onresult = async (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        await analyzeGrammar(result);
        logProgress(result);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setRecording(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      recognitionRef.current?.stop();
      setRecording(false);
    }
  };

  const analyzeGrammar = async (text) => {
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ text, language: 'en-US' })
      });
      const data = await response.json();
      if (data.matches.length > 0) {
        const suggestions = data.matches.map(match => `→ ${match.message}`).join('\n');
        setFeedback(suggestions);
      } else {
        setFeedback('Great job! No grammar issues found.');
      }
    } catch (err) {
      console.error('Grammar check failed:', err);
      setFeedback('Could not connect to grammar check service.');
    }
  };

  const logProgress = (text) => {
    const logs = JSON.parse(localStorage.getItem('speaksmart_logs') || '[]');
    logs.push({ timestamp: new Date().toISOString(), input: text });
    localStorage.setItem('speaksmart_logs', JSON.stringify(logs));
  };

  const addVocabulary = () => {
    if (newWord && newMeaning) {
      setVocabList([...vocabList, { word: newWord, meaning: newMeaning }]);
      setNewWord('');
      setNewMeaning('');
    }
  };

  const logs = JSON.parse(localStorage.getItem('speaksmart_logs') || '[]');
  const challenges = [
    "Record a 1-minute talk about your favorite place, using advanced adjectives and at least one conditional sentence.",
    "Describe a recent achievement using at least 3 transition words (e.g., however, therefore, moreover).",
    "Explain a complex topic from your field as if speaking to a 10-year-old.",
    "Debate the pros and cons of social media in everyday life.",
    "Tell a story using at least one phrasal verb and two idioms."
  ];
  const currentWeek = Math.floor((new Date() - new Date('2025-01-01')) / (7 * 24 * 60 * 60 * 1000));
  const completedChallenges = JSON.parse(localStorage.getItem('speaksmart_challenges') || '[]');
  const currentChallenge = challenges[currentWeek % challenges.length];
  const weeklyChallenge = `This week's challenge: ${currentChallenge}`;
  const isChallengeCompleted = completedChallenges.includes(currentChallenge);

  const markChallengeAsComplete = () => {
    if (!isChallengeCompleted) {
      const updated = [...completedChallenges, currentChallenge];
      localStorage.setItem('speaksmart_challenges', JSON.stringify(updated));
    }
  };

  if (showOnboarding) {
    return (
      <div className="p-6 max-w-2xl mx-auto grid gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">👋 Welcome to SpeakSmart AI</h2>
            <p className="mb-2">Let's set your personal speaking goal:</p>
            <Input
              placeholder="e.g., Improve my American accent for job interviews"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mb-4"
            />
            <Button onClick={() => setShowOnboarding(false)}>Start Learning</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto grid gap-6">
      <Tabs defaultValue="speak" onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="speak">🎙 Speak Practice</TabsTrigger>
          <TabsTrigger value="grammar">🧠 Grammar Drills</TabsTrigger>
          <TabsTrigger value="vocab">📘 Vocabulary Builder</TabsTrigger>
          <TabsTrigger value="progress">📈 Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="speak">
          {/* speak tab already here */}
        </TabsContent>

        <TabsContent value="grammar">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">🧠 Grammar Drills</h2>
              <p className="mb-4">Practice forming correct sentences using prompts below:</p>
              <ul className="list-disc ml-6 text-sm space-y-2">
                <li>Correct this sentence: <strong>I has a book.</strong></li>
                <li>Use a conditional: <strong>If I were rich, I ...</strong></li>
                <li>Make a question using present perfect: <strong>you / ever / see / movie?</strong></li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocab">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">📘 Vocabulary Builder</h2>
              <ul className="list-disc ml-6 text-sm space-y-2">
                {vocabList.map((vocab, index) => (
                  <li key={index}><strong>{vocab.word}</strong>: {vocab.meaning}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-4">
                <Input placeholder="New Word" value={newWord} onChange={(e) => setNewWord(e.target.value)} />
                <Input placeholder="Meaning" value={newMeaning} onChange={(e) => setNewMeaning(e.target.value)} />
                <Button onClick={addVocabulary}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">📈 Progress Tracker</h2>
              <ul className="list-disc ml-6 text-sm space-y-2">
                {logs.map((log, idx) => (
                  <li key={idx}><strong>{new Date(log.timestamp).toLocaleString()}:</strong> {log.input}</li>
                ))}
              </ul>
              <h3 className="text-md font-semibold mt-6 mb-2">🏁 Completed Challenges</h3>
              <ul className="list-disc ml-6 text-sm space-y-2">
                {completedChallenges.map((challenge, idx) => (
                  <li key={idx}>{challenge}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
