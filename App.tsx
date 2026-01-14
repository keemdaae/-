
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 50px Outer Margin Wrapper */}
      <div className="flex-grow p-[50px] flex flex-col">
        <header className="flex justify-between items-center mb-12">
          <Link to="/" className="text-2xl font-extrabold tracking-widest hover:opacity-70 transition-opacity">
            DAAEKEEM
          </Link>
          <nav className="flex items-center space-x-8 text-sm font-medium">
            <Link to="/" className={`hover:opacity-100 transition-opacity ${location.pathname === '/' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Home</Link>
            <Link to="/about" className={`hover:opacity-100 transition-opacity ${location.pathname === '/about' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>About</Link>
            <Link to="/contact" className={`hover:opacity-100 transition-opacity ${location.pathname === '/contact' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Contact</Link>
            <Link to="/admin" className="opacity-40 hover:opacity-100 transition-opacity">
              <Icons.Admin />
            </Link>
          </nav>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="mt-20 pt-10 border-t border-white/10 flex justify-between items-center text-xs opacity-50">
          <div>© {new Date().getFullYear()} Daaekeem. All rights reserved.</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:opacity-100"><Icons.Instagram /></a>
            <a href="#" className="hover:opacity-100"><Icons.LinkedIn /></a>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('daeekeem_data');
    if (saved) return JSON.parse(saved);
    return { projects: INITIAL_PROJECTS, profile: INITIAL_PROFILE };
  });

  const updateData = (newData: AppData) => {
    try {
      const dataString = JSON.stringify(newData);
      localStorage.setItem('daeekeem_data', dataString);
      setData(newData);
    } catch (e) {
      console.error("Storage error:", e);
      alert("Storage failed: The file might be too large for the browser's memory. Please try using a smaller video file or a direct URL link instead.");
    }
  };

  return (
    <AppContext.Provider value={{ data, updateData }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
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
