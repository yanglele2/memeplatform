import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '.env') });

// 如果环境变量加载失败，使用备用值（仅用于测试）
if (!process.env.ALIYUN_API_KEY) {
  console.warn('Warning: ALIYUN_API_KEY not found in .env, using fallback value');
  process.env.ALIYUN_API_KEY = 'sk-a11c565395bf42bfae7c1317b50f6abd';
}

const API_KEY = process.env.ALIYUN_API_KEY;

// 添加更多的日志输出
console.log('API Key status:', {
  exists: !!API_KEY,
  length: API_KEY ? API_KEY.length : 0,
  value: API_KEY ? `${API_KEY.substring(0, 5)}...` : 'not set'
});

const app = express();

// 允许所有来源的请求
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',  // Vite 开发服务器
      'https://memeplatform.pages.dev', // Cloudflare Pages
      undefined // 允许无 origin 的请求（比如来自 Postman）
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate-image', async (req, res) => {
  console.log('Current API_KEY:', API_KEY ? 'API key exists' : 'API key missing');
  
  if (!API_KEY) {
    console.error('API key not found in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // 每次只生成一张图片
    const requestBody = {
      model: 'flux-schnell',
      input: {
        prompt: req.body.input.prompt
      },
      parameters: {
        n: 1,  // 每次只生成1张图片
        size: '1024*1024',
        steps: 4,
        seed: Math.floor(Math.random() * 1000000), // 随机种子确保每次生成不同的图片
        guidance: 3.5
      }
    };

    // 添加请求日志
    console.log('Sending request to Aliyun:', {
      url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      headers: {
        'Authorization': `Bearer ${API_KEY.substring(0, 5)}...`,
        'X-DashScope-Async': 'enable'
      },
      body: {
        ...requestBody,
        input: {
          prompt: requestBody.input.prompt.substring(0, 50) + '...'
        }
      }
    });

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify(requestBody)
    });
    
    // 添加速率限制处理
    if (response.status === 429) {
      return res.status(429).json({
        error: 'Requests rate limit exceeded, please try again later.',
        details: { retry_after: response.headers.get('retry-after') || '60' }
      });
    }
    
    const data = await response.json();
    console.log('Aliyun API response:', data);

    // 检查API返回的错误码
    if (data.code) {
      console.error('API returned error code:', data);
      return res.status(400).json({
        error: data.message || 'API returned error code',
        code: data.code,
        details: data
      });
    }

    // 验证返回格式是否符合预期
    if (!data.output?.task_id || !data.output?.task_status) {
      console.error('Invalid API response format:', data);
      return res.status(500).json({ 
        error: 'Invalid API response format',
        details: data
      });
    }

    // 返回标准格式的响应
    res.json({
      output: {
        task_id: data.output.task_id,
        task_status: data.output.task_status,
        results: data.output.results || []
      },
      request_id: data.request_id
    });

  } catch (error) {
    console.error('Generate image error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/task-status/:taskId', async (req, res) => {
  if (!API_KEY) {
    console.error('API key not found in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${req.params.taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const data = await response.json();
    console.log('Task status response:', data);

    // 检查API返回的错误码
    if (data.code) {
      console.error('API returned error code:', data);
      return res.status(400).json({
        error: data.message || 'API returned error code',
        code: data.code,
        details: data
      });
    }

    // 验证并返回标准格式的响应
    if (!data.output?.task_status) {
      console.error('Invalid API response format:', data);
      return res.status(500).json({ 
        error: 'Invalid API response format',
        details: data
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Task status error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server timestamp: ${new Date().toISOString()}`);
  console.log('CORS configuration:', {
    origins: ['http://localhost:5173', 'https://memeplatform.pages.dev'],
    methods: ['GET', 'POST'],
    credentials: true
  });
});
