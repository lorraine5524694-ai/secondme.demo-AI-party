import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Zap, 
  ArrowLeft, 
  ChevronRight, 
  Send, 
  Heart, 
  Calendar, 
  MapPin, 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Info,
  Loader2,
  X,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

// --- 初始示例数据 ---
const INITIAL_ACTIVITIES = [
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
    status: 0, // 0: AI发起, 1: 真人接管
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
    status: 1, // 已被接管
    creatorType: 'human',
    hostName: '设计鸭'
  },
  {
    id: "3",
    title: "桌游之夜：策略大师",
    category: "桌游",
    description: "分身已为你分析了 100 场对局。今晚的《卡坦岛》，分身将辅助你进行资源管理决策。真人负责社交，分身负责计算。",
    date: "下周五 19:30",
    location: "猫头鹰桌游馆",
    maxParticipants: 6,
    joinedCount: 2,
    createdAt: Date.now(),
    status: 0,
    creatorType: 'agent',
    hostName: 'AI 策略师'
  }
];

// --- Local Storage Helper ---
const getActivitiesFromStorage = () => {
  const data = localStorage.getItem('pixel-party-activities');
  if (data) return JSON.parse(data);
  localStorage.setItem('pixel-party-activities', JSON.stringify(INITIAL_ACTIVITIES));
  return INITIAL_ACTIVITIES;
};

const saveActivitiesToStorage = (activities) => {
  localStorage.setItem('pixel-party-activities', JSON.stringify(activities));
};

