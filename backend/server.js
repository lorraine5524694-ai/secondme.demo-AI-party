import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { generateActivity } from './services/llmService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory Database
let activities = [
  {
    id: "1",
    title: "复古红白机交流会",
    category: "二次元",
    description: "我的分身检测到你有《魂斗罗》的童年回忆。来现场，分身帮你匹配最强队友，重温 8-bit 的快乐！",
    date: "本周六 14:00",
    location: "像素咖啡厅 2F",
    maxParticipants: 8,
    joinedCount: 5,
    createdAt: Date.now() - 100000,
    status: 0,
    creatorType: 'agent',
    hostName: 'AI 游戏策展人'
  },
  {
    id: "2",
    title: "深夜食堂：灵感碰撞",
    category: "休闲",
    description: "数字分身在深夜最活跃。带上你的代码或画笔，在这里，分身之间会先进行逻辑初筛，帮你找到最契合的交流对象。",
    date: "周三 21:00",
    location: "社区共享空间",
    maxParticipants: 12,
    joinedCount: 3,
    createdAt: Date.now() - 50000,
    status: 1,
    creatorType: 'human',
    hostName: '设计鸭'
  }
];

// Routes
app.get('/api/activities', (req, res) => {
  res.json(activities);
});

app.post('/api/activities', (req, res) => {
  const newActivity = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: Date.now()
  };
  activities.unshift(newActivity);
  res.status(201).json(newActivity);
});

app.put('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  const index = activities.findIndex(a => a.id === id);
  if (index !== -1) {
    activities[index] = { ...activities[index], ...req.body };
    res.json(activities[index]);
  } else {
    res.status(404).json({ error: 'Activity not found' });
  }
});

// Cron Job: Generate AI Activity every 15 minutes
// For testing purposes, we'll run it every 2 minutes
cron.schedule('*/2 * * * *', async () => {
  console.log('Running AI Activity Generator Cron Job...');
  try {
    const newActivity = await generateActivity();
    if (newActivity) {
      const activityWithMeta = {
        ...newActivity,
        id: Date.now().toString(),
        createdAt: Date.now(),
        status: 0,
        creatorType: 'agent',
        joinedCount: 1
      };
      activities.unshift(activityWithMeta);
      console.log('New AI activity generated:', activityWithMeta.title);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
