
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Project, AppData } from '../types';

const Admin: React.FC = () => {
  const { data, updateData } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  const processImage = (file: File, maxDim: number = 1600): Promise<string> => {
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
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
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
        const compressed = await processImage(file, 1200);
        setProjectImagePreview(compressed);
        if (projectFormRef.current) {
          const imgUrlInput = projectFormRef.current.elements.namedItem('imageUrl') as HTMLInputElement;
          if (imgUrlInput) imgUrlInput.value = '';
        }
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
          (Array.from(files) as File[]).map(file => processImage(file, 1000))
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
        const compressed = await processImage(file, 800);
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
        const compressed = await processImage(file, 1600);
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
            bio: formData.get('bio') as string,
            email: formData.get('email') as string,
            profileImageUrl: profileImagePreview || (formData.get('profileImageUrl') as string),
            heroImageUrl: heroImagePreview || (formData.get('heroImageUrl') as string),
          }
        });
        alert('Site configuration saved to local storage!');
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
      const setFieldValue = (name: string, value: string) => {
        const element = form.elements.namedItem(name);
        if (element && 'value' in element) {
          (element as HTMLInputElement | HTMLTextAreaElement).value = value || '';
        }
      };

      setFieldValue('title', project.title);
      setFieldValue('category', project.category);
      setFieldValue('year', project.year);
      setFieldValue('imageUrl', project.imageUrl);
      setFieldValue('videoUrl', project.videoUrl || '');
      setFieldValue('description', project.description || '');
      setFieldValue('client', project.client || '');
      setFieldValue('tools', project.tools || '');
    }
    window.scrollTo({ top: projectFormRef.current ? projectFormRef.current.offsetTop - 100 : 0, behavior: 'smooth' });
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
    const urlOverride = formData.get('imageUrl') as string;
    const finalImageUrl = urlOverride || projectImagePreview;

    if (!finalImageUrl) {
      alert('Please provide a project image.');
      return;
    }

    let videoUrl = formData.get('videoUrl') as string;
    // Auto-extract from iframe if user pastes full embed code
    if (videoUrl.includes('<iframe')) {
      const srcMatch = videoUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch) videoUrl = srcMatch[1];
    }

    const projectData: Project = {
      id: editingProjectId || `project-${Date.now()}`,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      year: formData.get('year') as string,
      imageUrl: finalImageUrl,
      videoUrl: videoUrl,
      galleryImages: galleryImagePreviews,
      description: formData.get('description') as string,
      client: formData.get('client') as string,
      tools: formData.get('tools') as string,
    };

    let newProjects;
    if (editingProjectId) {
      newProjects = data.projects.map(p => p.id === editingProjectId ? projectData : p);
    } else {
      newProjects = [projectData, ...data.projects];
    }

    try {
      updateData({ ...data, projects: newProjects });
      alert(editingProjectId ? 'Project updated!' : 'New project added!');
      cancelEditing();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
      if (editingProjectId === id) cancelEditing();
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `daeekeem_portfolio_data_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as AppData;
          if (imported.projects && imported.profile) {
            updateData(imported);
            alert('Data imported and saved successfully!');
            window.location.reload();
          } else {
            alert('Invalid data format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('This will clear ALL your custom changes and reset to defaults. Continue?')) {
      localStorage.removeItem('daeekeem_data');
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Admin Access</h1>
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
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
      <div className="flex justify-between items-end border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter">Admin Panel</h1>
          <p className="text-xs opacity-50 mt-2 uppercase tracking-widest">Saved locally. Use Export to backup or Import to restore.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button" 
            onClick={handleExportData}
            className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/10"
            title="Download your data as JSON"
          >
            Export
          </button>
          <input type="file" ref={importFileRef} accept=".json" onChange={handleImportData} className="hidden" />
          <button 
            type="button" 
            onClick={() => importFileRef.current?.click()}
            className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/10"
            title="Upload a backup JSON file"
          >
            Import
          </button>
          <button 
            type="button" 
            onClick={handleResetData}
            className="text-[10px] uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-full transition-all border border-red-500/10"
            title="Reset to factory settings"
          >
            Reset
          </button>
          <button 
            type="button" 
            onClick={() => setIsAuthenticated(false)} 
            className="text-xs opacity-50 hover:opacity-100 uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {isProcessingImage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-2xl">
          Processing & Compressing Image...
        </div>
      )}

      {/* Profile & Branding */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Site Configuration</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Display Name</label>
              <input name="name" required defaultValue={data.profile.name} className="w-full bg-white/5 border border-white/10 p-4 focus:border-white/40 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Email Address</label>
              <input name="email" required defaultValue={data.profile.email} className="w-full bg-white/5 border border-white/10 p-4 focus:border-white/40 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Profile Image</label>
              <div className="flex flex-col space-y-4">
                <div className="w-full aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-widest">No Image</div>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="file" ref={profileFileRef} accept="image/*" onChange={handleProfileFileChange} className="hidden" id="profile-upload" />
                  <label htmlFor="profile-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Upload Local File
                  </label>
                  <input name="profileImageUrl" placeholder="Or paste image URL..." defaultValue={data.profile.profileImageUrl} className="w-full bg-white/5 border border-white/10 p-3 text-xs outline-none" onChange={(e) => setProfileImagePreview(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Main Hero Image</label>
              <div className="flex flex-col space-y-4">
                <div className="w-full aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                  {heroImagePreview ? (
                    <img src={heroImagePreview} className="w-full h-full object-cover" alt="Hero" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-widest">No Image</div>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="file" ref={heroFileRef} accept="image/*" onChange={handleHeroFileChange} className="hidden" id="hero-upload" />
                  <label htmlFor="hero-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Upload Local File
                  </label>
                  <input name="heroImageUrl" placeholder="Or paste image URL..." defaultValue={data.profile.heroImageUrl} className="w-full bg-white/5 border border-white/10 p-3 text-xs outline-none" onChange={(e) => setHeroImagePreview(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Biography</label>
            <textarea name="bio" rows={5} defaultValue={data.profile.bio} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all resize-none font-light leading-relaxed" />
          </div>
          <button type="submit" disabled={isSaving || isProcessingImage} className={`bg-white text-black py-4 px-12 font-bold uppercase text-xs tracking-[0.2em] hover:bg-white/90 transition-all ${(isSaving || isProcessingImage) ? 'opacity-50' : ''}`}>
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
            {editingProjectId && <button type="button" onClick={cancelEditing} className="text-[10px] uppercase tracking-widest opacity-50 underline">Cancel & New</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Thumbnail</label>
                 <div className="aspect-square bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                   {projectImagePreview ? <img src={projectImagePreview} className="w-full h-full object-cover" alt="Preview" /> : <Icons.Admin />}
                 </div>
                 <input type="file" ref={projectFileRef} accept="image/*" onChange={handleProjectFileChange} className="hidden" id="project-upload" />
                 <label htmlFor="project-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Upload File</label>
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Gallery</label>
                 <div className="grid grid-cols-3 gap-2">
                    {galleryImagePreviews.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-white/10 overflow-hidden">
                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-red-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    ))}
                    <input type="file" ref={galleryFilesRef} accept="image/*" multiple onChange={handleGalleryFilesChange} className="hidden" id="gallery-upload" />
                    <label htmlFor="gallery-upload" className="flex items-center justify-center aspect-square border border-white/20 border-dashed cursor-pointer opacity-40 hover:opacity-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></label>
                 </div>
               </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Project Title</label>
                <input name="title" required placeholder="Enter project title..." className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Category</label>
                  <input name="category" required placeholder="e.g. Motion Design" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Year</label>
                  <input name="year" required placeholder="e.g. 2024" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Client</label>
                  <input name="client" placeholder="Client Name" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Tools / Tech</label>
                  <input name="tools" placeholder="Premiere, After Effects, etc." className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Video URL</label>
                <input name="videoUrl" placeholder="YouTube, Vimeo or Direct MP4 link" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Description</label>
                <textarea name="description" rows={3} placeholder="Brief project overview..." className="w-full bg-black/40 border border-white/10 p-4 outline-none resize-none focus:border-white/40 transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Thumbnail Image URL Override</label>
                <input name="imageUrl" placeholder="Paste image URL if not uploading..." className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" onChange={(e) => setProjectImagePreview(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isProcessingImage} className="w-full border border-white/40 py-4 uppercase text-xs font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all">
            {editingProjectId ? 'Update Project' : 'Add Project to Portfolio'}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-1">
          {data.projects.map(p => (
            <div key={p.id} className="group flex items-center justify-between p-4 bg-white/5 border border-transparent hover:border-white/20 transition-all">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 border border-white/10 overflow-hidden grayscale group-hover:grayscale-0">
                  <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.title} />
                </div>
                <div>
                  <p className="font-bold">{p.title}</p>
                  <p className="text-[10px] uppercase opacity-40 mt-1">{p.category} — {p.year}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => startEditing(p)} className="p-3 text-white/20 hover:text-white hover:bg-white/10 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button type="button" onClick={() => deleteProject(p.id)} className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;
