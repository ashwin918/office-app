import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [empForm, setEmpForm] = useState({ username: '', password: '', full_name: '', email: '', department: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    const [empRes, taskRes, statsRes] = await Promise.all([
      API.get('/api/employees'),
      API.get('/api/tasks'),
      API.get('/api/stats'),
    ]);
    setEmployees(empRes.data);
    setTasks(taskRes.data);
    setStats(statsRes.data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showMsg = (m, isError = false) => {
    if (isError) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setError(''); }, 3000);
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/employees', empForm);
      showMsg('✅ Employee added successfully!');
      setShowAddEmp(false);
      setEmpForm({ username: '', password: '', full_name: '', email: '', department: '' });
      fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to add employee', true);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await API.delete(`/api/employees/${id}`);
    showMsg('Employee removed');
    fetchAll();
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/tasks', { ...taskForm, assigned_by: user.id });
      showMsg('✅ Task assigned successfully!');
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
      fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to assign task', true);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await API.delete(`/api/tasks/${id}`);
    showMsg('Task deleted');
    fetchAll();
  };

  const priorityColor = { high: '#e53e3e', medium: '#d97706', low: '#38a169' };
  const statusColor = { pending: '#718096', in_progress: '#3182ce', completed: '#38a169' };
  const statusBg = { pending: '#f7fafc', in_progress: '#ebf8ff', completed: '#f0fff4' };

  return (
    <div style={s.root}>
      <div style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>🏢 OfficePro</div>
          <div style={s.userInfo}>
            <div style={s.avatar}>👤</div>
            <div>
              <div style={s.userName}>{user.full_name}</div>
              <div style={s.userRole}>Administrator</div>
            </div>
          </div>
        </div>
        <nav style={s.nav}>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'employees', icon: '👥', label: 'Employees' },
            { key: 'tasks', icon: '📋', label: 'Tasks' },
          ].map(item => (
            <button key={item.key} style={tab === item.key ? { ...s.navBtn, ...s.navActive } : s.navBtn} onClick={() => setTab(item.key)}>
              <span style={{ marginRight: 10 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <button style={s.logoutBtn} onClick={logout}>🚪 Logout</button>
      </div>

      <div style={s.main}>
        {msg && <div style={s.toast}>{msg}</div>}
        {error && <div style={{ ...s.toast, background: '#fff3f3', borderColor: '#ffcccc', color: '#cc0000' }}>{error}</div>}

        {tab === 'dashboard' && (
          <div>
            <h2 style={s.pageTitle}>Dashboard Overview</h2>
            <div style={s.statsGrid}>
              {[
                { label: 'Total Employees', value: stats.employees || 0, icon: '👥', color: '#3182ce' },
                { label: 'Total Tasks', value: stats.total || 0, icon: '📋', color: '#805ad5' },
                { label: 'Completed', value: stats.completed || 0, icon: '✅', color: '#38a169' },
                { label: 'In Progress', value: stats.in_progress || 0, icon: '⚙️', color: '#d97706' },
                { label: 'Pending', value: stats.pending || 0, icon: '⏳', color: '#718096' },
                { label: 'Avg Completion', value: `${stats.avg_completion || 0}%`, icon: '📈', color: '#e53e3e' },
              ].map((stat, i) => (
                <div key={i} style={s.statCard}>
                  <div style={{ ...s.statIcon, background: stat.color + '20', color: stat.color }}>{stat.icon}</div>
                  <div style={s.statValue}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ ...s.pageTitle, fontSize: 18, marginTop: 32 }}>Recent Tasks</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.theadRow}>
                    {['Task', 'Assigned To', 'Priority', 'Status', 'Progress'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 8).map(t => (
                    <tr key={t.id} style={s.trow}>
                      <td style={s.td}><strong>{t.title}</strong></td>
                      <td style={s.td}>{t.assigned_to_name || '—'}</td>
                      <td style={s.td}><span style={{ ...s.badge, color: priorityColor[t.priority], background: priorityColor[t.priority] + '15' }}>{t.priority}</span></td>
                      <td style={s.td}><span style={{ ...s.badge, color: statusColor[t.status], background: statusBg[t.status] }}>{t.status.replace('_', ' ')}</span></td>
                      <td style={s.td}>
                        <div style={s.progressWrap}>
                          <div style={{ ...s.progressBar, width: `${t.completion_percentage}%`, background: t.completion_percentage === 100 ? '#38a169' : '#3182ce' }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#555' }}>{t.completion_percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'employees' && (
          <div>
            <div style={s.tabHeader}>
              <h2 style={s.pageTitle}>Employees</h2>
              <button style={s.primaryBtn} onClick={() => setShowAddEmp(true)}>+ Add Employee</button>
            </div>
            {showAddEmp && (
              <div style={s.modal}>
                <div style={s.modalCard}>
                  <h3 style={{ margin: '0 0 20px', color: '#1e3a5f' }}>Add New Employee</h3>
                  <form onSubmit={addEmployee}>
                    {[
                      { label: 'Full Name *', key: 'full_name', type: 'text', placeholder: 'John Doe' },
                      { label: 'Username *', key: 'username', type: 'text', placeholder: 'john.doe' },
                      { label: 'Password *', key: 'password', type: 'text', placeholder: 'Set a password' },
                      { label: 'Email', key: 'email', type: 'email', placeholder: 'john@company.com' },
                      { label: 'Department', key: 'department', type: 'text', placeholder: 'e.g. Sales, HR' },
                    ].map(f => (
                      <div key={f.key} style={s.field}>
                        <label style={s.label}>{f.label}</label>
                        <input style={s.input} type={f.type} placeholder={f.placeholder}
                          value={empForm[f.key]} onChange={e => setEmpForm({ ...empForm, [f.key]: e.target.value })}
                          required={f.label.includes('*')} />
                      </div>
                    ))}
                    <div style={s.modalBtns}>
                      <button type="button" style={s.cancelBtn} onClick={() => setShowAddEmp(false)}>Cancel</button>
                      <button type="submit" style={s.primaryBtn}>Add Employee</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.theadRow}>
                    {['Name', 'Username', 'Email', 'Department', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} style={s.trow}>
                      <td style={s.td}><strong>{emp.full_name}</strong></td>
                      <td style={s.td}><code style={s.code}>{emp.username}</code></td>
                      <td style={s.td}>{emp.email || '—'}</td>
                      <td style={s.td}>{emp.department || '—'}</td>
                      <td style={s.td}>{new Date(emp.created_at).toLocaleDateString()}</td>
                      <td style={s.td}><button style={s.dangerBtn} onClick={() => deleteEmployee(emp.id)}>🗑 Remove</button></td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#999', padding: 32 }}>No employees yet. Add one!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            <div style={s.tabHeader}>
              <h2 style={s.pageTitle}>Tasks</h2>
              <button style={s.primaryBtn} onClick={() => setShowAddTask(true)}>+ Assign Task</button>
            </div>
            {showAddTask && (
              <div style={s.modal}>
                <div style={s.modalCard}>
                  <h3 style={{ margin: '0 0 20px', color: '#1e3a5f' }}>Assign New Task</h3>
                  <form onSubmit={addTask}>
                    <div style={s.field}>
                      <label style={s.label}>Task Title *</label>
                      <input style={s.input} type="text" placeholder="Task title" value={taskForm.title}
                        onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Description</label>
                      <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} placeholder="Task description..."
                        value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Assign To *</label>
                      <select style={s.input} value={taskForm.assigned_to}
                        onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })} required>
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.username})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ ...s.field, flex: 1 }}>
                        <label style={s.label}>Priority</label>
                        <select style={s.input} value={taskForm.priority}
                          onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div style={{ ...s.field, flex: 1 }}>
                        <label style={s.label}>Due Date</label>
                        <input style={s.input} type="date" value={taskForm.due_date}
                          onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                      </div>
                    </div>
                    <div style={s.modalBtns}>
                      <button type="button" style={s.cancelBtn} onClick={() => setShowAddTask(false)}>Cancel</button>
                      <button type="submit" style={s.primaryBtn}>Assign Task</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.theadRow}>
                    {['Title', 'Assigned To', 'Priority', 'Status', 'Progress', 'Due Date', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id} style={s.trow}>
                      <td style={s.td}>
                        <strong>{t.title}</strong>
                        {t.description && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{t.description.slice(0, 50)}{t.description.length > 50 ? '...' : ''}</div>}
                      </td>
                      <td style={s.td}>{t.assigned_to_name || '—'}</td>
                      <td style={s.td}><span style={{ ...s.badge, color: priorityColor[t.priority], background: priorityColor[t.priority] + '15' }}>{t.priority}</span></td>
                      <td style={s.td}><span style={{ ...s.badge, color: statusColor[t.status], background: statusBg[t.status] }}>{t.status.replace('_', ' ')}</span></td>
                      <td style={s.td}>
                        <div style={s.progressWrap}>
                          <div style={{ ...s.progressBar, width: `${t.completion_percentage}%`, background: t.completion_percentage === 100 ? '#38a169' : '#3182ce' }} />
                        </div>
                        <span style={{ fontSize: 12 }}>{t.completion_percentage}%</span>
                      </td>
                      <td style={s.td}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                      <td style={s.td}><button style={s.dangerBtn} onClick={() => deleteTask(t.id)}>🗑</button></td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#999', padding: 32 }}>No tasks yet. Assign one!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f4f6fa' },
  sidebar: { width: 240, background: 'linear-gradient(180deg, #1e3a5f 0%, #2d5f8f 100%)', display: 'flex', flexDirection: 'column', padding: '0', position: 'fixed', height: '100vh', overflowY: 'auto' },
  sideTop: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  brand: { color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { fontSize: 28, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userName: { color: '#fff', fontWeight: 600, fontSize: 14 },
  userRole: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  nav: { flex: 1, padding: '16px 12px' },
  navBtn: { display: 'flex', alignItems: 'center', width: '100%', padding: '11px 14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: 'pointer', marginBottom: 4, textAlign: 'left' },
  navActive: { background: 'rgba(255,255,255,0.18)', color: '#fff' },
  logoutBtn: { margin: '12px', padding: '11px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
  main: { flex: 1, marginLeft: 240, padding: 32, maxWidth: '100%', overflowX: 'auto' },
  pageTitle: { margin: '0 0 24px', fontSize: 22, fontWeight: 700, color: '#1e3a5f' },
  tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 },
  statCard: { background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: 24, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontWeight: 700 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1e3a5f' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #eee' },
  trow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: 14, color: '#333', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' },
  progressWrap: { height: 8, background: '#eee', borderRadius: 4, marginBottom: 4, width: 100, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  code: { background: '#f0f4f8', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' },
  primaryBtn: { padding: '10px 20px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { padding: '10px 20px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  dangerBtn: { padding: '6px 12px', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' },
  modalBtns: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 13 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  toast: { position: 'fixed', top: 20, right: 20, background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749', padding: '12px 20px', borderRadius: 8, zIndex: 2000, fontWeight: 500, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
};