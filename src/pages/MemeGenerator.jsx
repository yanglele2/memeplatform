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
    '[角色] with [夸张表情] expression, [情境], minimalist background, high contrast, dramatic lighting, 4k, illustration style',
    'split screen, left: [场景1] with [表情1], right: [场景2] with [表情2], simple background, vibrant colors, comic style, 4k',
    '[角色], [动作] reacting to [事件], [表情描述], clean background, expressive face, meme style, high quality',
    'extreme close-up of [人物特征] with [情绪] expression, [细节描述], solid color background, high detail face, caricature style',
    'group of [人群类型] reacting to [事件], multiple [情绪] expressions, simple setting, cartoon style, clear composition, 4k'
  ];

  const emotions = {
    '悲伤': {
      角色: ['young student', 'office worker', 'tired person', 'heartbroken lover'],
      夸张表情: ['crying', 'devastated', 'heartbroken', 'weeping uncontrollably'],
      情境: ['after failing exam', 'missing deadline', 'in empty room', 'at funeral'],
      场景1: ['empty office', 'rainy day', 'abandoned park', 'quiet hospital'],
      表情1: ['tears flowing', 'sobbing', 'quivering mouth', 'drooping shoulders'],
      场景2: ['dark bedroom', 'lonely cafe', 'empty train station', 'gloomy weather'],
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

const generateImage = async (prompt) => {
  const API_KEY = import.meta.env.VITE_GETIMG_API_KEY;
  if (!API_KEY) {
    throw new Error('API key not configured');
  }

  const url = 'https://api.getimg.ai/v1/stable-diffusion-xl/text-to-image';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'real-cartoon-xl-v6',
      width: 1024,
      height: 1024,
      steps: 25,
      guidance: 7,
      response_format: 'b64',
      prompt: prompt + ', memetic, viral potential, highly shareable, clean edges, easy to edit, clear focal point, no text'
    })
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    console.log('API Response:', json);

    if (!json.image) {
      throw new Error('API返回缺少图片数据');
    }

    return `data:image/jpeg;base64,${json.image}`;
  } catch (err) {
    console.error('Generation Error:', err);
    throw new Error(`图片生成失败: ${err.message}`);
  }
};

