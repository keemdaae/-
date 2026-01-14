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

  // Improved Image Processing for Higher Resolution/Quality
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
          
          // Maintain aspect ratio while fitting within maxDim
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
          
          // Use better image smoothing
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // Higher quality output (0.9 is close to lossless perception)
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
          (Array.from(files) as File[]).map(file => processImage(file, 2500, 0.9))
        );
        setGalleryImagePreviews(prev => [...prev, ...processed]);
      } catch (err) {
        console.error("Gallery processing failed", err);
        alert("Some images were too large or failed to process.");
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
            profileImageUrl: profileImagePreview || (formData.get('profileImageUrl') as string),
            heroImageUrl: heroImagePreview || (formData.get('heroImageUrl') as string),
          }
        });
        alert('Site configuration saved to database!');
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
          (element as unknown as HTMLInputElement | HTMLTextAreaElement).value = value || '';
        }
      };

      setFieldValue('title', project.title);
      setFieldValue('category', project.category);
      setFieldValue('year', project.year);
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
      alert(editingProjectId ? 'Project updated in database!' : 'New project added to database!');
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

  // Logic for reordering projects
  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...data.projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newProjects.length) {
      [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
      updateData({ ...data, projects: newProjects });
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
            alert('Data imported and saved to database successfully!');
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
      const deleteRequest = indexedDB.deleteDatabase('DaeekeemPortfolioDB');
      deleteRequest.onsuccess = () => {
        localStorage.removeItem('daeekeem_data');
        window.location.reload();
      };
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
      <div className="flex justify-between items-end border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter">Admin Panel</h1>
          <p className="text-xs opacity-50 mt-2 uppercase tracking-widest">Database storage active. Export to backup or Import to restore.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button type="button" onClick={handleExportData} className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/10">Export</button>
          <input type="file" ref={importFileRef} accept=".json" onChange={handleImportData} className="hidden" />
          <button type="button" onClick={() => importFileRef.current?.click()} className="text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/10">Import</button>
          <button type="button" onClick={handleResetData} className="text-[10px] uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-full transition-all border border-red-500/10">Reset</button>
          <button type="button" onClick={() => setIsAuthenticated(false)} className="text-xs opacity-50 hover:opacity-100 uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full transition-all">Logout</button>
        </div>
      </div>

      {isProcessingImage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-2xl">
          Processing High-Res Image...
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
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Professional Title</label>
              <input name="title" required defaultValue={data.profile.title} placeholder="e.g. Visual Storyteller" className="w-full bg-white/5 border border-white/10 p-4 focus:border-white/40 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Hero Description (Home Page Tagline)</label>
            <input name="heroDescription" required defaultValue={data.profile.heroDescription} placeholder="Short tagline for the home page hero section" className="w-full bg-white/5 border border-white/10 p-4 focus:border-white/40 outline-none transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  {profileImagePreview ? <img src={profileImagePreview} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-widest">No Image</div>}
                </div>
                <input type="file" ref={profileFileRef} accept="image/*" onChange={handleProfileFileChange} className="hidden" id="profile-upload" />
                <label htmlFor="profile-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Upload Local File</label>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Hero Image</label>
              <div className="flex flex-col space-y-4">
                <div className="w-full aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                  {heroImagePreview ? <img src={heroImagePreview} className="w-full h-full object-cover" alt="Hero" /> : <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-widest">No Image</div>}
                </div>
                <input type="file" ref={heroFileRef} accept="image/*" onChange={handleHeroFileChange} className="hidden" id="hero-upload" />
                <label htmlFor="hero-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Upload Local File</label>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Biography (About Page)</label>
            <textarea name="bio" rows={5} defaultValue={data.profile.bio} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all resize-none font-light leading-relaxed" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Creative Approach (Home Page)</label>
            <textarea name="creativeApproach" rows={8} defaultValue={data.profile.creativeApproach} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all resize-none font-light leading-relaxed" />
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
                 <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Main Thumbnail</label>
                 <div className="aspect-square bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                   {projectImagePreview ? <img src={projectImagePreview} className="w-full h-full object-cover" alt="Preview" /> : <Icons.Admin />}
                 </div>
                 <input type="file" ref={projectFileRef} accept="image/*" onChange={handleProjectFileChange} className="hidden" id="project-upload" />
                 <label htmlFor="project-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Upload Main Image</label>
               </div>
               
               {/* Gallery Management Section */}
               <div className="space-y-4 pt-4 border-t border-white/10">
                 <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Gallery (Additional Images)</label>
                 <input type="file" ref={galleryFilesRef} accept="image/*" multiple onChange={handleGalleryFilesChange} className="hidden" id="gallery-upload" />
                 <label htmlFor="gallery-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Add Gallery Images</label>
                 
                 <div className="grid grid-cols-3 gap-2">
                   {galleryImagePreviews.map((img, i) => (
                     <div key={i} className="relative aspect-square border border-white/10 group">
                       <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                       <button 
                         type="button" 
                         onClick={() => removeGalleryImage(i)}
                         className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l18 18" /></svg>
                       </button>
                     </div>
                   ))}
                 </div>
                 <p className="text-[9px] opacity-30 italic">Note: Gallery images are processed at high resolution for maximum detail.</p>
               </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <input name="title" required placeholder="Project Title" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <input name="category" required placeholder="Category" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
                <input name="year" required placeholder="Year" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
              </div>
              <input name="videoUrl" placeholder="Video URL (YouTube/Vimeo)" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
              <textarea name="description" rows={3} placeholder="Description" className="w-full bg-black/40 border border-white/10 p-4 outline-none resize-none focus:border-white/40 transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <input name="client" placeholder="Client" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
                <input name="tools" placeholder="Tools Used" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 transition-all" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isProcessingImage} className="w-full border border-white/40 py-4 uppercase text-xs font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all">
            {editingProjectId ? 'Update Project' : 'Add Project'}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-1">
          {data.projects.map((p, idx) => (
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
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-1 mr-4">
                  <button 
                    type="button" 
                    disabled={idx === 0}
                    onClick={() => moveProject(idx, 'up')}
                    className={`p-1.5 rounded hover:bg-white/10 transition-all ${idx === 0 ? 'opacity-10 cursor-not-allowed' : 'opacity-40 hover:opacity-100'}`}
                    title="Move Up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button 
                    type="button" 
                    disabled={idx === data.projects.length - 1}
                    onClick={() => moveProject(idx, 'down')}
                    className={`p-1.5 rounded hover:bg-white/10 transition-all ${idx === data.projects.length - 1 ? 'opacity-10 cursor-not-allowed' : 'opacity-40 hover:opacity-100'}`}
                    title="Move Down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                
                <button type="button" onClick={() => startEditing(p)} className="p-3 text-white/20 hover:text-white hover:bg-white/10 rounded-full" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button type="button" onClick={() => deleteProject(p.id)} className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full" title="Delete"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
        {data.projects.length > 0 && (
          <p className="text-[9px] opacity-30 text-center uppercase tracking-widest mt-4 italic">Use arrow buttons to adjust project order on the home page.</p>
        )}
      </section>
    </div>
  );
};

export default Admin;