"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAttendance } from '@/app/actions';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('srm_token');
}

type CourseGrade = {
  id: string;
  name: string;
  credits: number;
  grade: string;
};

const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'W': 0,
  'F': 0,
  'Ab': 0,
  'I': 0,
  '*': 0
};

export default function CalculatorPage() {
  const [courses, setCourses] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initCourses = async () => {
      const token = getToken();
      if (!token) {
         setCourses([{ id: '1', name: 'Please login first', credits: 0, grade: 'O' }]);
         setLoading(false);
         return;
      }
      try {
        const attData = await fetchAttendance(token, false);
        if (attData?.data?.length > 0) {
          const fetched = attData.data.map((subject: any, idx: number) => {
             // Heuristic: 'J' suffix courses in SRM indicate integrated Theory+Lab (typically 4 credits). Others are default 3.
             const defaultCredits = subject.courseCode?.endsWith('J') ? 4 : 3;
             return {
               id: Date.now().toString() + idx,
               name: subject.courseTitle || subject.courseCode,
               credits: defaultCredits,
               grade: 'A' // default
             };
          });
          setCourses(fetched);
        } else {
          setCourses([
            { id: '1', name: 'Data Structures', credits: 3, grade: 'O' },
          ]);
        }
      } catch (err) {
         setCourses([{ id: '1', name: 'Failed to sync', credits: 3, grade: 'A' }]);
      } finally {
         setLoading(false);
      }
    };
    initCourses();
  }, []);
  const [targetCgpa, setTargetCgpa] = useState<string>('');
  
  const [pastCredits, setPastCredits] = useState<string>('0');
  const [pastCgpa, setPastCgpa] = useState<string>('0');

  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: `Course ${courses.length + 1}`, credits: 3, grade: 'A' }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof CourseGrade, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // SGPA Calculation
  let totalCurrentCredits = 0;
  let earnedPoints = 0;
  
  courses.forEach(c => {
    if (c.credits > 0) {
      totalCurrentCredits += c.credits;
      earnedPoints += c.credits * (GRADE_POINTS[c.grade] || 0);
    }
  });

  const sgpa = totalCurrentCredits > 0 ? (earnedPoints / totalCurrentCredits).toFixed(2) : "0.00";

  // CGPA Calculation
  const parsedPastCredits = parseFloat(pastCredits) || 0;
  const parsedPastCgpa = parseFloat(pastCgpa) || 0;
  
  const totalOverallCredits = parsedPastCredits + totalCurrentCredits;
  let overallCgpa = "0.00";
  
  if (totalOverallCredits > 0) {
    const totalOverallPoints = (parsedPastCredits * parsedPastCgpa) + earnedPoints;
    overallCgpa = (totalOverallPoints / totalOverallCredits).toFixed(2);
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>GPA Simulator</h1>
        <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Dashboard</Link>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Left Column: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Past Academic History</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Total Earned Credits</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={pastCredits} 
                  onChange={e => setPastCredits(e.target.value)} 
                  min="0"
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Current CGPA</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={pastCgpa} 
                  onChange={e => setPastCgpa(e.target.value)} 
                  step="0.01" min="0" max="10"
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>Leave at 0 to calculate SGPA only.</p>
          </div>

          <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Current Semester Courses</h2>
                {loading ? <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>(Syncing...)</span> : <span style={{ fontSize: '0.8rem', color: '#10b981' }}>(Auto-synced)</span>}
              </div>
              <button 
                onClick={addCourse}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.map((course) => (
                <div key={course.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={course.name} 
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    style={{ padding: '8px', flex: 2 }}
                    placeholder="Course name"
                  />
                  <input 
                    type="number" 
                    className="input-field" 
                    value={course.credits} 
                    onChange={(e) => updateCourse(course.id, 'credits', parseInt(e.target.value) || 0)}
                    style={{ padding: '8px', flex: 1, minWidth: '60px' }}
                    min="1" max="10"
                  />
                  <select 
                    className="input-field"
                    value={course.grade}
                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                    style={{ padding: '8px', flex: 1, minWidth: '70px', appearance: 'none' }}
                  >
                    {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g} style={{ color: 'black' }}>{g}</option>)}
                  </select>
                  <button 
                    onClick={() => removeCourse(course.id)}
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer' }}
                  >!</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', textAlign: 'center', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '8px' }}>Estimated SGPA</p>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {sgpa}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>For {totalCurrentCredits} credits</p>
            </div>
            
            <div style={{ height: '1px', background: 'var(--glass-border)', width: '100%' }}></div>
            
            <div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '8px' }}>New Expected CGPA</p>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                {overallCgpa}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Total {totalOverallCredits} credits</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
