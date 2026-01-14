
import React from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';

const About: React.FC = () => {
  const { data } = useApp();

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div className="sticky top-24">
          <img 
            src={data.profile.profileImageUrl} 
            alt={data.profile.name} 
            className="w-full aspect-[3/4] object-cover grayscale border border-white/10"
          />
          <div className="mt-8 flex space-x-4">
             <a href={data.profile.instagram} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all">
               <Icons.Instagram />
             </a>
             <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all">
               <Icons.LinkedIn />
             </a>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-sm tracking-[0.4em] uppercase opacity-40">About</h1>
            <h2 className="text-6xl font-extrabold tracking-tighter">Photographer & Visual Storyteller</h2>
          </div>

          <div className="space-y-8 text-lg font-light leading-relaxed opacity-70">
            <h3 className="text-3xl text-white font-bold tracking-widest uppercase">{data.profile.name}</h3>
            <p>{data.profile.bio}</p>
            <p>
              Based in {data.profile.location} with an MFA in Photography from the School of Visual Arts, Sarah brings a unique perspective to every project, combining technical excellence with artistic vision. Her approach to photography is deeply rooted in storytelling, believing that every image should convey emotion and meaning beyond its visual appeal.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">Email</span>
               <a href={`mailto:${data.profile.email}`} className="text-xl hover:opacity-70 transition-opacity">{data.profile.email}</a>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">Location</span>
               <span className="text-xl">{data.profile.location}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
