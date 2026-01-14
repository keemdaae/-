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
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const processImage = (file: File, maxDim: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = (event.target ? event.target.result : '') as string;
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
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressed = await processImage(file, 1600, 0.85);
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
        // 갤러리 이미지는 원본에 가까운 고해상도(2500px) 유지
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
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressed = await processImage(file, 800, 0.8);
        setProfileImagePreview(compressed);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressed = await processImage(file, 2000, 0.8);
        setHeroImagePreview(compressed);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateData({
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
    alert('프로필이 저장되었습니다.');
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
    const offset = projectFormRef.current ? projectFormRef.current.offsetTop : 0;
    window.scrollTo({ top: offset - 100, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setProjectImagePreview(null);
    setGalleryImagePreviews([]);
    if (projectFormRef.current) projectFormRef.current.reset();
  };

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessingImage) return;
    const formData = new FormData(e.currentTarget);
    const finalImageUrl = projectImagePreview;
    if (!finalImageUrl) return alert('Main image required');
    
    setIsSaving(true);
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
      
    await updateData({ ...data, projects: newProjects });
    setIsSaving(false);
    alert('프로젝트가 저장되었습니다.');
    cancelEditing();
  };

  const deleteProject = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
    }
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    const newProjects = [...data.projects];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < newProjects.length) {
      const temp = newProjects[index];
      newProjects[index] = newProjects[target];
      newProjects[target] = temp;
      await updateData({ ...data, projects: newProjects });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'data.json');
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target ? (event.target.result as string) : '') as AppData;
          updateData(imported);
          alert('데이터 복원이 완료되었습니다.');
          window.location.reload();
        } catch (err) { alert('파일 오류'); }
      };
      reader.readAsText(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Admin Access</h1>
        <form onSubmit={handleLogin} className="w-full max-sm px-4 space-y-4">
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
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <p className="text-[10px] uppercase tracking-widest">Cloud Database Active</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportData} className="text-[9px] uppercase tracking-widest bg-white/10 px-4 py-2 rounded border border-white/10">Backup JSON</button>
          <input type="file" ref={importFileRef} accept=".json" onChange={handleImportData} className="hidden" />
          <button onClick={() => importFileRef.current ? importFileRef.current.click() : null} className="text-[9px] uppercase tracking-widest bg-white/10 px-4 py-2 rounded border border-white/10">Restore JSON</button>
          <button onClick={() => setIsAuthenticated(false)} className="text-[9px] uppercase tracking-widest opacity-40 px-4 py-2">Logout</button>
        </div>
      </div>

      {isProcessingImage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-2xl">Processing Image...</div>
      )}

      {/* Profile Section */}
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
              <label htmlFor="p-up" className="block text-center border border-white/20 py-3 text-[10px] uppercase cursor-pointer hover:bg-white hover:text-black transition-all">Change Profile</label>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest opacity-40">Hero Background</label>
              <div className="aspect-[4/3] bg-white/5 border border-white/10 overflow-hidden">
                {heroImagePreview && <img src={heroImagePreview} className="w-full h-full object-cover" />}
              </div>
              <input type="file" accept="image/*" onChange={handleHeroFileChange} className="hidden" id="h-up" />
              <label htmlFor="h-up" className="block text-center border border-white/20 py-3 text-[10px] uppercase cursor-pointer hover:bg-white hover:text-black transition-all">Change Hero</label>
            </div>
          </div>
          <textarea name="bio" rows={4} defaultValue={data.profile.bio} placeholder="Bio" className="w-full bg-white/5 border border-white/10 p-4 outline-none resize-none" />
          <textarea name="creativeApproach" rows={6} defaultValue={data.profile.creativeApproach} placeholder="Creative Approach" className="w-full bg-white/5 border border-white/10 p-4 outline-none resize-none" />
          <button type="submit" disabled={isSaving} className="bg-white text-black py-4 px-12 font-bold uppercase text-[10px] tracking-widest hover:bg-white/90">{isSaving ? 'Saving...' : 'Save Settings'}</button>
        </form>
      </section>

      {/* Project Library Section */}
      <section className="space-y-8 pt-12 border-t border-white/10">
        <h2 className="text-2xl font-bold tracking-tight">Project Library</h2>
        <form ref={projectFormRef} onSubmit={handleSaveProject} className="p-6 bg-white/5 border border-white/10 space-y-6">
          <h3 className="text-xs font-bold uppercase opacity-50">{editingProjectId ? 'Edit Project' : 'New Project'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="aspect-square bg-black border border-white/10 overflow-hidden">
                {projectImagePreview && <img src={projectImagePreview} className="w-full h-full object-cover" />}
              </div>
              <input type="file" accept="image/*" onChange={handleProjectFileChange} className="hidden" id="pr-up" />
              <label htmlFor="pr-up" className="block text-center border border-white/20 py-2 text-[10px] uppercase cursor-pointer">Main Image</label>
            </div>
            <div className="md:col-span-2 space-y-4">
              <input name="title" required placeholder="Project Title" className="w-full bg-black border border-white/10 p-3 outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input name="category" placeholder="Category" className="bg-black border border-white/10 p-3 outline-none" />
                <input name="year" placeholder="Year" className="bg-black border border-white/10 p-3 outline-none" />
              </div>
              {/* RESTORED: Client & Tools/Tech Fields */}
              <div className="grid grid-cols-2 gap-2">
                <input name="client" placeholder="Client" className="bg-black border border-white/10 p-3 outline-none" />
                <input name="tools" placeholder="Tools / Tech" className="bg-black border border-white/10 p-3 outline-none" />
              </div>
              <input name="videoUrl" placeholder="Video URL (YouTube/Vimeo)" className="w-full bg-black border border-white/10 p-3 outline-none" />
              <textarea name="description" rows={2} placeholder="Description" className="w-full bg-black border border-white/10 p-3 outline-none resize-none" />
              
              {/* RESTORED: Gallery Upload UI */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 block">Gallery Images (Slide Show)</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {galleryImagePreviews.map((img, i) => (
                    <div key={i} className="relative aspect-square border border-white/10 bg-white/5">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none">×</button>
                    </div>
                  ))}
                  <label htmlFor="gal-up" className="aspect-square border border-white/20 border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5 text-xl opacity-30">+</label>
                  <input type="file" multiple accept="image/*" onChange={handleGalleryFilesChange} id="gal-up" className="hidden" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSaving} className="flex-grow bg-white text-black py-3 font-bold uppercase text-[10px] tracking-widest">{isSaving ? 'Saving...' : 'Submit Project'}</button>
            {editingProjectId && <button type="button" onClick={cancelEditing} className="px-6 border border-white/20 uppercase text-[10px]">Cancel</button>}
          </div>
        </form>

        <div className="space-y-1">
          {data.projects.map((p, idx) => (
            <div key={p.id} className="group flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
              <div className="flex items-center space-x-4">
                <img src={p.imageUrl} className="w-10 h-10 object-cover grayscale group-hover:grayscale-0" alt="" />
                <div>
                  <p className="font-bold text-xs">{p.title}</p>
                  <p className="text-[9px] uppercase opacity-30">{p.category} — {p.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-1">
                  <button onClick={() => moveProject(idx, 'up')} className="opacity-20 hover:opacity-100 transition-opacity disabled:opacity-0" disabled={idx === 0}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg></button>
                  <button onClick={() => moveProject(idx, 'down')} className="opacity-20 hover:opacity-100 transition-opacity disabled:opacity-0" disabled={idx === data.projects.length - 1}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg></button>
                </div>
                <button onClick={() => startEditing(p)} className="p-2 opacity-20 hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => deleteProject(p.id)} className="p-2 opacity-20 hover:text-red-500 hover:opacity-100 transition-opacity"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;