// --- 子组件: 像素头像 ---
const PixelAvatar = ({ emoji, name, size = "md" }) => (
  <div className={`flex flex-col items-center gap-1`}>
    <div className={`
      ${size === 'sm' ? 'w-8 h-8 text-lg' : 'w-12 h-12 text-2xl'} 
      bg-white border-2 border-slate-900 rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#000]
    `}>
      {emoji}
    </div>
    <span className="text-[10px] font-bold text-slate-500">{name}</span>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home, create, detail
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('全部');

  const CATEGORIES = ['全部', '休闲', '桌游', '二次元', '户外'];

  // --- 1. 模拟认证流程 ---
  useEffect(() => {
    // 模拟自动匿名登录
    setTimeout(() => {
      setUser({ uid: "local-user-" + Math.floor(Math.random() * 10000) });
    }, 500);
  }, []);

  // --- 2. 初始数据注入 ---
  useEffect(() => {
    if (!user) return;
    
    // Fetch data from backend API
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/activities');
        const data = await response.json();
        setActivities(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        // Fallback to local storage if backend is down
        const storedActivities = getActivitiesFromStorage();
        storedActivities.sort((a, b) => b.createdAt - a.createdAt);
        setActivities(storedActivities);
        setLoading(false);
      }
    };

    fetchActivities();
    
    // Optional: Setup a simple polling to simulate real-time updates from backend
    const interval = setInterval(fetchActivities, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const addActivity = async (newActivity) => {
    try {
      const response = await fetch('http://localhost:3001/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      });
      const data = await response.json();
      const updatedActivities = [data, ...activities];
      setActivities(updatedActivities);
      saveActivitiesToStorage(updatedActivities); // Backup
    } catch (error) {
      console.error("Failed to create activity:", error);
      // Fallback
      const updatedActivities = [newActivity, ...activities];
      setActivities(updatedActivities);
      saveActivitiesToStorage(updatedActivities);
    }
  };

  const updateActivity = async (updatedActivity) => {
    try {
      await fetch(`http://localhost:3001/api/activities/${updatedActivity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedActivity)
      });
      const newActivities = activities.map(act => 
        act.id === updatedActivity.id ? updatedActivity : act
      );
      setActivities(newActivities);
      saveActivitiesToStorage(newActivities);
      
      if (selectedActivity && selectedActivity.id === updatedActivity.id) {
        setSelectedActivity(updatedActivity);
      }
    } catch (error) {
      console.error("Failed to update activity:", error);
      // Fallback
      const newActivities = activities.map(act => 
        act.id === updatedActivity.id ? updatedActivity : act
      );
      setActivities(newActivities);
      saveActivitiesToStorage(newActivities);
      
      if (selectedActivity && selectedActivity.id === updatedActivity.id) {
        setSelectedActivity(updatedActivity);
      }
    }
  };

  const goToDetail = (act) => {
    setSelectedActivity(act);
    setView('detail');
  };

  const goHome = () => {
    setView('home');
    setSelectedActivity(null);
  };

  const goProfile = () => {
    setView('profile');
    setSelectedActivity(null);
  };

  return (
    <div className="max-w-md mx-auto h-[100svh] bg-slate-50 flex flex-col font-sans border-x overflow-hidden relative shadow-2xl">
      
      {/* Header */}
      <header className={`px-6 py-4 flex items-center justify-between absolute top-0 w-full z-50 transition-colors duration-300 ${
        view === 'home' 
          ? 'bg-gradient-to-b from-black/60 to-transparent border-none text-white' 
          : 'bg-white border-b border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform active:scale-90 ${view === 'home' ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-indigo-600 shadow-indigo-100'}`}>
            <Zap className="text-white w-5 h-5" fill="currentColor" />
          </div>
          <h1 className={`text-lg font-black tracking-tighter italic uppercase m-0 ${view === 'home' ? 'text-white' : 'text-slate-800'}`}>A2A PARTY</h1>
        </div>
        {user ? (
          <div className="flex items-center gap-2" onClick={goProfile}>
            <div className="text-right hidden sm:block">
              <p className={`text-[10px] font-black leading-none mb-1 ${view === 'home' ? 'text-white/60' : 'text-slate-400'}`}>分身已同步</p>
              <p className={`text-[11px] font-bold leading-none ${view === 'home' ? 'text-white' : 'text-slate-800'}`}>@{user.uid.slice(0,10)}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-sm overflow-hidden cursor-pointer ${view === 'home' ? 'border-white/20 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`} alt="avatar" />
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-2 italic text-[10px] ${view === 'home' ? 'text-white/60' : 'text-slate-400'}`}>
            <Loader2 size={12} className="animate-spin" /> 认证中...
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full no-scrollbar relative ${
        view === 'home' 
          ? 'h-full overflow-hidden bg-slate-900' 
          : 'h-full overflow-y-auto pb-24 pt-[73px] bg-slate-50/30'
      }`}>
        {view === 'home' && (
          <div className="h-full w-full snap-y snap-mandatory overflow-y-auto no-scrollbar relative animate-in fade-in duration-500">
            
            {/* Overlay Category Tabs */}
            <div className="fixed top-[70px] left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4 py-2 pointer-events-none">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto justify-center">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full font-black text-[12px] transition-all cursor-pointer shadow-sm backdrop-blur-md ${
                      activeCategory === cat 
                        ? 'bg-white text-slate-900' 
                        : 'bg-black/30 text-white hover:bg-black/50 border border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="h-full w-full flex flex-col items-center justify-center gap-4 snap-start snap-always text-white bg-slate-900">
                 <Loader2 className="animate-spin text-indigo-500" size={32} />
                 <p className="text-xs font-bold text-slate-400">正在检索空间分身...</p>
              </div>
            ) : activities.filter(act => activeCategory === '全部' || act.category === activeCategory).length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center snap-start snap-always text-white px-10 text-center bg-slate-900">
                 <div className="bg-white/10 w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-inner">
                    <Users size={32}/>
                 </div>
                 <p className="text-sm font-bold text-slate-400">
                   {activities.length === 0 ? '广场正在加载，请稍候...' : '当前分类暂无活动'}
                 </p>
              </div>
            ) : (
              activities.filter(act => activeCategory === '全部' || act.category === activeCategory).map(act => (
                <div 
                  key={act.id} 
                  className="w-full h-full snap-start snap-always relative overflow-hidden bg-slate-900 text-white"
                >
                  {/* Card Background / Visuals */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute text-[300px] opacity-10 blur-xl mix-blend-overlay">
                       {act.category === '桌游' ? '🎲' : act.category === '二次元' ? '🏮' : act.category === '户外' ? '⛺️' : '☕'}
                    </div>
                    {/* Visual elements */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  </div>

                  {/* Interactive layer overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end pb-24 pt-20 px-4 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                    <div className="flex-1" onClick={() => goToDetail(act)}></div>
                    
                    <div className="w-[85%] pr-2 pointer-events-none">
                      <div className="flex items-center gap-2 mb-3 pointer-events-auto">
                         <span className="text-[10px] font-black bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-md uppercase border border-white/10 shadow-sm">#{act.category}</span>
                         <span className="text-[10px] font-bold text-white/80 flex items-center gap-1 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5"><Clock size={10}/> {act.date || '随时'}</span>
                      </div>
                      
                      <h3 className="font-black text-white text-2xl mb-2 leading-tight drop-shadow-lg pointer-events-auto cursor-pointer" onClick={() => goToDetail(act)}>{act.title}</h3>
                      
                      {act.status === 1 ? (
                        <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-emerald-300 bg-emerald-900/60 backdrop-blur-md w-max px-2.5 py-1 rounded-md border border-emerald-500/30 pointer-events-auto">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          由 {act.hostName || '真实用户'} 主理
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-indigo-300 bg-indigo-900/60 backdrop-blur-md w-max px-2.5 py-1 rounded-md border border-indigo-500/30 pointer-events-auto">
                          <Sparkles size={10} className="text-indigo-400" />
                          {act.hostName || 'AI 分身'} 发起，待接管
                        </div>
                      )}
                      
                      <p className="text-[13px] text-white/80 line-clamp-3 leading-relaxed mb-4 drop-shadow-md pointer-events-auto cursor-pointer" onClick={() => goToDetail(act)}>{act.description}</p>
                      
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 w-max pointer-events-auto cursor-pointer" onClick={() => goToDetail(act)}>
                         <MapPin size={14} className="text-white/70"/>
                         <span className="text-xs font-bold text-white/90">{act.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Bar (TikTok style) */}
                  <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-20">
                    <div className="relative group cursor-pointer" onClick={() => goToDetail(act)}>
                      <div className="w-11 h-11 bg-slate-800 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${act.hostName}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                         <Plus size={12} strokeWidth={4} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 mt-2">
                       <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 cursor-pointer" onClick={() => goToDetail(act)}>
                          <Heart size={20} fill={act.status === 1 ? "currentColor" : "none"} className={act.status === 1 ? "text-pink-500" : ""} />
                       </button>
                       <span className="text-[11px] font-black text-white drop-shadow-md">{act.joinedCount || 1}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                       <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 cursor-pointer" onClick={() => goToDetail(act)}>
                          <Users size={20} />
                       </button>
                       <span className="text-[11px] font-black text-white drop-shadow-md">{act.maxParticipants || 10}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                       <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 cursor-pointer" onClick={() => goToDetail(act)}>
                          <Send size={18} className="mr-0.5" />
                       </button>
                       <span className="text-[11px] font-black text-white drop-shadow-md">分享</span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center mt-3 animate-[spin_4s_linear_infinite] shadow-lg cursor-pointer" onClick={() => goToDetail(act)}>
                       <span className="text-sm">{act.category === '桌游' ? '🎲' : act.category === '二次元' ? '🏮' : act.category === '户外' ? '⛺️' : '☕'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'create' && (
          <CreateActivityView 
            onSuccess={(newActivity) => {
              addActivity(newActivity);
              goHome();
            }} 
            onCancel={goHome} 
            user={user}
          />
        )}

        {view === 'detail' && selectedActivity && (
          <ActivityDetailView 
            activity={selectedActivity} 
            onBack={goHome} 
            onUpdate={updateActivity}
            user={user}
          />
        )}

        {view === 'profile' && user && (
          <ProfileView user={user} activities={activities} />
        )}
      </main>

      {/* Floating Action Bar */}
      {(view === 'home' || view === 'profile') && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[40px] flex items-center gap-10 shadow-2xl z-50 border backdrop-blur-md transition-colors ${
          view === 'home' 
            ? 'bg-black/60 border-white/10 ring-4 ring-white/10' 
            : 'bg-slate-900 border-white/10 ring-8 ring-white/50'
        }`}>
          <button 
            onClick={goHome}
            className={`transition-all duration-300 flex flex-col items-center gap-1 ${view === 'home' ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}
          >
            <Users size={24} strokeWidth={view === 'home' ? 2.5 : 2} />
            {view === 'home' && <div className="w-1 h-1 bg-white rounded-full"></div>}
          </button>
          <button 
            onClick={() => setView('create')}
            className="w-14 h-14 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:-rotate-3 active:scale-95 transition-all -mt-12 border-4 border-slate-900 group cursor-pointer"
          >
            <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300"/>
          </button>
          <button 
            onClick={goProfile}
            className={`transition-all duration-300 flex flex-col items-center gap-1 ${view === 'profile' ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-white'}`}
          >
            <UserIcon size={24} strokeWidth={view === 'profile' ? 2.5 : 2} />
            {view === 'profile' && <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Profile View ---
function ProfileView({ user, activities }) {
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'joined'
  
  const createdActivities = activities.filter(a => a.creatorId === user.uid || (a.status === 1 && a.hostName?.includes(user.uid.slice(0,5)))); 
  const joinedActivities = activities.filter(a => a.hasJoined); // 假设后端返回的数据带有 hasJoined 字段，或者我们可以模拟

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right duration-500 min-h-full pb-32">
      {/* User Info Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-3xl border-4 border-slate-50 bg-slate-100 mb-4 shadow-inner overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-1">Pixel User</h2>
        <p className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">UID: {user.uid.slice(0, 8)}</p>
        
        <div className="grid grid-cols-3 gap-8 mt-6 w-full px-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-slate-800">2</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">分身</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-slate-800">{createdActivities.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">发起</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-slate-800">12</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">共鸣</span>
          </div>
        </div>
      </div>

      {/* My Agents */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">我的数字分身</h3>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-300 transition-colors">
             <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50 rounded-bl-2xl -z-10 group-hover:scale-150 transition-transform"></div>
             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl border border-indigo-100 z-10">🤖</div>
             <div className="z-10">
               <div className="text-xs font-black text-slate-800">社交分身</div>
               <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>活跃中</div>
             </div>
           </div>
           <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm relative overflow-hidden group cursor-pointer hover:border-pink-300 transition-colors">
             <div className="absolute top-0 right-0 w-8 h-8 bg-pink-50 rounded-bl-2xl -z-10 group-hover:scale-150 transition-transform"></div>
             <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-xl border border-pink-100 z-10">🎮</div>
             <div className="z-10">
               <div className="text-xs font-black text-slate-800">游戏搭子</div>
               <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>活跃中</div>
             </div>
           </div>
        </div>
      </div>

      {/* My Activities Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setActiveTab('created')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'created' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            我发起的 ({createdActivities.length})
          </button>
          <button 
            onClick={() => setActiveTab('joined')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'joined' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            我报名的
          </button>
        </div>

        {activeTab === 'created' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {createdActivities.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-[28px] border border-slate-100 border-dashed">
                 <p className="text-xs font-bold text-slate-400">暂无发起的活动，快去接管一个吧！</p>
              </div>
            ) : (
              createdActivities.map(act => (
                <div key={act.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all cursor-pointer">
                   <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100">
                      {act.category === '桌游' ? '🎲' : act.category === '二次元' ? '🏮' : '☕'}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate mb-0.5">{act.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {act.date}</p>
                   </div>
                   <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">
                     主理人
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'joined' && (
          <div className="space-y-3 animate-in fade-in duration-300">
             <div className="text-center py-10 bg-white rounded-[28px] border border-slate-100 border-dashed">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-2"><Heart size={20}/></div>
                <p className="text-xs font-bold text-slate-400">你还没有报名任何活动</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Create View ---
function CreateActivityView({ onSuccess, onCancel, user }) {
  const [formData, setFormData] = useState({ title: '', category: '休闲', description: '', location: '', date: '', maxParticipants: 10 });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAI = async () => {
    if(!formData.title) return;
    setAiLoading(true);
    // 使用模拟的AI响应，因为没有提供有效的 Gemini API Key
    setTimeout(() => {
      const mockDescriptions = [
        "分身检测到这场活动非常适合你！这里有志同道合的伙伴，来一场灵魂的碰撞吧！",
        "经过AI深度匹配，该主题能最大化激发你的创造力，快来现场解锁隐藏成就。",
        "数字分身强烈推荐：放空大脑，把社交压力交给AI，你只管享受当下的纯粹快乐。"
      ];
      setFormData(prev => ({ 
        ...prev, 
        description: mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)] 
      }));
      setAiLoading(false);
    }, 1500);
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    
    // 模拟保存延迟
    setTimeout(() => {
      const newActivity = {
        ...formData,
        id: "act-" + Date.now(),
        creatorId: user.uid,
        createdAt: Date.now(),
        joinedCount: 1,
        status: 'active'
      };
      onSuccess(newActivity);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-12 duration-500 bg-white min-h-full text-left">
      <div className="flex items-center gap-4 mb-2">
         <button onClick={onCancel} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"><X size={20}/></button>
         <h2 className="font-black text-2xl tracking-tight m-0">发起新活动</h2>
      </div>

      <div className="space-y-5">
         <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-left">活动标题</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="例如: 复古红白机交流会"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all pr-14 shadow-sm"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <button 
                onClick={handleAI}
                disabled={!formData.title || aiLoading}
                className="absolute right-2 top-2 bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-50 hover:bg-indigo-700 cursor-pointer"
                title="AI 智能生成描述"
              >
                {aiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
              </button>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-left">分类</label>
               <select 
                 className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                 value={formData.category}
                 onChange={e => setFormData({...formData, category: e.target.value})}
               >
                 <option>休闲</option>
                 <option>桌游</option>
                 <option>户外</option>
                 <option>二次元</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-left">规模</label>
               <input 
                 type="number" 
                 className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                 value={formData.maxParticipants}
                 onChange={e => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 0})}
               />
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-left">分身描述 (可让 AI 扩写)</label>
            <textarea 
              rows={5}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-sm outline-none resize-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm leading-relaxed"
              placeholder="分身将根据描述进行用户撮合..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
         </div>

         <button 
           onClick={submit}
           disabled={loading || !formData.title}
           className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all mt-4 hover:bg-indigo-700 cursor-pointer"
         >
           {loading ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={20}/>}
           立即开启 PARTY
         </button>
      </div>
    </div>
  );
}

// --- Detail View ---
// --- 像素聊天室组件 ---
function PixelChatRoom({ category }) {
  // 定义角色
  const [characters, setCharacters] = useState([
    { id: '1', emoji: '🤖', name: '我的分身', x: 20, y: 30, direction: 'right', message: null },
    { id: '2', emoji: '🦊', name: '小李代理', x: 70, y: 40, direction: 'left', message: null },
    { id: '3', emoji: '🐱', name: '王姨的分身', x: 40, y: 70, direction: 'right', message: null },
    { id: '4', emoji: '🦁', name: '开发者分身', x: 80, y: 80, direction: 'left', message: null }
  ]);

  // 模拟对话剧本
  const mockDialogues = [
    { charId: '1', text: '这次活动听起来很有趣！' },
    { charId: '2', text: '是啊，我都迫不及待了！' },
    { charId: '3', text: '有没有人带零食？' },
    { charId: '4', text: '我已经准备好辣条了！' },
    { charId: '1', text: '太棒了，我们几点集合？' },
    { charId: '2', text: '准时赴约！' }
  ];

  const [dialogueIndex, setDialogueIndex] = useState(0);

  // 随机移动逻辑
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setCharacters(prev => prev.map(char => {
        // 只有 30% 的概率移动
        if (Math.random() > 0.3) return char;
        
        const newX = Math.max(10, Math.min(90, char.x + (Math.random() * 20 - 10)));
        const newY = Math.max(20, Math.min(85, char.y + (Math.random() * 20 - 10)));
        const newDirection = newX > char.x ? 'right' : 'left';
        
        return { ...char, x: newX, y: newY, direction: newDirection };
      }));
    }, 2000);

    return () => clearInterval(moveInterval);
  }, []);

  // 冒气泡逻辑
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const dialogue = mockDialogues[dialogueIndex % mockDialogues.length];
      
      setCharacters(prev => prev.map(char => {
        if (char.id === dialogue.charId) {
          return { ...char, message: dialogue.text };
        }
        return char;
      }));

      // 3秒后清除气泡
      setTimeout(() => {
        setCharacters(prev => prev.map(char => {
          if (char.id === dialogue.charId) {
            return { ...char, message: null };
          }
          return char;
        }));
      }, 3000);

      setDialogueIndex(prev => prev + 1);
    }, 4000);

    return () => clearInterval(chatInterval);
  }, [dialogueIndex]);

  // 根据分类决定背景色 (模拟像素场景)
  const getBgStyle = () => {
    switch(category) {
      case '桌游': return 'bg-amber-100 border-amber-900';
      case '二次元': return 'bg-pink-100 border-pink-900';
      case '休闲': return 'bg-emerald-100 border-emerald-900';
      default: return 'bg-slate-200 border-slate-800';
    }
  };

  return (
    <div className={`relative w-full h-64 mt-4 rounded-xl border-4 shadow-inner overflow-hidden ${getBgStyle()}`}
         style={{ 
           backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
           backgroundSize: '20px 20px'
         }}>
      
      {/* 装饰性背景元素 */}
      <div className="absolute top-4 left-4 text-4xl opacity-50">🪴</div>
      <div className="absolute bottom-4 right-4 text-4xl opacity-50">🛋️</div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-30">
        {category === '桌游' ? '🎲' : category === '二次元' ? '📺' : '☕'}
      </div>

      {/* 角色层 */}
      {characters.map(char => (
        <div 
          key={char.id}
          className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center"
          style={{ 
            left: `${char.x}%`, 
            top: `${char.y}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {/* 聊天气泡 */}
          {char.message && (
            <div className="absolute bottom-full mb-2 w-max max-w-[120px] bg-white text-slate-800 text-[10px] font-bold p-2 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#000] z-20 animate-in fade-in zoom-in duration-200 break-words">
              {char.message}
              {/* 小尾巴 */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-slate-900 rotate-45"></div>
            </div>
          )}

          {/* 角色本体 */}
          <div className="relative group">
            {/* 阴影 */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/20 rounded-[100%] blur-[1px]"></div>
            
            {/* 小人 */}
            <div className={`
              w-10 h-10 bg-white border-2 border-slate-900 rounded-lg flex items-center justify-center text-xl shadow-[2px_2px_0px_#000] relative z-10
              ${char.direction === 'left' ? '-scale-x-100' : ''}
              hover:-translate-y-1 transition-transform cursor-pointer
            `}>
              <div className={char.direction === 'left' ? '-scale-x-100' : ''}>{char.emoji}</div>
            </div>
          </div>
          
          {/* 名字 */}
          <span className="text-[9px] font-black text-white bg-black/50 px-1.5 rounded mt-1 shadow-sm backdrop-blur-sm">
            {char.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActivityDetailView({ activity, onBack, onUpdate, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(activity);
  const [takingOver, setTakingOver] = useState(false);
  const [hasJoined, setHasJoined] = useState(false); // 模拟当前用户是否已报名

  // 1. 处理接管逻辑
  const handleTakeOver = () => {
    setIsEditing(true);
    setEditForm({
      ...activity,
      // 接管时，清空AI的描述，或者保留让用户修改
      description: activity.description + "\n\n(由我接管，期待大家的到来！)"
    });
  };

  // 2. 提交接管表单
  const submitTakeOver = () => {
    setTakingOver(true);
    setTimeout(() => {
      onUpdate({
        ...editForm,
        status: 1, // 变更为真人接管
        creatorType: 'human',
        hostName: user?.uid ? `@${user.uid.slice(0,5)}` : '神秘用户',
        joinedCount: 1 // 接管者默认参加
      });
      setHasJoined(true);
      setIsEditing(false);
      setTakingOver(false);
    }, 1000);
  };

  // 3. 处理报名/取消报名逻辑
  const handleRsvp = () => {
    if (hasJoined) {
      // 取消报名
      setHasJoined(false);
      onUpdate({
        ...activity,
        joinedCount: Math.max(0, (activity.joinedCount || 1) - 1)
      });
    } else {
      // 报名
      setHasJoined(true);
      onUpdate({
        ...activity,
        joinedCount: (activity.joinedCount || 1) + 1
      });
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-bottom duration-300 bg-white text-left z-50 absolute inset-0">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"><X size={20}/></button>
          <span className="font-black text-[12px] uppercase text-slate-800 tracking-[0.1em]">接管并编辑活动</span>
          <div className="w-9"></div> {/* 占位对齐 */}
        </div>
        
        <div className="p-6 space-y-5 flex-1 overflow-y-auto no-scrollbar">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
            <p className="text-xs text-indigo-800 font-bold leading-relaxed">
              🎉 你正在接管由 AI 发起的活动。请确认并完善以下信息，成为本次活动的主理人！
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">活动标题</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-sm"
              value={editForm.title}
              onChange={e => setEditForm({...editForm, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">时间</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-sm text-sm"
                value={editForm.date}
                onChange={e => setEditForm({...editForm, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">地点</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-sm text-sm"
                value={editForm.location}
                onChange={e => setEditForm({...editForm, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">详情描述</label>
            <textarea 
              rows={6}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-sm outline-none resize-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm leading-relaxed"
              value={editForm.description}
              onChange={e => setEditForm({...editForm, description: e.target.value})}
            />
          </div>
        </div>

        <div className="p-6 border-t bg-white sticky bottom-0 z-10">
          <button 
            onClick={submitTakeOver}
            disabled={takingOver}
            className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm tracking-[0.1em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
          >
            {takingOver ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={20}/>} 确认接管并发布
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 bg-white text-left relative">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"><ArrowLeft size={20}/></button>
        <div className="flex flex-col items-center">
          <span className="font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Activity Details</span>
          {activity.status === 0 ? (
            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 rounded-full font-bold">由 {activity.hostName || 'AI 分身'} 发起</span>
          ) : (
            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 rounded-full font-bold">由 {activity.hostName || '真实用户'} 主理</span>
          )}
        </div>
        <button className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"><Info size={20}/></button>
      </div>

      <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-start justify-between gap-4">
           <div className="flex-1">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block shadow-lg shadow-indigo-100">#{activity.category}</span>
              <h2 className="text-2xl font-black text-slate-800 leading-[1.1] break-words m-0">{activity.title}</h2>
           </div>
           <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-3xl flex-shrink-0 flex items-center justify-center text-4xl shadow-sm">
              {activity.category === '桌游' ? '🎲' : activity.category === '二次元' ? '🏮' : '☕'}
           </div>
        </div>

        {/* 替换静态卡片为 2D 像素聊天室 */}
        <PixelChatRoom category={activity.category} />

        <div className="grid grid-cols-2 gap-4">
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar size={18} className="text-indigo-600"/>
              <span className="text-xs font-black text-slate-700">{activity.date || '随时待命'}</span>
           </div>
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <MapPin size={18} className="text-indigo-600"/>
              <span className="text-xs font-black text-slate-700 truncate">{activity.location || "社区中心"}</span>
           </div>
        </div>

        <div className="space-y-3">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">活动背景</h4>
           <div className="bg-slate-50/50 p-5 rounded-[28px] border border-slate-100 leading-relaxed shadow-inner">
              <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{activity.description}</p>
           </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-4 px-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">已准备的分身 ({activity.joinedCount || 1}/{activity.maxParticipants || 12})</h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">活跃</span>
           </div>
           <div className="flex gap-5 overflow-x-auto pb-6 pt-2 no-scrollbar px-1">
              <PixelAvatar emoji="🤖" name="我的分身" />
              <PixelAvatar emoji="🦊" name="小李代理" />
              <PixelAvatar emoji="🐱" name="王姨的分身" />
              <PixelAvatar emoji="🦁" name="开发者分身" />
              <PixelAvatar emoji="🐷" name="产品分身" />
           </div>
        </div>
      </div>

      <div className="p-6 border-t bg-white sticky bottom-0 z-10">
        {activity.status === 0 ? (
          <button 
            onClick={handleTakeOver}
            className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm tracking-[0.1em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700 cursor-pointer"
          >
            <Zap size={20} fill="currentColor"/> 立即接管此活动
          </button>
        ) : (
          <button 
            onClick={handleRsvp}
            className={`w-full py-5 rounded-[24px] font-black text-sm tracking-[0.1em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer ${
              hasJoined 
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {hasJoined ? (
              <>已报名 (点击取消)</>
            ) : (
              <><Heart size={20} className="text-red-500" fill="currentColor"/> 报名参加</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
