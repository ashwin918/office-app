import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [progressForm, setProgressForm] = useState({ completion_percentage: 0, notes: '' });
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('all');

  const fetchTasks = useCallback(async () => {
    const res = await axios.get(`/api/tasks/employee/${user.id}`);
    setTasks(res.data);
  }, [user.id]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openUpdate = (task) => {
    setUpdating(task);
    setProgressForm({ completion_percentage: task.completion_percentage, notes: task.notes || '' });
  };

  const submitProgress = async (e) => {
    e.preventDefault();
    await axios.patch(`/api/tasks/${updating.id}/progress`, progressForm);
    setMsg('✅ Progress updated!');
    setUpdating(null);
    fetchTasks();
    setTimeout(() => setMsg(''), 3000);
  };

  const priorityColor = { high: '#e53e3e', medium: '#d97706', low: '#38a169' };
  const statusColor = { pending: '#718096', in_progress: '#3182ce', completed: '#38a169' };
  const statusBg = { pending: '#f7fafc', in_progress: '#ebf8ff', completed: '#f0fff4' };

  const filtered = tab === 'all' ? tasks : tasks.filter(t => t.status === tab);
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    avgPct: tasks.length ? Math.round(tasks.reduce((a, t) => a + t.completion_percentage, 0) / tasks.length) : 0,
  };

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>🏢 OfficePro</div>
          <div style={s.userInfo}>
            <div style={s.avatar}>👤</div>
            <div>
              <div style={s.userName}>{user.full_name}</div>
              <div style={s.userRole}>{user.department || 'Employee'}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '24px 20px' }}>
          <div style={s.sideStatCard}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.total}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Total Tasks</div>
          </div>
          <div style={s.sideStatCard}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.avgPct}%</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Avg Completion</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={logout}>🚪 Logout</button>
      </div>

      {/* Main */}
      <div style={s.main}>
        {msg && <div style={s.toast}>{msg}</div>}

        <div style={s.header}>
          <div>
            <h2 style={s.pageTitle}>My Tasks</h2>
            <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Hello, {user.full_name}! Here are your assigned tasks.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={s.statsRow}>
          {[
            { label: 'Pending', value: stats.pending, color: '#718096', icon: '⏳' },
            { label: 'In Progress', value: stats.in_progress, color: '#3182ce', icon: '⚙️' },
            { label: 'Completed', value: stats.completed, color: '#38a169', icon: '✅' },
          ].map((st, i) => (
            <div key={i} style={{ ...s.statCard, borderLeft: `4px solid ${st.color}` }}>
              <span style={{ fontSize: 24 }}>{st.icon}</span>
              <div style={{ marginLeft: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: st.color }}>{st.value}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={s.filterTabs}>
          {[['all', 'All Tasks'], ['pending', 'Pending'], ['in_progress', 'In Progress'], ['completed', 'Completed']].map(([key, label]) => (
            <button key={key} style={tab === key ? { ...s.filterBtn, ...s.filterActive } : s.filterBtn} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Task Cards */}
        {filtered.length === 0 ? (
          <div style={s.empty}>🎉 No tasks here! {tab === 'all' ? 'Your admin will assign tasks soon.' : `No ${tab.replace('_', ' ')} tasks.`}</div>
        ) : (
          <div style={s.taskGrid}>
            {filtered.map(task => (
              <div key={task.id} style={s.taskCard}>
                <div style={s.taskHeader}>
                  <h3 style={s.taskTitle}>{task.title}</h3>
                  <span style={{ ...s.badge, color: priorityColor[task.priority], background: priorityColor[task.priority] + '15' }}>{task.priority}</span>
                </div>

                {task.description && <p style={s.taskDesc}>{task.description}</p>}

                <div style={s.taskMeta}>
                  <span style={{ ...s.badge, color: statusColor[task.status], background: statusBg[task.status] }}>{task.status.replace('_', ' ')}</span>
                  {task.due_date && <span style={s.dueDateTag}>📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                </div>

                {task.assigned_by_name && (
                  <div style={s.assignedBy}>Assigned by: <strong>{task.assigned_by_name}</strong></div>
                )}

                {/* Progress Bar */}
                <div style={{ margin: '12px 0 4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 6 }}>
                    <span>Completion</span>
                    <strong style={{ color: task.completion_percentage === 100 ? '#38a169' : '#333' }}>{task.completion_percentage}%</strong>
                  </div>
                  <div style={s.progTrack}>
                    <div style={{ ...s.progFill, width: `${task.completion_percentage}%`, background: task.completion_percentage === 100 ? '#38a169' : 'linear-gradient(90deg, #3182ce, #63b3ed)' }} />
                  </div>
                </div>

                {task.notes && (
                  <div style={s.notesBox}><strong>Notes:</strong> {task.notes}</div>
                )}

                <button style={s.updateBtn} onClick={() => openUpdate(task)}>
                  ✏️ Update Progress
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Update Modal */}
        {updating && (
          <div style={s.modal}>
            <div style={s.modalCard}>
              <h3 style={{ margin: '0 0 6px', color: '#1e3a5f' }}>Update Task Progress</h3>
              <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>{updating.title}</p>
              <form onSubmit={submitProgress}>
                <div style={s.field}>
                  <label style={s.label}>Completion Percentage: <strong>{progressForm.completion_percentage}%</strong></label>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={progressForm.completion_percentage}
                    onChange={e => setProgressForm({ ...progressForm, completion_percentage: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: 8, accentColor: '#3182ce' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginTop: 4 }}>
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>

                {/* Big percentage display */}
                <div style={{ textAlign: 'center', margin: '16px 0', fontSize: 48, fontWeight: 800, color: progressForm.completion_percentage === 100 ? '#38a169' : '#3182ce' }}>
                  {progressForm.completion_percentage}%
                </div>

                <div style={s.field}>
                  <label style={s.label}>Notes / Comments</label>
                  <textarea
                    style={{ ...s.input, height: 100, resize: 'vertical' }}
                    placeholder="Add any notes or comments about your progress..."
                    value={progressForm.notes}
                    onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
                  />
                </div>

                <div style={s.modalBtns}>
                  <button type="button" style={s.cancelBtn} onClick={() => setUpdating(null)}>Cancel</button>
                  <button type="submit" style={s.primaryBtn}>Save Progress</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f4f6fa' },
  sidebar: { width: 240, background: 'linear-gradient(180deg, #1e3a5f 0%, #2d5f8f 100%)', display: 'flex', flexDirection: 'column', padding: 0, position: 'fixed', height: '100vh' },
  sideTop: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  brand: { color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { fontSize: 28, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userName: { color: '#fff', fontWeight: 600, fontSize: 14 },
  userRole: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  sideStatCard: { background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 },
  logoutBtn: { margin: '12px', padding: '11px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', marginTop: 'auto' },
  main: { flex: 1, marginLeft: 240, padding: 32 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1e3a5f' },
  statsRow: { display: 'flex', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, background: '#fff', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  filterTabs: { display: 'flex', gap: 8, marginBottom: 24 },
  filterBtn: { padding: '8px 18px', border: '1.5px solid #e0e0e0', borderRadius: 20, background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: '#555' },
  filterActive: { background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
  taskCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskTitle: { margin: 0, fontSize: 16, fontWeight: 600, color: '#1e3a5f', flex: 1, marginRight: 8 },
  taskDesc: { margin: '0 0 10px', fontSize: 13, color: '#555', lineHeight: 1.5 },
  taskMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' },
  dueDateTag: { fontSize: 12, color: '#666', padding: '3px 8px', background: '#f8f8f8', borderRadius: 20 },
  assignedBy: { fontSize: 12, color: '#888', marginBottom: 8 },
  progTrack: { height: 10, background: '#eee', borderRadius: 5, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 5, transition: 'width 0.4s ease' },
  notesBox: { background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#444', marginTop: 10 },
  updateBtn: { width: '100%', marginTop: 14, padding: '10px', background: '#ebf8ff', color: '#2b6cb0', border: '1.5px solid #bee3f8', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#888', fontSize: 16, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460 },
  modalBtns: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 13 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  primaryBtn: { padding: '10px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { padding: '10px 20px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  toast: { position: 'fixed', top: 20, right: 20, background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749', padding: '12px 20px', borderRadius: 8, zIndex: 2000, fontWeight: 500, fontSize: 14 },
};
