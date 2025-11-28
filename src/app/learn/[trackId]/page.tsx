'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  SparklesIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';

export default function LearningTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [language, setLanguage] = useState<'sw' | 'en'>('en');
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; message: string }>>([]);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Track modules data
  const trackModules: Record<string, any> = {
    'financial-basics': {
      title: { en: 'Financial Basics', sw: 'Misingi ya Fedha' },
      description: { 
        en: 'Master the fundamentals of personal finance',
        sw: 'Jifunze misingi ya fedha za kibinafsi'
      },
      modules: [
        {
          id: 1,
          title: { en: 'Understanding Money & Value', sw: 'Kuelewa Pesa & Thamani' },
          duration: '30 min',
          type: 'video',
          completed: false,
        },
        {
          id: 2,
          title: { en: 'Setting Financial Goals', sw: 'Kuweka Malengo ya Kifedha' },
          duration: '25 min',
          type: 'interactive',
          completed: false,
        },
        {
          id: 3,
          title: { en: 'The Power of Saving', sw: 'Nguvu ya Kuweka Akiba' },
          duration: '35 min',
          type: 'video',
          completed: false,
        },
        {
          id: 4,
          title: { en: 'Creating a Budget', sw: 'Kutengeneza Bajeti' },
          duration: '40 min',
          type: 'practice',
          completed: false,
        },
        {
          id: 5,
          title: { en: 'Managing Debt Wisely', sw: 'Kusimamia Deni kwa Busara' },
          duration: '30 min',
          type: 'video',
          completed: false,
        },
        {
          id: 6,
          title: { en: 'Emergency Funds', sw: 'Akiba ya Dharura' },
          duration: '20 min',
          type: 'interactive',
          completed: false,
        },
        {
          id: 7,
          title: { en: 'Interest Rates Explained', sw: 'Maelezo ya Riba' },
          duration: '35 min',
          type: 'video',
          completed: false,
        },
        {
          id: 8,
          title: { en: 'Final Assessment & Certificate', sw: 'Tathmini ya Mwisho & Cheti' },
          duration: '45 min',
          type: 'assessment',
          locked: true,
        },
      ],
    },
    'mobile-money': {
      title: { en: 'Mobile Money Mastery', sw: 'Ufundi wa Pesa za Simu' },
      description: {
        en: 'Master M-Pesa, Tigo Pesa, and digital payments',
        sw: 'Jifunze M-Pesa, Tigo Pesa, na malipo ya kidijitali'
      },
      modules: [
        {
          id: 1,
          title: { en: 'Introduction to Mobile Money', sw: 'Utangulizi wa Pesa za Simu' },
          duration: '25 min',
          type: 'video',
          completed: false,
        },
        {
          id: 2,
          title: { en: 'M-Pesa Complete Guide', sw: 'Mwongozo Kamili wa M-Pesa' },
          duration: '40 min',
          type: 'interactive',
          completed: false,
        },
        {
          id: 3,
          title: { en: 'Tigo Pesa & Airtel Money', sw: 'Tigo Pesa & Airtel Money' },
          duration: '35 min',
          type: 'video',
          completed: false,
        },
        {
          id: 4,
          title: { en: 'Fees & Cost Management', sw: 'Usimamizi wa Ada & Gharama' },
          duration: '30 min',
          type: 'practice',
          completed: false,
        },
        {
          id: 5,
          title: { en: 'Mobile Money Security', sw: 'Usalama wa Pesa za Simu' },
          duration: '25 min',
          type: 'video',
          completed: false,
        },
        {
          id: 6,
          title: { en: 'Final Assessment', sw: 'Tathmini ya Mwisho' },
          duration: '30 min',
          type: 'assessment',
          locked: true,
        },
      ],
    },
  };

  const currentTrack = trackModules[resolvedParams.trackId] || trackModules['financial-basics'];

  const handleAIChat = async () => {
    if (!aiMessage.trim()) return;

    // Add user message to chat
    setChatHistory([...chatHistory, { role: 'user', message: aiMessage }]);

    // Simulate AI response (in production, this would call your AI API)
    const aiResponse = language === 'en'
      ? `I understand you're asking about "${aiMessage}". Let me help you with that based on Tanzanian context...`
      : `Ninaelewa unauliza kuhusu "${aiMessage}". Hebu nikusaidie kwa muktadha wa Tanzania...`;

    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'ai', message: aiResponse }]);
    }, 1000);

    setAiMessage('');
  };

  const startModule = (moduleId: number) => {
    setSelectedModule(moduleId);
    // In production, this would navigate to the actual module content
    setToast({
      message: language === 'en' 
        ? `Starting module ${moduleId}...`
        : `Kuanza moduli ${moduleId}...`,
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/learn')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {language === 'en' ? 'Back to Learning' : 'Rudi kwenye Kujifunza'}
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {language === 'en' ? 'Swahili' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Track Header */}
        <div className="bg-white border-2 border-orange-200 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{currentTrack.title[language]}</h1>
          <p className="text-gray-600 text-lg mb-4">{currentTrack.description[language]}</p>
          <div className="flex items-center space-x-6 text-gray-700">
            <span className="flex items-center">
              <PlayCircleIcon className="h-5 w-5 mr-2 text-orange-600" />
              {currentTrack.modules.length} {language === 'en' ? 'Modules' : 'Moduli'}
            </span>
            <span className="flex items-center">
              <span className="text-gray-600 mr-2">{language === 'en' ? 'Progress:' : 'Maendeleo:'}</span>
              <span className="font-semibold text-orange-600">0%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Course Modules' : 'Moduli za Kozi'}
            </h2>
            <div className="space-y-4">
              {currentTrack.modules.map((module: any, index: number) => (
                <div
                  key={module.id}
                  className={`bg-white rounded-lg p-6 border-2 transition-all ${
                    module.locked
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-200 hover:border-orange-400 cursor-pointer hover:shadow-sm'
                  }`}
                  onClick={() => !module.locked && startModule(module.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        module.completed
                          ? 'bg-green-50 border-2 border-green-200'
                          : module.locked
                          ? 'bg-gray-50 border-2 border-gray-200'
                          : 'bg-orange-50 border-2 border-orange-200'
                      }`}>
                        {module.completed ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : module.locked ? (
                          <LockClosedIcon className="h-6 w-6 text-gray-400" />
                        ) : (
                          <span className="text-orange-600 font-bold text-lg">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {module.title[language]}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="text-gray-500 mr-1">⏱</span> {module.duration}
                          </span>
                          <span className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {module.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!module.locked && !module.completed && (
                      <button className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                        {language === 'en' ? 'Start' : 'Anza'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'en' ? 'AI Learning Assistant' : 'Msaidizi wa AI'}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {language === 'en'
                  ? 'Ask questions about your learning journey or share your financial situation for personalized guidance.'
                  : 'Uliza maswali kuhusu safari yako ya kujifunza au shiriki hali yako ya kifedha kupata mwongozo binafsi.'
                }
              </p>

              {/* Chat History */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto border border-gray-200">
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    {language === 'en'
                      ? 'Start a conversation with your AI assistant...'
                      : 'Anza mazungumzo na msaidizi wako wa AI...'
                    }
                  </p>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((chat, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          chat.role === 'user'
                            ? 'bg-orange-50 border border-orange-200 ml-4'
                            : 'bg-white border border-gray-200 mr-4'
                        }`}
                      >
                        <p className="text-sm text-gray-900">{chat.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="space-y-3">
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Type your question or describe your situation...'
                      : 'Andika swali lako au eleza hali yako...'
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 placeholder-gray-500"
                  rows={3}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAIChat}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    {language === 'en' ? 'Send' : 'Tuma'}
                  </button>
                  <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <MicrophoneIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <SpeakerWaveIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-sm transition-colors text-gray-900">
                    {language === 'en' ? '💡 Get a personalized tip' : '💡 Pata ushauri binafsi'}
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-sm transition-colors text-gray-900">
                    {language === 'en' ? '📊 Analyze my progress' : '📊 Changanua maendeleo yangu'}
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-sm transition-colors text-gray-900">
                    {language === 'en' ? '🎯 Set a learning goal' : '🎯 Weka lengo la kujifunza'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
