import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_GPT_API_KEY,
  dangerouslyAllowBrowser: true
});

const MEME_STYLES = [
  {
    name: '悲伤',
    icon: '😢',
    color: '#3498db',
    templates: []
  },
  {
    name: '开心',
    icon: '😊',
    color: '#2ecc71',
    templates: []
  },
  {
    name: '恐惧',
    icon: '😱',
    color: '#e74c3c',
    templates: []
  },
  {
    name: '期待',
    icon: '🤩',
    color: '#f39c12',
    templates: []
  }
];

const generatePrompt = (emotionType) => {
  const templates = [
    '[角色] with [夸张表情] expression, [情境], minimalist background, high contrast, dramatic lighting, 4k, cartoon style',
    'split screen, left: [场景1] with [表情1], right: [场景2] with [表情2], simple background, vibrant colors, meme style, 4k',
    '[角色], [动作] reacting to [事件], [表情描述], clean background, expressive face, meme style, high quality',
    'extreme close-up of [人物特征] with [情绪] expression, [节描述], solid color background, high detail face, caricature style',
    'group of [人群类型] reacting to [事件], multiple [情绪] expressions, simple setting, cartoon style, clear composition, 4k'
  ];

  const emotions = {
    '悲伤': {
      角色: ['young student', 'office worker', 'tired person', 'heartbroken lover'],
      夸张表情: ['crying', 'devastated', 'heartbroken', 'weeping uncontrollably'],
      情境: ['after failing exam', 'missing deadline', 'in empty room', 'at funeral'],
      场景1: ['empty office', 'rainy day', 'abandoned park', 'quiet hospital'],
      表情1: ['tears flowing', 'sobbing', 'quivering mouth', 'drooping shoulders'],
      场景2: ['dark bedroom', 'lon ely cafe', 'empty train station', 'gloomy weather'],
      表情2: ['head down', 'wiping tears', 'shoulders shaking', 'avoiding eye contact'],
      动作: ['crying', 'slouching', 'hugging self', 'pacing slowly'],
      事件: ['bad news', 'rejection letter', 'lost opportunity', 'missed chance'],
      表情描述: ['tears streaming down face', 'quivering lip', 'red puffy eyes', 'trembling chin'],
      人物特征: ['teary eyes', 'sad face', 'slumped posture', 'disheveled appearance'],
      情绪: ['devastated', 'heartbroken', 'melancholic', 'depressed'],
      细节描述: ['tears rolling down cheeks', 'red puffy eyes', 'trembling hands', 'crumpled tissues'],
      人群类型: ['disappointed students', 'rejected applicants', 'grieving families', 'broken-hearted lovers']
    },
    '开心': {
      角色: ['successful graduate', 'winning athlete', 'proud parent', 'lucky winner'],
      夸张表情: ['beaming smile', 'radiant grin', 'joyful laughter', 'sparkling eyes'],
      情境: ['graduation ceremony', 'winning moment', 'birthday party', 'wedding day'],
      场景1: ['sunny park', 'festive venue', 'beach sunset', 'cozy home'],
      表情1: ['bright smile', 'laughing eyes', 'rosy cheeks', 'dimples showing'],
      场景2: ['garden party', 'victory parade', 'family gathering', 'romantic date'],
      表情2: ['happy tears', 'wide smile', 'jubilant expression', 'excited gestures'],
      动作: ['jumping for joy', 'dancing around', 'hugging others', 'clapping hands'],
      事件: ['achievement unlocked', 'dream come true', 'perfect score', 'surprise gift'],
      表情描述: ['eyes crinkled with joy', 'face lit up', 'genuine smile', 'happy glow'],
      人物特征: ['bright eyes', 'upright posture', 'energetic movement', 'confident stride'],
      情绪: ['elated', 'overjoyed', 'ecstatic', 'blissful'],
      细节描述: ['bounce in step', 'light movements', 'graceful gestures', 'vibrant energy'],
      人群类型: ['celebrating graduates', 'winning teams', 'happy families', 'successful professionals']
    },
    '恐惧': {
      角色: ['scared child', 'nervous presenter', 'anxious passenger', 'frightened victim'],
      夸张表情: ['wide terrified eyes', 'pale face', 'trembling mouth', 'frozen expression'],
      情境: ['dark alley', 'horror movie', 'thunderstorm', 'before surgery'],
      场景1: ['spooky house', 'dark forest', 'empty street', 'stormy night'],
      表情1: ['trembling lips', 'widened eyes', 'pale complexion', 'sweating forehead'],
      场景2: ['during nightmare', 'power outage', 'strange noise', 'unknown threat'],
      表情2: ['frozen stance', 'shaking hands', 'nervous glances', 'rigid posture'],
      动作: ['shivering', 'backing away', 'hiding face', 'covering ears'],
      事件: ['sudden noise', 'unexpected threat', 'scary news', 'dangerous moment'],
      表情描述: ['face frozen in fear', 'terror in eyes', 'trembling features', 'shocked expression'],
      人物特征: ['shaking body', 'tense muscles', 'defensive stance', 'alert posture'],
      情绪: ['terrified', 'panicked', 'horrified', 'scared'],
      细节描述: ['goosebumps visible', 'white knuckles', 'racing heart visible', 'shallow breathing'],
      人群类型: ['scared audiences', 'nervous students', 'worried patients', 'frightened victims']
    },
    '期待': {
      角色: ['eager student', 'excited traveler', 'hopeful candidate', 'anticipating fan'],
      夸张表情: ['bright eyes', 'eager smile', 'animated expression', 'attentive gaze'],
      情境: ['before vacation', 'waiting for results', 'concert queue', 'Christmas Eve'],
      场景1: ['airport terminal', 'ticket booth', 'starting line', 'waiting room'],
      表情1: ['expectant smile', 'bright eyes', 'alert posture', 'eager expression'],
      场景2: ['before show', 'preparation time', 'countdown moment', 'gathering crowd'],
      表情2: ['checking time', 'scanning crowd', 'bouncing slightly', 'leaning forward'],
      动作: ['pacing excitedly', 'checking watch', 'bouncing lightly', 'looking around'],
      事件: ['upcoming trip', 'special date', 'important announcement', 'big reveal'],
      表情描述: ['eyes shining with hope', 'excited smile', 'alert expression', 'eager anticipation'],
      人物特征: ['alert stance', 'focused attention', 'eager energy', 'ready posture'],
      情绪: ['excited', 'hopeful', 'eager', 'anticipating'],
      细节描述: ['tapping feet', 'checking phone', 'adjusting clothes', 'ready stance'],
      人群类型: ['waiting fans', 'eager tourists', 'excited students', 'hopeful candidates']
    }
  };

  const emotion = emotions[emotionType];
  if (!emotion) return null;

  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template.replace(/\[(.*?)\]/g, (match, key) => {
    const options = emotion[key];
    if (!options) return match;
    return options[Math.floor(Math.random() * options.length)];
  });
};

