"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, X, Bell, Star, Search, LogOut, Trash, Check, Loader2, Key } from 'lucide-react';
import { useZenithStore, useUIStore } from '@/store/zenith-store';
import { useAudio } from '@/hooks/use-audio';
import { astronomyService } from '@/services/astronomy';
import { toast } from 'sonner';

export function AuthModal() {
  const { isAuthOpen, toggleAuth, setAuthOpen } = useUIStore();
  const { 
    user, 
    token, 
    setAuth, 
    logout, 
    favorites, 
    removeFavorite,
    recentSearches, 
    notifications,
    markNotificationRead,
    clearNotifications
  } = useZenithStore();

  const { playSuccess } = useAudio();

  // Tab states: 'login' | 'register' | 'profile'
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [profileTab, setProfileTab] = useState<'info' | 'favorites' | 'searches' | 'notifications'>('info');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Profile Edit states
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync profile update inputs when user state changes
  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  if (!isAuthOpen) return null;

  const handleClose = () => {
    // Reset forms
    setName('');
    setEmail('');
    setPassword('');
    setNewPassword('');
    setTab('login');
    toggleAuth();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error('All fields are required.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await astronomyService.register({ email, password, name });
      setAuth(data.user, data.token);
      playSuccess();
      toast.success(`Welcome to Project Zenith, ${data.user.name}!`);
      // Reset
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await astronomyService.login({ email, password });
      setAuth(data.user, data.token);
      playSuccess();
      toast.success(`Welcome back, ${data.user.name}!`);
      // Reset
      setEmail('');
      setPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      toast.error('Name cannot be empty.');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = { name: newName };
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error('New password must be at least 6 characters.');
          setIsUpdating(false);
          return;
        }
        updateData.password = newPassword;
      }

      const updated = await astronomyService.updateProfile(updateData);
      setAuth(updated, token);
      playSuccess();
      toast.success('Profile updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Profile update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl z-10"
        style={{
          background: 'rgba(10, 10, 35, 0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 45px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Glow corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              {user ? 'Celestial Command Profile' : 'Access Space-Bridge'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10 max-h-[75vh] overflow-y-auto">
          {!user ? (
            /* AUTH FORM TAB PANEL */
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/10">
                <button
                  onClick={() => setTab('login')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    tab === 'login' 
                      ? 'bg-purple-600/50 text-white shadow-lg shadow-purple-500/10 border border-purple-500/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    tab === 'register' 
                      ? 'bg-purple-600/50 text-white shadow-lg shadow-purple-500/10 border border-purple-500/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {tab === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="astronomer@zenith.app"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/50 font-medium">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Authenticate
                  </button>
                </form>
              ) : (
                /* REGISTER FORM */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50 font-medium">Astronomer Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Neil Armstrong"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/50 font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="astronomer@zenith.app"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/50 font-medium">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••••• (6+ characters)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Initialize Account
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* LOGGED IN USER PROFILE DASHBOARD */
            <div>
              {/* Profile Navigation Icons */}
              <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
                {[
                  { id: 'info', label: 'Dashboard', icon: User },
                  { id: 'favorites', label: 'Favorites', icon: Star, count: favorites.length },
                  { id: 'searches', label: 'History', icon: Search, count: recentSearches.length },
                  { id: 'notifications', label: 'Alerts', icon: Bell, count: unreadNotifsCount }
                ].map((pItem) => {
                  const Icon = pItem.icon;
                  const isActive = profileTab === pItem.id;
                  return (
                    <button
                      key={pItem.id}
                      onClick={() => setProfileTab(pItem.id as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isActive 
                          ? 'bg-purple-600/30 text-white border-purple-500/40' 
                          : 'bg-white/5 text-white/60 border-transparent hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{pItem.label}</span>
                      {pItem.count !== undefined && pItem.count > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-500/80 text-[10px] text-white">
                          {pItem.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sub Panels */}
              {profileTab === 'info' && (
                <div className="space-y-6">
                  {/* Summary card */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{user.name}</h4>
                      <p className="text-xs text-white/50">{user.email}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        Member since: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-2 text-xs font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <h5 className="text-sm font-bold text-white border-l-2 border-cyan-400 pl-2">
                      Update Profile Parameters
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/50 font-medium">Display Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Display name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/50 font-medium">Change Password</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password (optional)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2.5 rounded-xl bg-purple-600/60 hover:bg-purple-500/70 border border-purple-500/30 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Updates
                    </button>
                  </form>
                </div>
              )}

              {profileTab === 'favorites' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-4">Saved Celestial Objects</h4>
                  {favorites.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs">
                      No saved objects. Star items across pages to view them here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {favorites.map((favId) => (
                        <div
                          key={favId}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <span className="text-xs font-mono font-bold text-white truncate max-w-[130px]">
                            {favId}
                          </span>
                          <button
                            onClick={() => {
                              removeFavorite(favId);
                              toast.info(`Removed ${favId} from favorites.`);
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Remove"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {profileTab === 'searches' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-4">Recent Searches History</h4>
                  {recentSearches.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs">
                      No recent queries logged.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentSearches.map((query, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80"
                        >
                          <Search className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="flex-1 truncate">{query}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {profileTab === 'notifications' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-white">Security Alerts & Telemetry</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          clearNotifications();
                          toast.success('Cleared all notifications.');
                        }}
                        className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Clear All
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs">
                      No notifications or warnings.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                            notif.isRead 
                              ? 'bg-white/5 border-white/10 text-white/60' 
                              : 'bg-purple-900/10 border-purple-500/20 text-white'
                          }`}
                        >
                          <div className="flex-1 pr-4">
                            <p className="text-xs leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-white/30 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <button
                              onClick={() => {
                                markNotificationRead(notif.id);
                                toast.info('Notification marked as read.');
                              }}
                              className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 transition-colors"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
