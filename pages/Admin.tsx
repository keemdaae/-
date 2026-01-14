import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Project, AppData } from '../types';

const Admin: React.FC = () => {
  const { data, updateData } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncString, setSyncString] = useState('');
  
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

  // Sync previews when data changes
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
      } catch (err) {
        console.error("Image processing failed", err);
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
      } catch (err) {
        console.error("Gallery processing failed", err);
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
      try {
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
        alert('Site configuration saved!');
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
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
    const offset = projectFormRef.current?.offsetTop;
    if (offset) {
      window.scrollTo({ top: offset - 100, behavior: 'smooth' });
    }
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
    if (!finalImageUrl) {
      alert('Please provide a project image.');
      return;
    }
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
    if (window.confirm('Delete this project?')) {
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
    link.setAttribute('download', `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const handleCopySyncString = () => {
    const dataStr = JSON.stringify(data);
    navigator.clipboard.writeText(dataStr);
    alert('Full data string copied to clipboard!');
  };

  const handleSyncFromString = () => {
    if (!syncString) return;
    try {
      const imported = JSON.parse(syncString) as AppData;
      if (imported.projects && imported.profile) {
        if (window.confirm('This will overwrite current device data. Proceed?')) {
          updateData(imported);
          alert('Sync successful! Refreshing...');
          window.location.reload();
        }
      } else {
        alert('Invalid format.');
      }
    } catch (e) {
      alert('Failed to parse text.');
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
          alert('Data imported!');
          window.location.reload();
        } catch (err) {
          alert('Failed to parse file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset ALL data?')) {
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
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full bg-white/5 border border-white/20 p-4 focus:outline-none focus:border-white transition-all"
          />
          <button type="submit" className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-20 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-4">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter">Admin Panel</h1>
          <p className="text-xs opacity-50 mt-2 uppercase tracking-widest italic">Local Storage Mode Active</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleExportData} className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/10">Backup File</button>
          <input type="file" ref={importFileRef} accept=".json" onChange={handleImportData} className="hidden" />
          <button type="button" onClick={() => importFileRef.current?.click()} className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/10">Load File</button>
          <button type="button" onClick={handleResetData} className="text-[10px] uppercase tracking-widest text-red-500 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full border border-red-500/10">Reset</button>
          <button type="button" onClick={() => setIsAuthenticated(false)} className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 border border-white/20 px-4 py-2 rounded-full">Logout</button>
        </div>
      </div>

      {/* Global Sync Status Explanation */}
      <section className="p-6 bg-blue-500/5 border border-blue-500/20 space-y-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <h2 className="text-sm font-bold uppercase tracking-widest">Global Sync Guide (PC &harr; Mobile)</h2>
        </div>
        <div className="text-[10px] opacity-60 uppercase tracking-widest leading-relaxed space-y-2">
          <p>Neon DB가 연결되어 있지만, 현재 앱은 보안상의 이유로 데이터를 <strong>브라우저 내부</strong>에만 저장합니다.</p>
          <p className="text-white">모바일에서도 동일한 내용을 보이게 하려면:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>위의 <strong>[Backup File]</strong>을 클릭해 데이터를 다운로드합니다.</li>
            <li>파일 이름을 <strong>data.json</strong>으로 변경합니다.</li>
            <li>Netlify 프로젝트 폴더 루트에 넣고 <strong>다시 배포(Deploy)</strong>합니다.</li>
            <li>이제 모든 기기에서 이 내용이 기본값으로 노출됩니다.</li>
          </ol>
        </div>
      </section>

      {/* Manual Sync Tool */}
      <section className="p-6 bg-white/[0.03] border border-white/10 space-y-4 rounded-lg">
        <h2 className="text-sm font-bold uppercase tracking-widest">Manual Data Sync (Clipboard)</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={handleCopySyncString} className="flex-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest py-3 rounded hover:bg-white/90">Copy All to Clipboard</button>
          <div className="flex-[2] flex gap-2">
            <input type="text" placeholder="Paste sync string here..." value={syncString} onChange={(e) => setSyncString(e.target.value)} className="flex-grow bg-black border border-white/10 px-4 text-[10px] outline-none" />
            <button onClick={handleSyncFromString} className="bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase px-4 border border-white/10">Sync</button>
          </div>
        </div>
      </section>

      {isProcessingImage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-2xl">
          Processing Image...
        </div>
      )}

      {/* Site Config Form */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Site Configuration</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Display Name</label>
              <input name="name" required defaultValue={data.profile.name} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Professional Title</label>
              <input name="title" required defaultValue={data.profile.title} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Hero Description</label>
            <input name="heroDescription" required defaultValue={data.profile.heroDescription} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Email</label>
              <input name="email" required defaultValue={data.profile.email} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Profile Image</label>
              <div className="aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                {profileImagePreview ? <img src={profileImagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20">No Image</div>}
              </div>
              <input type="file" ref={profileFileRef} accept="image/*" onChange={handleProfileFileChange} className="hidden" id="profile-upload" />
              <label htmlFor="profile-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase hover:bg-white hover:text-black">Upload Profile</label>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Hero Image</label>
              <div className="aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                {heroImagePreview ? <img src={heroImagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20">No Image</div>}
              </div>
              <input type="file" ref={heroFileRef} accept="image/*" onChange={handleHeroFileChange} className="hidden" id="hero-upload" />
              <label htmlFor="hero-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase hover:bg-white hover:text-black">Upload Hero</label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Biography</label>
            <textarea name="bio" rows={5} defaultValue={data.profile.bio} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Creative Approach</label>
            <textarea name="creativeApproach" rows={8} defaultValue={data.profile.creativeApproach} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 resize-none" />
          </div>
          <button type="submit" disabled={isSaving || isProcessingImage} className="bg-white text-black py-4 px-12 font-bold uppercase text-xs tracking-widest hover:bg-white/90 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Site Settings'}
          </button>
        </form>
      </section>

      {/* Project Management */}
      <section className="space-y-8 pt-20 border-t border-white/10">
        <h2 className="text-2xl font-bold tracking-tight">Manage Projects</h2>
        <form ref={projectFormRef} onSubmit={handleSaveProject} className={`p-8 bg-white/5 border ${editingProjectId ? 'border-white/40' : 'border-white/10'} space-y-8`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
            {editingProjectId && <button type="button" onClick={cancelEditing} className="text-[10px] uppercase opacity-50 underline">Cancel</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="aspect-square bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                {projectImagePreview ? <img src={projectImagePreview} className="w-full h-full object-cover" /> : <Icons.Admin />}
              </div>
              <input type="file" ref={projectFileRef} accept="image/*" onChange={handleProjectFileChange} className="hidden" id="project-upload" />
              <label htmlFor="project-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase hover:bg-white hover:text-black">Thumbnail</label>
              
              <input type="file" ref={galleryFilesRef} accept="image/*" multiple onChange={handleGalleryFilesChange} className="hidden" id="gallery-upload" />
              <label htmlFor="gallery-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase hover:bg-white hover:text-black">Add Gallery</label>
              <div className="grid grid-cols-3 gap-2">
                {galleryImagePreviews.map((img, i) => (
                  <div key={i} className="relative aspect-square border border-white/10 group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l18 18" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <input name="title" required placeholder="Project Title" className="w-full bg-black border border-white/10 p-4 outline-none focus:border-white/40" />
              <div className="grid grid-cols-2 gap-4">
                <input name="category" required placeholder="Category" className="w-full bg-black border border-white/10 p-4 outline-none" />
                <input name="year" required placeholder="Year" className="w-full bg-black border border-white/10 p-4 outline-none" />
              </div>
              <input name="videoUrl" placeholder="Video URL" className="w-full bg-black border border-white/10 p-4 outline-none" />
              <textarea name="description" rows={3} placeholder="Description" className="w-full bg-black border border-white/10 p-4 outline-none resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <input name="client" placeholder="Client" className="w-full bg-black border border-white/10 p-4 outline-none" />
                <input name="tools" placeholder="Tools" className="w-full bg-black border border-white/10 p-4 outline-none" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isProcessingImage} className="w-full border border-white/40 py-4 uppercase text-xs font-bold tracking-widest hover:bg-white hover:text-black">
            {editingProjectId ? 'Update Project' : 'Add Project'}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-1">
          {data.projects.map((p, idx) => (
            <div key={p.id} className="group flex items-center justify-between p-4 bg-white/5 border border-transparent hover:border-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 border border-white/10 overflow-hidden grayscale group-hover:grayscale-0">
                  <img src={p.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm">{p.title}</p>
                  <p className="text-[9px] uppercase opacity-40">{p.category} — {p.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-1 mr-4">
                  <button type="button" disabled={idx === 0} onClick={() => moveProject(idx, 'up')} className="opacity-40 hover:opacity-100 disabled:opacity-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg></button>
                  <button type="button" disabled={idx === data.projects.length - 1} onClick={() => moveProject(idx, 'down')} className="opacity-40 hover:opacity-100 disabled:opacity-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg></button>
                </div>
                <button type="button" onClick={() => startEditing(p)} className="p-2 text-white/20 hover:text-white hover:bg-white/10 rounded-full transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button type="button" onClick={() => deleteProject(p.id)} className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;