
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Project } from '../types';

const Admin: React.FC = () => {
  const { data, updateData } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // States for Previews
  const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(data.profile.profileImageUrl);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(data.profile.heroImageUrl);
  
  // State for Editing
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const projectFileRef = useRef<HTMLInputElement>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const projectFormRef = useRef<HTMLFormElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '870602') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProjectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setProjectImagePreview(base64);
    }
  };

  const handleProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setProfileImagePreview(base64);
    }
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setHeroImagePreview(base64);
    }
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
          bio: formData.get('bio') as string,
          email: formData.get('email') as string,
          profileImageUrl: profileImagePreview || (formData.get('profileImageUrl') as string),
          heroImageUrl: heroImagePreview || (formData.get('heroImageUrl') as string),
        }
      });
      setIsSaving(false);
      alert('Profile & Branding updated successfully!');
    }, 100);
  };

  const startEditing = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectImagePreview(project.imageUrl);
    if (projectFormRef.current) {
      const form = projectFormRef.current;
      (form.elements.namedItem('title') as HTMLInputElement).value = project.title;
      (form.elements.namedItem('category') as HTMLInputElement).value = project.category;
      (form.elements.namedItem('year') as HTMLInputElement).value = project.year;
      (form.elements.namedItem('imageUrl') as HTMLInputElement).value = project.imageUrl;
      (form.elements.namedItem('description') as HTMLTextAreaElement).value = project.description || '';
      (form.elements.namedItem('client') as HTMLInputElement).value = project.client || '';
      (form.elements.namedItem('camera') as HTMLInputElement).value = project.camera || '';
    }
    window.scrollTo({ top: projectFormRef.current?.offsetTop ? projectFormRef.current.offsetTop - 100 : 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setProjectImagePreview(null);
    projectFormRef.current?.reset();
  };

  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imageUrl = projectImagePreview || (formData.get('imageUrl') as string);

    if (!imageUrl) {
      alert('Please provide an image (file or URL)');
      return;
    }

    const projectData: Project = {
      id: editingProjectId || Date.now().toString(),
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      year: formData.get('year') as string,
      imageUrl: imageUrl,
      description: formData.get('description') as string,
      client: formData.get('client') as string,
      camera: formData.get('camera') as string,
    };

    let newProjects;
    if (editingProjectId) {
      newProjects = data.projects.map(p => p.id === editingProjectId ? projectData : p);
    } else {
      newProjects = [projectData, ...data.projects];
    }

    updateData({
      ...data,
      projects: newProjects
    });
    
    alert(editingProjectId ? 'Project updated!' : 'New project added!');
    cancelEditing();
  };

  const deleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      updateData({
        ...data,
        projects: data.projects.filter(p => p.id !== id)
      });
      if (editingProjectId === id) cancelEditing();
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
          <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
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
          <p className="text-xs opacity-50 mt-2 uppercase tracking-widest">Local changes are persisted to browser storage</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs opacity-50 hover:opacity-100 uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full transition-all">Logout</button>
      </div>

      {/* Profile & Branding Management */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Site Configuration</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Display Name</label>
              <input name="name" defaultValue={data.profile.name} className="w-full bg-white/5 border border-white/10 p-4 focus:border-white/40 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Email Address</label>
              <input name="email" defaultValue={data.profile.email} className="w-full bg-white/5 border border-white/10 p-4 focus:border-white/40 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Profile Image (About Page)</label>
              <div className="flex flex-col space-y-4">
                <div className="w-full aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-widest">No Image selected</div>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="file" ref={profileFileRef} accept="image/*" onChange={handleProfileFileChange} className="hidden" id="profile-upload" />
                  <label htmlFor="profile-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Choose Local Profile File
                  </label>
                  <input name="profileImageUrl" placeholder="Or paste profile image URL..." defaultValue={data.profile.profileImageUrl} className="w-full bg-white/5 border border-white/10 p-3 text-xs outline-none" onChange={(e) => setProfileImagePreview(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Main Hero Image (Home Page)</label>
              <div className="flex flex-col space-y-4">
                <div className="w-full aspect-[4/3] border border-white/10 overflow-hidden bg-white/5">
                  {heroImagePreview ? (
                    <img src={heroImagePreview} className="w-full h-full object-cover" alt="Hero" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-20 uppercase tracking-widest">No Image selected</div>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="file" ref={heroFileRef} accept="image/*" onChange={handleHeroFileChange} className="hidden" id="hero-upload" />
                  <label htmlFor="hero-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Choose Local Hero File
                  </label>
                  <input name="heroImageUrl" placeholder="Or paste hero image URL..." defaultValue={data.profile.heroImageUrl} className="w-full bg-white/5 border border-white/10 p-3 text-xs outline-none" onChange={(e) => setHeroImagePreview(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Biography</label>
            <textarea name="bio" rows={5} defaultValue={data.profile.bio} className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-all resize-none font-light leading-relaxed" />
          </div>
          
          <div>
            <button 
              disabled={isSaving}
              className={`bg-white text-black py-4 px-12 font-bold uppercase text-xs tracking-[0.2em] hover:bg-white/90 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save Profile & Branding'}
            </button>
          </div>
        </form>
      </section>

      {/* Project Management */}
      <section className="space-y-8 pt-20 border-t border-white/10">
        <h2 className="text-2xl font-bold tracking-tight">Manage Portfolio Projects</h2>
        
        <form ref={projectFormRef} onSubmit={handleSaveProject} className={`p-8 bg-white/5 border ${editingProjectId ? 'border-white/40' : 'border-white/10'} space-y-8 transition-colors`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">
              {editingProjectId ? 'Edit Project' : 'Add New Project'}
            </h3>
            {editingProjectId && (
              <button type="button" onClick={cancelEditing} className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 underline">
                Cancel Edit & Create New
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
               <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Project Thumbnail</label>
               <div className="aspect-square bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                 {projectImagePreview ? (
                   <img src={projectImagePreview} className="w-full h-full object-cover" alt="Preview" />
                 ) : (
                   <div className="opacity-20 flex flex-col items-center"><Icons.Admin /><span className="text-[10px] mt-2">No Image</span></div>
                 )}
               </div>
               <input type="file" ref={projectFileRef} accept="image/*" onChange={handleProjectFileChange} className="hidden" id="project-upload" />
               <label htmlFor="project-upload" className="block text-center cursor-pointer border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  Choose Image File
               </label>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Project Title</label>
                <input name="title" required className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Category</label>
                  <input name="category" required className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Year</label>
                  <input name="year" required className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Client</label>
                  <input name="client" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40" placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Camera Gear</label>
                  <input name="camera" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40" placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Description</label>
                <textarea name="description" rows={3} className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40 resize-none" placeholder="Project narrative..."></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Image URL Override</label>
                <input name="imageUrl" className="w-full bg-black/40 border border-white/10 p-4 outline-none focus:border-white/40" placeholder="https://..." onChange={(e) => setProjectImagePreview(e.target.value)} />
              </div>
            </div>
          </div>

          <button className="w-full border border-white/40 py-4 uppercase text-xs font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all">
            {editingProjectId ? 'Update Project' : 'Add Project to Portfolio'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest">Existing Work</h3>
            <span className="text-[10px] opacity-40">{data.projects.length} Total Projects</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {data.projects.map(p => (
              <div key={p.id} className={`group flex items-center justify-between p-4 bg-white/5 border ${editingProjectId === p.id ? 'border-white/40 bg-white/10' : 'border-transparent'} hover:border-white/20 transition-all`}>
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 border border-white/10 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.title} />
                  </div>
                  <div>
                    <p className="font-bold tracking-tight">{p.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1">{p.category} — {p.year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => startEditing(p)} 
                    className="p-3 text-white/20 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    title="Edit Project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={() => deleteProject(p.id)} 
                    className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                    title="Delete Project"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
