import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Default mock generation if API key is not provided
const generateMockActivity = () => {
  const locations = [
    "社区共享空间", "猫头鹰桌游馆", "市中心图书馆", "像素咖啡厅 2F", 
    "朝阳公园大草坪", "老王茶馆", "星空天台", "798 艺术中心", 
    "街道活动室", "WeWork 会议室 B"
  ];
  
  const timeSlots = [
    "本周五 19:30", "本周六 14:00", "本周六 20:00", 
    "本周日 10:00", "本周日 15:30", "下周三 21:00"
  ];

  const mockTemplates = [
    {
      title: "AI 读书分享会：人类简史",
      category: "休闲",
      description: "本周我们来聊聊《人类简史》。AI 已经为你提取了书中的核心观点，即使没读完也没关系，快来和大家碰撞思想吧！",
      hostName: "AI 读书伴侣"
    },
    {
      title: "周末狼人杀高端局",
      category: "桌游",
      description: "AI 匹配了 12 位高阶玩家，拒绝贴脸，纯逻辑推理。分身已为你准备了复盘工具，胜率预测实时更新。",
      hostName: "AI 法官"
    },
    {
      title: "胶片摄影扫街团",
      category: "户外",
      description: "分身检测到你喜欢复古滤镜。来参加这场胶片摄影漫步，路线由 AI 根据今日光线最佳路径规划。",
      hostName: "AI 摄影师"
    },
    {
      title: "Switch 派对：马里奥赛车",
      category: "二次元",
      description: "不需要任何社交技巧，只需要一颗想赢的心。分身会自动平衡比赛难度，让每个人都能享受漂移的快乐。",
      hostName: "AI 游戏策展人"
    },
    {
      title: "社区掼蛋切磋局",
      category: "休闲",
      description: "分身用长辈的口吻发起的局。寻找牌技相当的牌友，AI 负责记牌和算分，你只管出牌。",
      hostName: "AI 棋牌室主"
    },
    {
      title: "落日瑜伽 & 冥想",
      category: "户外",
      description: "根据你的压力指数推荐。在城市最高点的露台，伴着 AI 生成的白噪音，进行一场 60 分钟的身心疗愈。",
      hostName: "AI 健康管家"
    },
    {
      title: "精酿啤酒品鉴夜",
      category: "休闲",
      description: "AI 分析了你的口味偏好，挑选了 6 款最适合你的精酿。微醺时刻，让分身帮你找到聊得来的酒搭子。",
      hostName: "AI 侍酒师"
    },
    {
      title: "克苏鲁跑团：深海呼唤",
      category: "桌游",
      description: "由 AI 担任 KP (守秘人) 的 TRPG 体验。剧本实时生成，你的每一个选择都会改变故事的走向。",
      hostName: "AI 守秘人"
    },
    {
      title: "周五夜骑刷街",
      category: "户外",
      description: "避开拥堵路段，AI 规划了一条风景绝美的 15km 骑行路线。不仅是运动，更是一场城市探险。",
      hostName: "AI 领骑员"
    },
    {
      title: "二次元手办交流展",
      category: "二次元",
      description: "带上你的珍藏，分身已经帮你估算了市场价值。这里有最懂你的同好，还有 AI 生成的二次元立绘合影。",
      hostName: "AI 宅文化大使"
    }
  ];

  const template = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  const randomTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
  const randomParticipants = Math.floor(Math.random() * 10) + 5; // 5-15人

  return {
    ...template,
    date: randomTime,
    location: randomLocation,
    maxParticipants: randomParticipants
  };
};

export const generateActivity = async () => {
  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using mock data.');
    return generateMockActivity();
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `你是一个智能社交活动策划Agent。请生成一个富有吸引力的线下活动。
          返回格式必须是纯JSON，包含以下字段：
          {
            "title": "活动标题",
            "category": "休闲/桌游/二次元/户外 中的一个",
            "description": "活动描述，突出AI匹配的特点",
            "date": "如: 本周六 14:00",
            "location": "活动地点",
            "maxParticipants": 数字 (5-20之间),
            "hostName": "发起人名称，如 AI 游戏策展人"
          }`
        },
        {
          role: "user",
          content: "请随机生成一个针对年轻人的周末聚会活动。"
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error generating activity from OpenAI:', error);
    return generateMockActivity(); // Fallback to mock on error
  }
};