const generateGPTText = async (emotion) => {
  if (!import.meta.env.VITE_GPT_API_KEY) {
    throw new Error('GPT API key not configured');
  }

  const prompts = {
    '悲伤': `创作一个悲伤的meme文案，使用以下模板之一：

1. 当你[情境]，但[意外情况]
例如：当你熬夜赶完报告，但老板临时取消会议

2. 我：[自我期待]
现实：[现实情况]
例如：我：今晚一定早睡！
现实：刷手机到凌晨

3. 没有人：
绝对没有人：
[某人/某物]：[出人意料的行为]
例如：没有人：
绝对没有人：
我：凌晨三点开始自闭

4. 当[某人]说[某句话]时，我的内心是这样的：[内心独白/反应]
例如：当朋友说"你最近好像胖了"时，我的内心是这样的：？？？

要求：
1. 文字要简短有力
2. 可以用网络流行语
3. 要有戏剧性和夸张感
4. 贴近年轻人表达方式

格式：顶部文字\\n底部文字`,

    '开心': `创作一个开心的meme文案，使用以下模板之一：

1. 当你[情境]，但[意外情况]
例如：当你以为要加班，但老板说提前下班

2. 我：[自我期待]
现实：[超出预期的惊喜]
例如：我：希望能及格
现实：考了满分

3. 没有人：
绝对没有人：
[某人/某物]：[出人意料的快乐行为]
例如：没有人：
绝对没有人：
我：收到工资后疯狂购物

4. [动作]就像[比喻/形容]
例如：发工资日就像过年一样快乐

要求：
1. 要有梗，要搞笑
2. 用流行梗和网络用语
3. 反应要夸张
4. 突出喜剧效果

格式：顶部文字\\n底部文字`,

    '恐惧': `创作一个恐惧的meme文案，使用以下模板之一：

1. 如果我有[数量][物品]，每当[情况]，我就会[结果]
例如：如果我有一块钱，每当看恐怖片被吓到，我就会成为百万富翁

2. 那种当你[情境]的感觉，真是[形容词]
例如：那种当你半夜听到奇怪声音的感觉，真是魂飞魄散

3. 没有人：
绝对没有人：
[某人/某物]：[出人意料的恐惧反应]
例如：没有人：
绝对没有人：
我：看到蟑螂后原地起飞

4. 当[某人]说[某句话]时，我：[夸张反应]
例如：当老板说"周末加班"时，我：瑟瑟发抖.jpg

要求：
1. 要有喜剧效果
2. 用网络流行语
3. 反应要夸张搞笑
4. 贴近生活场景

格式：顶部文字\\n底部文字`,

    '期待': `创作一个期待的meme文案，使用以下模板之一：

1. 谁还记得[过去的事物]？
例如：谁还记得等待游戏更新的激动心情？

2. 当你终于[完成某事]，但[新的挑战]
例如：当你终于等到周五，但想到下周一又要上班

3. [某人]：你应该[建议]
我：[内心OS/反应]
例如：朋友：你应该冷静点
我：等待演唱会门票开售中.gif

4. 没有人：
绝对没有人：
[某人/某物]：[出人意料的期待行为]
例如：没有人：
绝对没有人：
我：演唱会前一周开始倒计时

要求：
1. 要有梗，要好笑
2. 用流行梗和网络用语
3. 情绪要夸张
4. 贴近年轻人表达

格式：顶部文字\\n底部文字`
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个专业的meme文案创作者，擅长创作简短、有趣、富有情感的文案。"
        },
        {
          role: "user",
          content: prompts[emotion]
        }
      ]
    });

    const content = response.choices[0].message.content;
    const [topText, bottomText] = content.split('\n').map(text => text.trim());

    if (!topText || !bottomText) {
      throw new Error('无法解析GPT返回的文案格式');
    }

    return {
      top: topText,
      bottom: bottomText
    };
  } catch (err) {
    console.error('GPT Generation Error:', err);
    throw new Error(`文案生成失败: ${err.message}`);
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

  const handleStyleSelect = async (style) => {
    try {
      setSelectedStyle(style);
      setSelectedTemplate(null);
      setTopText('');
      setBottomText('');
      setIsGenerating(true);
      setError(null);

      const prompts = Array(3).fill().map(() => {
        const prompt = generatePrompt(style.name);
        if (!prompt) {
          throw new Error('提示词生成失败');
        }
        return prompt;
      });

      const imageUrls = await Promise.all(
        prompts.map(prompt => generateImage(prompt))
      );

      const updatedStyle = {
        ...style,
        templates: imageUrls
      };
      
      setSelectedStyle(updatedStyle);
      setSelectedTemplate(imageUrls[0]);
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
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
      } catch (error) {
        console.error('Random generation error:', error);
        setError(error.message);
        
        const randomTexts = {
          '悲伤': {
            tops: [
              '当你熬夜赶完报告',
              '没有人：\n绝对没有人：',
              '我：这次一定能做完',
              '当闹钟响起的那一刻',
              '如果我有一块钱',
              '那种写完代码没保存的感觉'
            ],
            bottoms: [
              '但老板说今天放假',
              '我：凌晨三点开始自闭',
              '现实：躺平等明天',
              '我的灵魂：已经出窍了',
              '每当debug失败我就会成为百万富翁',
              '真是欲哭无泪'
            ]
          },
          '开心': {
            tops: [
              '当你以为要加班',
              '没有人：\n绝对没有人：',
              '我：希望能及格',
              '发工资日就像',
              '如果快乐能存储',
              '那种代码一次通过的感觉'
            ],
            bottoms: [
              '但老板说提前下班',
              '我：收到工资后疯狂购物',
              '现实：考了满分',
              '过年一样快乐',
              '我的硬盘早就爆满了',
              '简直像中了彩票'
            ]
          },
          '恐惧': {
            tops: [
              '如果我有一块钱',
              '那种当你半夜听到声音',
              '没有人：\n绝对没有人：',
              '当老板说周末加班时',
              '看到蟑螂时的我',
              '当你发现代码没备份'
            ],
            bottoms: [
              '每当被吓到我就会成为百万富翁',
              '结果发现是室友在煮泡面',
              '我：看到bug后原地起飞',
              '我：已经开始颤抖了',
              '速度比闪电侠还快',
              '整个人都不好了'
            ]
          },
          '期待': {
            tops: [
              '谁还记得等待游戏更新',
              '当你终于等到周五',
              '朋友：你应该冷静点',
              '没有人：\n绝对没有人：',
              '等待快递的我',
              '当你期待已久的电影上映'
            ],
            bottoms: [
              '那种激动的心情',
              '但想到下周一又要上班',
              '我：等待演唱会门票开售中.gif',
              '我：演唱会前一周开始倒计时',
              '每分钟都在刷新物流信息',
              '我：通宵排队都值得'
            ]
          }
        };

        const texts = randomTexts[selectedStyle.name];
        setTopText(texts.tops[Math.floor(Math.random() * texts.tops.length)]);
        setBottomText(texts.bottoms[Math.floor(Math.random() * texts.bottoms.length)]);
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
              <div className="text-center text-purple-400 text-xl animate-pulse">
                🤖 AI正在施展魔法生成新模板...
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
                placeholder="顶部文字"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
              <input 
                type="text"
                placeholder="底部文字"
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
