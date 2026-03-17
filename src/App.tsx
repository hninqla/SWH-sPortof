/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  ChevronRight, 
  Menu, 
  X,
  Github,
  Twitter,
  Plus,
  Trash2,
  Save,
  LogOut,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

// --- Components ---

const AudioPlayer = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay was blocked, which is expected. 
        // We rely on user interaction listeners below.
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // We don't call handlePlay() here anymore to avoid the console error.
    // Browsers require a user gesture (click/tap) to start audio.

    const interactionHandler = () => {
      if (audio.paused) {
        handlePlay();
      }
    };

    window.addEventListener('click', interactionHandler, { once: true });
    window.addEventListener('touchstart', interactionHandler, { once: true });

    return () => {
      window.removeEventListener('click', interactionHandler);
      window.removeEventListener('touchstart', interactionHandler);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuteState = !isMuted;
      audioRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
      
      // If we're unmuting and it's not playing, try to play
      if (!newMuteState && audioRef.current.paused) {
        handlePlay();
      }
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[9999]">
      <audio 
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" 
        loop 
        preload="auto"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="w-14 h-14 bg-white border-2 border-gold rounded-full flex items-center justify-center text-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </motion.button>
    </div>
  );
};

const Navbar = ({ onAdminClick, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: "Shafdil's", href: '#shafdil' },
    { name: "Wawa's", href: '#wawa' },
    { name: "Hanin's", href: '#hanin' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-ivory/80 backdrop-blur-md border-b border-nude/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl heading-serif font-medium tracking-widest text-gold"
        >
          SWH's
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm uppercase tracking-widest hover:text-gold transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={onAdminClick}
            className="p-2 text-soft-brown hover:text-gold transition-colors"
            title="Admin Dashboard"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            onClick={onAdminClick}
            className="p-2 text-soft-brown"
          >
            <Settings size={18} />
          </button>
          <button className="text-soft-brown" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-ivory border-b border-nude/30 px-6 py-8 flex flex-col space-y-6"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg heading-serif tracking-widest text-center"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AdminDashboard = ({ projects, setProjects, onLogout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        alert(`Koneksi server OK: ${data.timestamp}`);
      } else {
        alert(`Server merespons dengan status: ${res.status}`);
      }
    } catch (err) {
      alert(`Gagal terhubung ke server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log("Attempting login with:", { username });
    try {
      const res = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        })
      });
      
      const text = await res.text();
      console.log("Raw login response:", res.status, text);

      if (!text) {
        throw new Error(`Server mengirim respon kosong (Status: ${res.status})`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Respon bukan JSON: ${text.substring(0, 100)}`);
      }

      if (res.ok && data.success) {
        setIsLoggedIn(true);
        setError('');
      } else {
        setError(data.message || 'Username atau password salah');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(`Kesalahan koneksi: ${err instanceof Error ? err.message : 'Server tidak merespons'}`);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/v1/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, projects })
      });
      if (res.ok) {
        alert('Data berhasil disimpan');
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const addProject = (owner) => {
    setProjects([...projects, { 
      title: 'Proyek Baru', 
      category: 'Kelas X', 
      desc: 'Deskripsi proyek baru',
      imageUrl: '',
      targetUrl: '',
      owner: owner
    }]);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const categories = ["Kelas X", "Kelas XI", "Kelas XII"];
  const owners = ["Shafdil", "Wawa", "Hanin"];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-md"
        >
          <h2 className="text-3xl heading-serif text-center mb-8">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-medium text-soft-brown">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-beige/30 border-b border-nude p-3 focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-medium text-soft-brown">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-beige/30 border-b border-nude p-3 focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button className="w-full py-4 bg-soft-brown text-white rounded-xl uppercase tracking-widest text-sm hover:bg-gold transition-all">
              Login
            </button>
            <button 
              type="button"
              onClick={checkConnection}
              disabled={isChecking}
              className="w-full py-2 text-soft-brown text-xs uppercase tracking-widest hover:text-gold transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Mengecek...' : 'Cek Koneksi Server'}
            </button>
            <button 
              type="button"
              onClick={onLogout}
              className="w-full py-2 text-soft text-xs uppercase tracking-widest hover:text-gold transition-colors"
            >
              Kembali ke Web
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl heading-serif">Dashboard Admin</h2>
          <div className="flex space-x-4">
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-gold text-white rounded-full text-xs uppercase tracking-widest hover:bg-soft-brown transition-all"
            >
              <Save size={16} /> <span>Simpan Perubahan</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 px-6 py-3 border border-soft-brown text-soft-brown rounded-full text-xs uppercase tracking-widest hover:bg-soft-brown hover:text-white transition-all"
            >
              <LogOut size={16} /> <span>Keluar</span>
            </button>
          </div>
        </div>

        <div className="space-y-16">
          {owners.map(owner => (
            <div key={owner} className="space-y-8">
              <h3 className="text-2xl heading-serif border-b border-gold/30 pb-2">{owner}'s Portfolio</h3>
              <div className="grid gap-6">
                {projects.map((project, index) => {
                  if (project.owner !== owner) return null;
                  return (
                    <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-nude/20 flex flex-col md:flex-row gap-6 items-start">
                      <div className="w-full md:w-48 aspect-video bg-beige/30 rounded-xl overflow-hidden flex-shrink-0 border border-nude/10">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-nude/50 text-[10px] uppercase tracking-widest">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-soft">Judul Proyek</label>
                            <input 
                              type="text" 
                              value={project.title}
                              onChange={(e) => updateProject(index, 'title', e.target.value)}
                              className="w-full bg-beige/20 border-b border-nude p-2 focus:outline-none focus:border-gold text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-soft">Kategori</label>
                            <select 
                              value={project.category}
                              onChange={(e) => updateProject(index, 'category', e.target.value)}
                              className="w-full bg-beige/20 border-b border-nude p-2 focus:outline-none focus:border-gold text-sm"
                            >
                              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-soft">URL Gambar</label>
                            <input 
                              type="text" 
                              value={project.imageUrl}
                              onChange={(e) => updateProject(index, 'imageUrl', e.target.value)}
                              className="w-full bg-beige/20 border-b border-nude p-2 focus:outline-none focus:border-gold text-sm"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-soft">URL Tujuan (Link)</label>
                            <input 
                              type="text" 
                              value={project.targetUrl}
                              onChange={(e) => updateProject(index, 'targetUrl', e.target.value)}
                              className="w-full bg-beige/20 border-b border-nude p-2 focus:outline-none focus:border-gold text-sm"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-soft">Deskripsi</label>
                          <textarea 
                            value={project.desc}
                            onChange={(e) => updateProject(index, 'desc', e.target.value)}
                            className="w-full bg-beige/20 border-b border-nude p-2 focus:outline-none focus:border-gold text-sm resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeProject(index)}
                        className="p-3 text-red-300 hover:text-red-500 transition-colors"
                        title="Hapus Proyek"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
                
                <button 
                  onClick={() => addProject(owner)}
                  className="w-full py-8 border-2 border-dashed border-nude rounded-3xl text-soft hover:border-gold hover:text-gold transition-all flex flex-col items-center justify-center space-y-2"
                >
                  <Plus size={32} />
                  <span className="text-xs uppercase tracking-widest font-medium">Tambah Proyek Baru untuk {owner}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <motion.h2 
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-gold uppercase text-sm mb-10 font-medium"
          >
            Selamat Datang di
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl sm:text-6xl md:text-8xl heading-serif mb-8 leading-tight tracking-[-0.12em]"
          >
            <span className="heading-script">P</span>ortofolio nya <span className="heading-script">K</span>ami
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl text-soft max-w-2xl mx-auto mb-12 leading-relaxed italic"
          >
            "Sebuah Web App yang berisi kumpulan tugas Shafa, Wawa, Hanin"
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <a 
              href="#portfolio" 
              className="px-10 py-4 bg-soft-brown text-ivory rounded-full text-sm uppercase tracking-widest hover:bg-gold transition-all duration-500 shadow-lg shadow-soft-brown/20"
            >
              Lihat Portofolio
            </a>
            <a 
              href="#contact" 
              className="px-10 py-4 border border-soft-brown text-soft-brown rounded-full text-sm uppercase tracking-widest hover:bg-soft-brown hover:text-ivory transition-all duration-500"
            >
              Hubungi Saya
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-beige overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h3 className="text-gold uppercase tracking-[0.3em] text-sm mb-4 font-medium">Tentang Kami</h3>
          <h2 className="text-4xl md:text-5xl heading-serif mb-12 leading-tight">memenuhi tugas melalui desain</h2>
          <div className="space-y-8 text-soft leading-relaxed text-lg">
            <p>
              Halo, kami adalah SWH's. Singkatan dari Shafa, Wawa, Hanin. Kami membuat portofolio ini sebagai pemenuhan tugas informatika. Portofolio ini berisi seluruh tugas yang telah Kami laksanakan sebelumnya.
            </p>
            <p>
              Diharapkan dengan pemenuhan tugas ini dapat menjadikan Kami telah berupaya serta bertanggung jawab semaksimal mungkin atas tanggung jawab tugas kami.
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 pt-12 border-t border-nude/50 grid grid-cols-2 gap-8 max-w-2xl mx-auto"
          >
            <div>
              <h4 className="heading-serif text-sm mb-2">Lokasi</h4>
              <p className="text-soft text-sm">Jakarta, Indonesia</p>
            </div>
            <div>
              <h4 className="heading-serif text-sm mb-2">Email</h4>
              <p className="text-sm">hello@swhs.com</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Portfolio = ({ projects }) => {
  const owners = ["Shafdil", "Wawa", "Hanin"];

  return (
    <>
      {owners.map(owner => (
        <section key={owner} id={owner.toLowerCase()} className="py-24 bg-ivory border-b border-nude/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-gold uppercase tracking-[0.3em] text-sm mb-4 font-medium">Karya Terpilih</h3>
              <h2 className="text-4xl md:text-5xl heading-serif">{owner}'s Portfolio</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {projects.filter(p => p.owner === owner).map((project, index) => (
                <motion.a 
                  key={index}
                  href={project.targetUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer border border-nude/20 rounded-3xl overflow-hidden hover:bg-beige transition-all duration-500 flex flex-col"
                >
                  <div className="aspect-video overflow-hidden bg-beige/50 relative">
                    {project.imageUrl ? (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-nude ${project.imageUrl ? 'hidden' : 'flex'}`}>
                      <Plus size={48} />
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-gold text-xs uppercase tracking-widest mb-4">{project.category}</p>
                    <h4 className="text-2xl heading-serif mb-4 group-hover:text-gold transition-colors">{project.title}</h4>
                    <p className="text-soft text-sm leading-relaxed mb-6">{project.desc}</p>
                    <div className="flex items-center text-gold text-xs uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Detail Proyek <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
};

const Skills = () => {
  const skills = [
    { name: "UI/UX Design", level: 90 },
    { name: "Brand Identity", level: 95 },
    { name: "Web Development", level: 80 },
    { name: "Photography", level: 85 },
    { name: "Art Direction", level: 90 },
    { name: "Typography", level: 95 }
  ];

  return (
    <section id="skills" className="py-24 bg-beige/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-gold uppercase tracking-[0.3em] text-sm mb-4 font-medium">Keahlian</h3>
          <h2 className="text-4xl md:text-5xl heading-serif">Keahlian & Kompetensi</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-between mb-3">
                <span className="text-sm uppercase tracking-widest font-medium">{skill.name}</span>
                <span className="text-sm text-gold">{skill.level}%</span>
              </div>
              <div className="h-1 w-full bg-nude/30 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-full bg-gold rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-nude/20 overflow-hidden grid lg:grid-cols-5">
          <div className="lg:col-span-2 bg-soft-brown p-12 text-ivory flex flex-col justify-between">
            <div>
              <h2 className="text-4xl heading-serif mb-6">Mari Berkolaborasi</h2>
              <p className="text-ivory/70 leading-relaxed mb-12">
                Punya ide menarik? Mari kita wujudkan bersama menjadi sesuatu yang indah dan bermakna.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60">Email</p>
                    <p className="text-sm">hello@swhs.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center">
                    <Instagram size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60">Instagram</p>
                    <p className="text-sm">@swhs.creative</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center">
                    <Linkedin size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60">LinkedIn</p>
                    <p className="text-sm">SWH's Team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-12">
              <a href="#" className="w-10 h-10 rounded-full border border-ivory/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-ivory/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 p-12">
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-medium text-soft-brown">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-beige/30 border-b border-nude p-3 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-medium text-soft-brown">Email</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-beige/30 border-b border-nude p-3 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-medium text-soft-brown">Subjek</label>
                <input 
                  type="text" 
                  placeholder="Kerjasama Proyek"
                  className="w-full bg-beige/30 border-b border-nude p-3 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-medium text-soft-brown">Pesan</label>
                <textarea 
                  rows={4}
                  placeholder="Ceritakan sedikit tentang proyek Anda..."
                  className="w-full bg-beige/30 border-b border-nude p-3 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
                ></textarea>
              </div>
              <button className="w-full py-4 bg-gold text-white rounded-xl uppercase tracking-widest text-sm font-medium hover:bg-soft-brown transition-all duration-500 shadow-lg shadow-gold/20">
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 bg-ivory border-t border-nude/30">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="text-2xl heading-serif font-medium tracking-widest text-gold mb-6 md:mb-0">
          SWH's
        </div>
        <p className="text-soft text-xs uppercase tracking-widest">
          &copy; {new Date().getFullYear()} SWH's. All Rights Reserved.
        </p>
        <div className="flex space-x-6 mt-6 md:mt-0">
          <a href="#" className="text-soft hover:text-gold transition-colors text-xs uppercase tracking-widest">Privacy Policy</a>
          <a href="#" className="text-soft hover:text-gold transition-colors text-xs uppercase tracking-widest">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState('public'); // 'public' or 'admin'
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api/v1/portfolio')
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Failed to fetch') });
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Data is not an array:', data);
          setProjects([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch portfolio data', err);
        setProjects([]);
      });
  }, []);

  if (view === 'admin') {
    return <AdminDashboard projects={projects} setProjects={setProjects} onLogout={() => setView('public')} />;
  }

  return (
    <div className="selection:bg-gold/20 selection:text-gold">
      <AudioPlayer />
      <Navbar onAdminClick={() => setView('admin')} isAdmin={view === 'admin'} />
      <main>
        <Hero />
        <About />
        <Portfolio projects={projects} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
