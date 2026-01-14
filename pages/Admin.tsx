import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Project, AppData } from '../types';

const Admin: React.FC = () => {
  const { data, updateData } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncString, setSyncString] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // States for Previews
  const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(data.profile.profileImageUrl);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(data.profile.heroImageUrl);
  
  // State for Editing
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const projectFileRef = useRef<HTMLInputElement>(null);
  const galleryFilesRef = useRef<HTMLInputElement>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const projectFormRef = useRef<HTMLFormElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileImagePreview(data.profile.profileImageUrl);
    setHeroImagePreview(data.profile.heroImageUrl);
  }, [data]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '870602') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const processImage = (file: File, maxDim: number = 2500, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleProjectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressed = await processImage(file, 2000, 0.9);
        setProjectImagePreview(compressed);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsProcessingImage(true);
      try {
        const processed = await Promise.all(
          (Array.from(files) as File[]).map(file => processImage(file, 2500, 0.9))
        );
        setGalleryImagePreviews(prev => [...prev, ...processed]);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressed = await processImage(file, 1200, 0.9);
        setProfileImagePreview(compressed);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressed = await processImage(file, 3000, 0.9);
        setHeroImagePreview(compressed);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    setTimeout(() => {
      updateData({
        ...data,
        profile: {
          ...data.profile,
          name: formData.get('name') as string,
          title: formData.get('title') as string,
          heroDescription: formData.get('heroDescription') as string,
          bio: formData.get('bio') as string,
          creativeApproach: formData.get('creativeApproach') as string,
          email: formData.get('email') as string,
          profileImageUrl: profileImagePreview || data.profile.profileImageUrl,
          heroImageUrl: heroImagePreview || data.profile.heroImageUrl
        }
      });
      setIsSaving(false);
      alert('Profile updated on this device.');
    }, 100);
  };

  const startEditing = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectImagePreview(project.imageUrl);
    setGalleryImagePreviews(project.galleryImages || []);
    if (projectFormRef.current) {
      const form = projectFormRef.current;
      const setField = (name: string, val: string) => {
        const el = form.elements.namedItem(name);
        if (el && 'value' in el) (el as any).value = val || '';
      };
      setField('title', project.title);
      setField('category', project.category);
      setField('year', project.year);
      setField('videoUrl', project.videoUrl || '');
      setField('description', project.description || '');
      setField('client', project.client || '');
      setField('tools', project.tools || '');
    }
    window.scrollTo({ top: (projectFormRef.current?.offsetTop || 0) - 100, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setProjectImagePreview(null);
    setGalleryImagePreviews([]);
    projectFormRef.current?.reset();
  };

  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessingImage) return;
    const formData = new FormData(e.currentTarget);
    const finalImageUrl = projectImagePreview;
    if (!finalImageUrl) return alert('Main image required');
    
    const projectData: Project = {
      id: editingProjectId || `project-${Date.now()}`,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      year: formData.get('year') as string,
      imageUrl: finalImageUrl,
      videoUrl: formData.get('videoUrl') as string,
      galleryImages: galleryImagePreviews,
      description: formData.get('description') as string,
      client: formData.get('client') as string,
      tools: formData.get('tools') as string
    };
    
    const newProjects = editingProjectId 
      ? data.projects.map(p => p.id === editingProjectId ? projectData : p)
      : [projectData, ...data.projects];
      
    updateData({ ...data, projects: newProjects });
    alert(editingProjectId ? 'Project updated!' : 'Project added!');
    cancelEditing();
  };

  const deleteProject = (id: string) => {
    if (window.confirm('Delete project?')) {
      updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
    }
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...data.projects];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < newProjects.length) {
      const temp = newProjects[index];
      newProjects[index] = newProjects[target];
      newProjects[target] = temp;
      updateData({ ...data, projects: newProjects });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `portfolio_data.json`);
    link.click();
  };

  const handleCopySyncString = () => {
    const dataStr = JSON.stringify(data);
    navigator.clipboard.writeText(dataStr).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleSyncFromString = () => {
    if (!syncString) return;
    try {
      const imported = JSON.parse(syncString) as AppData;
      if (imported.projects && imported.profile) {
        if (window.confirm('모바일의 기존 데이터를 PC에서 복사한 데이터로 덮어씌우시겠습니까?')) {
          updateData(imported);
          alert('Sync Complete! The page will reload.');
          window.location.reload();
        }
      } else {
        alert('Invalid format.');
      }
    } catch (e) {
      alert('Error parsing data. Please copy the text again.');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as AppData;
          updateData(imported);
          alert('Data loaded! Page will reload.');
          window.location.reload();
        } catch (err) { alert('Parse error'); }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Factory Reset? All local changes will be lost.')) {
      indexedDB.deleteDatabase('DaeekeemPortfolioDB');
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Admin Access</h1>
        <form onSubmit={handleLogin} className="w-full max-sm space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." className="w-full bg-white/5 border border-white/20 p-4 outline-none" />
          <button type="submit" className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter">Admin Panel</h1>
          <div className="flex items-center space-x-2 mt-2 opacity-50">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
             <p className="text-[10px] uppercase tracking-widest">Local-Sync Mode Active</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportData} className="text-[9px] uppercase tracking-widest bg-white/10 px-4 py-2 rounded border border-white/10">Download JSON</button>
          <input type="file" ref={importFileRef} accept=".json" onChange={handleImportData} className="hidden" />
          <button onClick={() => importFileRef.current?.click()} className="text-[9px] uppercase tracking-widest bg-white/10 px-4 py-2 rounded border border-white/10">Upload JSON</button>
          <button onClick={handleResetData} className="text-[9px] uppercase tracking-widest text-red-500 px-4 py-2 rounded border border-red-500/10">Factory Reset</button>
          <button onClick={() => setIsAuthenticated(false)} className="text-[9px] uppercase tracking-widest opacity-40 px-4 py-2">Logout</button>
        </div>
      </div>

      {/* SYNC TOOLBOX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Step 1: PC에서 할 일</h2>
          <p className="text-[10px] opacity-60 leading-relaxed uppercase tracking-widest">
            PC에서 편집을 마친 후 아래 버튼을 눌러 전체 데이터를 텍스트로 복사하세요. 그 다음 카톡 등으로 자신에게 보내세요.
          </p>
          <button onClick={handleCopySyncString} className={`w-full py-4 rounded text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}>
            {copyFeedback ? 'Copied Success!' : 'Copy Full Data String'}
          </button>
        </section>

        <section className="p-6 bg-white/[0.03] border border-white/10 rounded-lg space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Step 2: 모바일에서 할 일</h2>
          <p className="text-[10px] opacity-60 leading-relaxed uppercase tracking-widest">
            전달받은 텍스트를 복사해 아래에 붙여넣고 동기화 버튼을 누르세요. 모바일에도 수정한 내용이 즉시 적용됩니다.
          </p>
          <div className="flex flex-col gap-2">
            <input type="text" value={syncString} onChange={(e) => setSyncString(e.target.value)} placeholder="Paste string here..." className="w-full bg-black border border-white/10 p-3 text-[10px] outline-none" />
            <button onClick={handleSyncFromString} className="w-full bg-white/10 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/20">Sync Now</button>
          </div>
        </section>
      </div>

      <section className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
         <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500 mb-2">Notice: Global Deploy</h2>
         <p className="text-[9px] opacity-50 uppercase tracking-widest leading-relaxed">
            위의 수동 동기화는 나만 볼 때 유용합니다. 전 세계 모든 방문자에게 내가 수정한 데이터를 보여주려면 [Download JSON] 버튼으로 파일을 받은 뒤 이름을 data.json으로 바꿔서 Netlify 폴더에 넣고 다시 배포(Deploy)해야 합니다.
         </p>
      </section>

      {isProcessingImage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-2xl">Processing...</div>
      )}

      {/* FORM SECTIONS */}
      <section className="space-y-12">
        <h2 className="text-2xl font-bold tracking-tight border-b border-white/5 pb-4">Profile & Branding</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="name" required defaultValue={data.profile.name} placeholder="Name" className="bg-white/5 border border-white/10 p-4 outline-none" />
            <input name="title" required defaultValue={data.profile.title} placeholder="Title" className="bg-white/5 border border-white/10 p-4 outline-none" />
          </div>
          <input name="heroDescription" defaultValue={data.profile.heroDescription} placeholder="Hero Tagline" className="w-full bg-white/5 border border-white/10 p-4 outline-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest opacity-40">Profile Image</label>
              <div className="aspect-[4/3] bg-white/5 border border-white/10 overflow-hidden">
                {profileImagePreview && <img src={profileImagePreview} className="w-full h-full object-cover" />}
              </div>
              <input type="file" accept="image/*" onChange={handleProfileFileChange} className="hidden" id="p-up" />
              <label htmlFor="p-up" className="block text-center border border-white/20 py-3 text-[10px] uppercase cursor-pointer hover:bg-white hover:text-black">Change</label>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest opacity-40">Hero Background</label>
              <div className="aspect-[4/3] bg-white/5 border border-white/10 overflow-hidden">
                {heroImagePreview && <img src={heroImagePreview} className="w-full h-full object-cover" />}
              </div>
              <input type="file" accept="image/*" onChange={handleHeroFileChange} className="hidden" id="h-up" />
              <label htmlFor="h-up" className="block text-center border border-white/20 py-3 text-[10px] uppercase cursor-pointer hover:bg-white hover:text-black">Change</label>
            </div>
          </div>
          <textarea name="bio" rows={4} defaultValue={data.profile.bio} placeholder="Bio" className="w-full bg-white/5 border border-white/10 p-4 outline-none resize-none" />
          <textarea name="creativeApproach" rows={6} defaultValue={data.profile.creativeApproach} placeholder="Approach" className="w-full bg-white/5 border border-white/10 p-4 outline-none resize-none" />
          <button type="submit" disabled={isSaving} className="bg-white text-black py-4 px-12 font-bold uppercase text-[10px] tracking-widest hover:bg-white/90">Save Settings</button>
        </form>
      </section>

      <section className="space-y-8 pt-12 border-t border-white/10">
        <h2 className="text-2xl font-bold tracking-tight">Project Library</h2>
        <form ref={projectFormRef} onSubmit={handleSaveProject} className="p-6 bg-white/5 border border-white/10 space-y-6">
          <h3 className="text-xs font-bold uppercase opacity-50">{editingProjectId ? 'Edit Mode' : 'New Project'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="aspect-square bg-black border border-white/10 overflow-hidden">
                {projectImagePreview && <img src={projectImagePreview} className="w-full h-full object-cover" />}
              </div>
              <input type="file" accept="image/*" onChange={handleProjectFileChange} className="hidden" id="pr-up" />
              <label htmlFor="pr-up" className="block text-center border border-white/20 py-2 text-[10px] uppercase cursor-pointer">Main Image</label>
            </div>
            <div className="md:col-span-2 space-y-4">
              <input name="title" required placeholder="Title" className="w-full bg-black border border-white/10 p-3" />
              <div className="grid grid-cols-2 gap-2">
                <input name="category" placeholder="Category" className="bg-black border border-white/10 p-3" />
                <input name="year" placeholder="Year" className="bg-black border border-white/10 p-3" />
              </div>
              <input name="videoUrl" placeholder="Video URL" className="w-full bg-black border border-white/10 p-3" />
              <textarea name="description" rows={2} placeholder="Brief" className="w-full bg-black border border-white/10 p-3" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-grow bg-white text-black py-3 font-bold uppercase text-[10px] tracking-widest">Submit</button>
            {editingProjectId && <button type="button" onClick={cancelEditing} className="px-6 border border-white/20 uppercase text-[10px]">Cancel</button>}
          </div>
        </form>

        <div className="space-y-1">
          {data.projects.map((p, idx) => (
            <div key={p.id} className="group flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
              <div className="flex items-center space-x-4">
                <img src={p.imageUrl} className="w-10 h-10 object-cover grayscale group-hover:grayscale-0" />
                <div>
                  <p className="font-bold text-xs">{p.title}</p>
                  <p className="text-[9px] uppercase opacity-30">{p.category} — {p.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-1">
                  <button onClick={() => moveProject(idx, 'up')} className="opacity-20 hover:opacity-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg></button>
                  <button onClick={() => moveProject(idx, 'down')} className="opacity-20 hover:opacity-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg></button>
                </div>
                <button onClick={() => startEditing(p)} className="p-2 opacity-20 hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => deleteProject(p.id)} className="p-2 opacity-20 hover:text-red-500 hover:opacity-100"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;