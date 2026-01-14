
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
            <h2 className="text-6xl font-extrabold tracking-tighter">{data.profile.title}</h2>
          </div>

          <div className="space-y-8 text-lg font-light leading-relaxed opacity-70">
            <h3 className="text-3xl text-white font-bold tracking-widest uppercase">{data.profile.name}</h3>
            <div className="whitespace-pre-wrap">
              {data.profile.bio}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