const checkServerHealth = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (!response.ok) {
      throw new Error('Server health check failed');
    }
    return true;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

const generateImage = async (prompt) => {
  const isServerHealthy = await checkServerHealth();
  if (!isServerHealthy) {
    throw new Error('服务器未启动或无法访问，请确保后端服务正在运行');
  }

  try {
    console.log('使用提示词生成图片:', prompt);
    const submitResponse = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt + ' memetic, viral potential, highly shareable, clean edges, easy to edit, clear focal point, no text'
        }
      })
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      throw new Error(errorData.error || `HTTP error! status: ${submitResponse.status}`);
    }

    const submitJson = await submitResponse.json();
    console.log('收到服务器响应:', submitJson);

    if (!submitJson.output?.task_id) {
      throw new Error('API返回格式错误，请检查服务器日志');
    }

    const taskId = submitJson.output.task_id;

    // 等待图片生成完成
    let retries = 0;
    const maxRetries = 5; // 最多等待5次
    
    while (retries < maxRetries) {
      const statusResponse = await fetch(`http://localhost:3001/api/task-status/${taskId}`);
      
      if (!statusResponse.ok) {
        throw new Error(`状态查询失败: ${statusResponse.status}`);
      }

      const statusJson = await statusResponse.json();
      const status = statusJson.output.task_status;

      if (status === 'SUCCEEDED') {
        const result = statusJson.output.results[0];
        const imageResponse = await fetch(result.url);
        const imageBlob = await imageResponse.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageBlob);
        });
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('图片生成超时，请重试');
  } catch (err) {
    console.error('图片生成错误:', err);
    throw err;
  }
};

