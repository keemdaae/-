import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Project, Profile, AppData } from './types';
import { INITIAL_PROJECTS, INITIAL_PROFILE, Icons } from './constants';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import ProjectDetail from './pages/ProjectDetail';

const DB_NAME = 'DaeekeemPortfolioDB';
const STORE_NAME = 'appData';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToDB = async (data: AppData) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, 'mainData');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const loadFromDB = async (): Promise<AppData | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('mainData');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return null;
  }
};

const AppContext = createContext<{
  data: AppData;
  updateData: (newData: AppData) => void;
} | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { data } = useApp();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow p-6 md:p-[50px] flex flex-col">
        <header className="flex justify-between items-center mb-12 animate-fade-in">
          <Link to="/" className="text-2xl font-extrabold tracking-widest hover:opacity-70 transition-opacity">
            DAAEKEEM
          </Link>
          <nav className="flex items-center space-x-6 md:space-x-8 text-sm font-medium">
            <Link to="/portfolio" className={`hover:opacity-100 transition-opacity ${location.pathname.startsWith('/portfolio') ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Work</Link>
            <Link to="/about" className={`hover:opacity-100 transition-opacity ${location.pathname === '/about' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>About</Link>
            <Link to="/contact" className={`hover:opacity-100 transition-opacity ${location.pathname === '/contact' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Contact</Link>
            <Link to="/admin" className="opacity-40 hover:opacity-100 transition-opacity">
              <Icons.Admin />
            </Link>
          </nav>
        </header>

        <main className="flex-grow animate-fade-in" key={location.pathname}>
          {children}
        </main>

        <footer className="mt-20 pt-10 border-t border-white/10 flex justify-between items-center text-xs opacity-50">
          <div>© {new Date().getFullYear()} DAAEKEEM. All rights reserved.</div>
          <div className="flex space-x-4">
            <a href={data.profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" aria-label="Instagram"><Icons.Instagram /></a>
            <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity" aria-label="LinkedIn"><Icons.LinkedIn /></a>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ projects: INITIAL_PROJECTS, profile: INITIAL_PROFILE });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1. Cloud Database 우선 조회 (Netlify Functions 사용)
        try {
          const response = await fetch('/.netlify/functions/get-data');
          if (response.ok) {
            const cloudData = await response.json();
            if (cloudData) {
              setData(cloudData);
              await saveToDB(cloudData); // 로컬 캐시 업데이트
              setIsReady(true);
              return;
            }
          }
        } catch (e) {
          console.warn("Cloud DB fetch failed, falling back to local.", e);
        }

        // 2. Cloud 실패 시 로컬 브라우저 데이터 조회
        const storedData = await loadFromDB();
        
        // 3. 둘 다 없으면 기본 파일 조회
        let globalData: AppData | null = null;
        try {
          const response = await fetch(`./data.json?t=${Date.now()}`);
          if (response.ok) {
            globalData = await response.json();
          }
        } catch (e) { /* ignore */ }

        if (storedData) {
          setData(storedData);
        } else if (globalData) {
          setData(globalData);
          await saveToDB(globalData);
        } else {
          setData({ projects: INITIAL_PROJECTS, profile: INITIAL_PROFILE });
        }
      } catch (e) {
        console.error("Initialization error", e);
      } finally {
        setIsReady(true);
      }
    };
    loadInitialData();
  }, []);

  const updateData = async (newData: AppData) => {
    setData(newData);
    
    // 1. 로컬 저장
    await saveToDB(newData);
    
    // 2. 클라우드 저장 (백그라운드 동기화)
    try {
      await fetch('/.netlify/functions/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      console.log("Cloud Database Sync Success");
    } catch (e) {
      console.error("Cloud Database Sync Failed", e);
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[10px] uppercase tracking-[0.5em] opacity-20">DAAEKEEM Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ data, updateData }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;