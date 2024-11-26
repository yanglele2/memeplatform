addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const request = event.request;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)
  
  // 健康检查端点
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }

  // 图片生成端点
  if (url.pathname === '/api/generate-image' && request.method === 'POST') {
    try {
      const API_KEY = event.env.ALIYUN_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }

      const requestData = await request.json()
      const { prompt } = requestData

      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify({
          model: 'stable-diffusion-xl',
          input: {
            prompt: prompt
          }
        })
      })

      const data = await response.json()
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
  }

  // 任务状态检查端点
  if (url.pathname.startsWith('/api/task-status/') && request.method === 'GET') {
    try {
      const API_KEY = event.env.ALIYUN_API_KEY
      if (!API_KEY) {
        throw new Error('API key not configured')
      }

      const taskId = url.pathname.split('/').pop()
      
      const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
  }

  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders
  })
}