const generateGPTText = async (emotion) => {
  const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!API_KEY) {
    throw new Error('Deepseek API key not configured');
  }

  const prompts = {
    '悲伤': `请创作一个悲伤的meme文案，要求：
1. 第一行是顶部文字
2. 第二行是底部文字
3. 两行文字表达前后反差或意外情况
4. 要用网络流行语
5. 要贴近年轻人生活
6. 要有戏剧性和夸张感

参考例子：
当你熬夜赶完报告
老板说今天放假`,

    '开心': `请创作一个开心的meme文案，要求：
1. 第一行是顶部文字
2. 第二行是底部文字
3. 两行文字表达意外惊喜
4. 要用网络流行语
5. 要贴近年轻人生活
6. 要有喜剧效果

参考例子：
以为要加班
结果老板说提前下班`,

    '恐惧': `请创作一个恐惧的meme文案，要求：
1. 第一行是顶部文字
2. 第二行是底部文字
3. 两行文字表达突如其来的惊吓
4. 要用网络流行语
5. 要贴近年轻人生活
6. 要有夸张效果

参考例子：
当你以为下班了
老板说开个小会`,

    '期待': `请创作一个期待的meme文案，要求：
1. 第一行是顶部文字
2. 第二行是底部文字
3. 两行文字表达强烈期待感
4. 要用网络流行语
5. 要贴近年轻人生活
6. 要有夸张效果

参考例子：
等待周末的我
像极了望眼欲穿的样子`
  };

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的meme文案创作者。请按照以下要求创作:

1. 严格返回两行文字,第一行是顶部文字,第二行是底部文字,用换行符分隔
2. 文案要有强烈的反差感和意外性,能引发共鸣
3. 使用当下流行的网络用语和梗
4. 内容要贴近年轻人的生活场景(工作、学习、社交等)
5. 每次创作都要独特新颖,不重复过往内容
6. 语言要简洁有力,4-10个字为宜
7. 不要照搬例子,要有创意，顶部和底部文字都需要变化
8. 不要加入任何额外的解释或标记

