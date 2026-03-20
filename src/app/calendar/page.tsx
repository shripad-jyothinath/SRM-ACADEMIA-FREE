"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Plus, CheckCircle2, Circle, Clock, Trash2, BookOpen } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  course: string;
  deadline: string;
  completed: boolean;
};

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('srm_planner_tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) {}
    } else {
      const defaultTasks = [
        { id: '1', title: 'Complete Lab Record', course: 'Data Structures', deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], completed: false },
        { id: '2', title: 'Mid-term Preparation', course: 'Calculus', deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], completed: false }
      ];
      setTasks(defaultTasks);
      localStorage.setItem('srm_planner_tasks', JSON.stringify(defaultTasks));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('srm_planner_tasks', JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      course: newTaskCourse || 'General',
      deadline: newTaskDate || new Date().toISOString().split('T')[0],
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskCourse('');
    setNewTaskDate('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  if (!mounted) return <div className="page-container" style={{ textAlign: 'center', color: '#94a3b8' }}>Loading Planner...</div>;

  const pendingTasks = tasks.filter(t => !t.completed).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const completedTasks = tasks.filter(t => t.completed);

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().setHours(0,0,0,0);
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <div className="page-container" style={{ paddingBottom: '120px' }}>
      <header className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Academic Planner</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Stay on top of deadlines and assignments.</p>
        </div>
        <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Dashboard</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Add Task Form */}
        <div className="glass-panel animate-fade-in" style={{ alignSelf: 'start', padding: '24px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} color="#38bdf8" /> Add New Deadline
          </h2>
          <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Task Title</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Operating Systems Assignment 2"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Course / Subject</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. CS302"
                  value={newTaskCourse}
                  onChange={e => setNewTaskCourse(e.target.value)}
                />
              </div>
              
              <div className="input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Due Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={newTaskDate}
                  onChange={e => setNewTaskDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" style={{ marginTop: '8px', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)' }}>
              <Plus size={18} /> Save Task
            </button>
          </form>
        </div>

        {/* Task Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#f59e0b" /> Upcoming Deadlines
              </div>
              <span style={{ fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>{pendingTasks.length}</span>
            </h2>
            
            {pendingTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '0.9rem' }}>
                <p>No upcoming tasks. You are all caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingTasks.map((task) => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    <button onClick={() => toggleTask(task.id)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                      <Circle size={26} color="#94a3b8" />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          <BookOpen size={10} style={{ display: 'inline', marginRight: '4px' }} />{task.course}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: task.deadline < new Date().toISOString().split('T')[0] ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarIcon size={12} /> {getDaysLeft(task.deadline)}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0.8 }}>
              <h2 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" /> Completed
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedTasks.map((task) => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px' }}>
                    <button onClick={() => toggleTask(task.id)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                      <CheckCircle2 size={24} color="#10b981" />
                    </button>
                    <div style={{ flex: 1, textDecoration: 'line-through', color: '#64748b', fontSize: '0.95rem' }}>
                      {task.title}
                    </div>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