请直接返回两行文字,不要有任何其他内容。`
          },
          {
            role: 'user',
            content: prompts[emotion]
          }
        ],
        temperature: 0.2,
        max_tokens: 100,
        stop: ["\n\n"]
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.choices?.[0]?.message?.content) {
      throw new Error('API返回格式异常');
    }

    const content = json.choices[0].message.content;
    
    // 使用多分隔符尝试分割文本
    const separators = ['\n', '\\n', '。', '！', '?', '？'];
    let parts = [];
    
    for (const separator of separators) {
      parts = content.split(separator).filter(part => part.trim());
      if (parts.length >= 2) break;
    }

    // 如果无法分割成两部分，尝试智能分割
    if (parts.length < 2) {
      const midPoint = Math.ceil(content.length / 2);
      parts = [
        content.slice(0, midPoint).trim(),
        content.slice(midPoint).trim()
      ];
    }

    // 清理和格式化文本
    let [topText, bottomText] = parts;
    
    // 移除常见的模板标记
    const cleanText = (text) => {
      return text
        .replace(/^(我：|没有人：|绝对没有人：|当|如果)/g, '')
        .replace(/[,.!?。！？，、]/g, '')
        .trim();
    };

    topText = cleanText(topText || '');
    bottomText = cleanText(bottomText || '');

    // 确保文本长度合适
    const maxLength = 20;
    topText = topText.length > maxLength ? topText.slice(0, maxLength) + '...' : topText;
    bottomText = bottomText.length > maxLength ? bottomText.slice(0, maxLength) + '...' : bottomText;

    // 如果任一文本为空，使用默认值
    if (!topText || !bottomText) {
      const fallbackTexts = {
        '悲伤': ['当你熬夜赶完报告', '结果第二天放假了'],
        '开心': ['收到工资的那一刻', '整个人都笑醒了'],
        '恐惧': ['当你以为下班了', '老板说开个小会'],
        '期待': ['等待周末的我', '像极了望眼欲穿的样子']
      };
      
      [topText, bottomText] = fallbackTexts[emotion] || ['生成文案中...', '请稍候...'];
    }

    return {
      top: topText,
      bottom: bottomText
    };

  } catch (err) {
    console.error('Text Generation Error:', err);
    // 返回备用文案而不是抛出错误
    const fallbackTexts = {
      '悲伤': {
        top: '当你熬夜赶完报告',
        bottom: '结果第二天放假了'
      },
      '开心': {
        top: '收到工资的那一刻',
        bottom: '整个人都笑醒了'
      },
      '恐惧': {
        top: '当你以为下班了',
        bottom: '老板说开个小会'
      },
      '期待': {
        top: '等待周末的我',
        bottom: '像极了望眼欲穿的样子'
      }
    };

    return fallbackTexts[emotion] || {
      top: '生成文案中...',
      bottom: '请重试...'
    };
  }
};

const MemeGenerator = () => {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const memeRef = useRef(null);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 3 });
  const [loadingText, setLoadingText] = useState('');

  const handleStyleSelect = async (style) => {
    try {
      setSelectedStyle(style);
      setSelectedTemplate(null);
      setTopText('');
      setBottomText('');
      setIsGenerating(true);
      setError(null);
      setGeneratingProgress({ current: 0, total: 3 });

      const imageUrls = [];
      
      // 生成3组不同的提示词和图片
      for (let i = 0; i < 3; i++) {
        setGeneratingProgress(prev => ({ ...prev, current: i + 1 }));
        setLoadingText(`正在生成第 ${i + 1} 张图片...`);

        const prompt = generatePrompt(style.name);
        if (!prompt) {
          throw new Error('提示词生成失败');
        }

        console.log(`第 ${i + 1} 组：生成提示词 "${prompt}"`);
        
        try {
          setLoadingText(`第 ${i + 1} 张图片生成中...请耐心等待`);
          const imageUrl = await generateImage(prompt);
          if (imageUrl) {
            imageUrls.push(imageUrl);
            console.log(`第 ${i + 1} 组：图片生成成功`);
            setLoadingText(`第 ${i + 1} 张图片生成成功！`);
          }
        } catch (error) {
          console.error(`第 ${i + 1} 组：图片生成失败:`, error);
          setLoadingText(`第 ${i + 1} 张图片生成失败，继续生成下一张...`);
          continue;
        }

        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('没有成功生成任何图片，请重试');
      }

      console.log(`成功生成 ${imageUrls.length} 张不同风格的图片`);
      
      const updatedStyle = {
        ...style,
        templates: imageUrls
      };
      
      setSelectedStyle(updatedStyle);
      setSelectedTemplate(imageUrls[0]);
    } catch (error) {
      console.error('生成过程错误:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
      setLoadingText('');
      setGeneratingProgress({ current: 0, total: 3 });
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const generateRandomMeme = async () => {
    if (selectedStyle) {
      try {
        setIsGenerating(true);
        setError(null);

        const randomTemplate = 
          selectedStyle.templates[Math.floor(Math.random() * selectedStyle.templates.length)];
        setSelectedTemplate(randomTemplate);
        
        const gptText = await generateGPTText(selectedStyle.name);
        setTopText(gptText.top);
        setBottomText(gptText.bottom);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const generateMeme = () => {
    if (memeRef.current) {
      html2canvas(memeRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = 'crazy-meme.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <span className="text-5xl mr-3">🤪</span>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              疯狂Meme生成器
            </h1>
          </div>
          <a
            href="https://promptnest.notion.site/AI-ed02fc764f314857a7e51cb69756c45f"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg hover:from-amber-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span>☕</span>
            <span>赏我一杯咖啡</span>
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
          {MEME_STYLES.map((style, index) => (
            <button
              key={index}
              className={`
                px-4 md:px-6 py-2 md:py-3 rounded-full text-base md:text-lg font-semibold transition-all
                ${selectedStyle?.name === style.name 
                  ? 'bg-purple-600 text-white transform scale-105 shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleStyleSelect(style)}
              disabled={isGenerating}
            >
              {style.icon} {style.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {selectedStyle && (
          <div className="space-y-6 md:space-y-8">
            {isGenerating && (
              <div className="text-center space-y-4">
                <div className="text-purple-400 text-xl animate-pulse">
                  🤖 AI正在施展魔法生成新模板...
                </div>
                
                {/* 进度显示 */}
                <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(generatingProgress.current / generatingProgress.total) * 100}%` }}
                  />
                </div>
                
                {/* 进度文字 */}
                <div className="text-gray-300">
                  {loadingText}
                  <div className="text-sm text-gray-400">
                    进度: {generatingProgress.current} / {generatingProgress.total}
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="text-sm text-gray-400 mt-2">
                  每张图片生成需要约10-15秒，请耐心等待...
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedStyle.templates.map((template, index) => (
                <div 
                  key={index}
                  className={`
                    relative rounded-lg overflow-hidden cursor-pointer transition-all
                    ${selectedTemplate === template ? 'ring-4 ring-purple-500' : 'hover:ring-2 hover:ring-purple-400'}
                  `}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <img 
                    src={template}
                    className="w-full aspect-square object-cover"
                    alt={`Meme Template ${index + 1}`}
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-sm px-2 py-1 rounded-full">
                    新生成 #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button 
                className={`
                  px-6 py-3 rounded-full text-lg font-semibold
                  bg-purple-600 text-white hover:bg-purple-700 transition-colors
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={generateRandomMeme}
                disabled={isGenerating}
              >
                🎲 文案随机生成
              </button>
            </div>
          </div>
        )}

        {selectedTemplate && (
          <div className="space-y-6 md:space-y-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text"
                placeholder="顶文字"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
              <input 
                type="text"
                placeholder="底部文"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div ref={memeRef} className="relative inline-block w-full max-w-2xl mx-auto">
              <img 
                src={selectedTemplate}
                alt="Meme Template"
                className="w-full rounded-lg shadow-xl"
              />
              <div className="absolute top-4 left-0 w-full text-center">
                <span className="px-4 py-2 text-4xl font-bold text-white break-words" style={{
                  textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                  fontFamily: 'Impact, sans-serif',
                  WebkitTextStroke: '2px black'
                }}>
                  {topText}
                </span>
              </div>
              <div className="absolute bottom-4 left-0 w-full text-center">
                <span className="px-4 py-2 text-4xl font-bold text-white break-words" style={{
                  textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                  fontFamily: 'Impact, sans-serif',
                  WebkitTextStroke: '2px black'
                }}>
                  {bottomText}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={generateMeme}
                className="px-6 py-3 rounded-full text-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                💾 下载Meme
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemeGenerator;
