import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { PILLAR_BADGES, PILLAR_SHORT } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { CheckSquare, Plus, Check, Circle, Loader, Edit3, X, Clock, AlertCircle, Lightbulb } from 'lucide-react';

const TYPES = ['all', 'daily', 'project', 'deadline'];
const STATUSES = ['all', 'pending', 'in_progress', 'completed'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [reflectionModal, setReflectionModal] = useState(null);
  const [reflection, setReflection] = useState('');
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', type: 'project', pillar_id: '', estimated_time: '', notes: '', deadline: ''
  });

  useEffect(() => {
    loadTasks();
    api.get('/dashboard').then(d => setPillars(d.pillars || []));
    window.addEventListener('close-modal', closeModals);
    if (searchParams.get('new') === '1') setShowModal(true);
    return () => window.removeEventListener('close-modal', closeModals);
  }, []);

  const closeModals = () => { setShowModal(false); setReflectionModal(null); };

  const loadTasks = () => {
    api.get('/tasks').then(data => { setTasks(data); setLoading(false); });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      pillar_id: form.pillar_id ? parseInt(form.pillar_id) : null,
      estimated_time: form.estimated_time ? parseInt(form.estimated_time) : null,
      deadline: form.deadline || null,
    };
    if (editTask) {
      await api.put(`/tasks/${editTask.id}`, payload);
      toast.success('Task updated');
    } else {
      await api.post('/tasks', payload);
      toast.success('Task created');
    }
    setShowModal(false);
    setEditTask(null);
    setForm({ title: '', type: 'project', pillar_id: '', estimated_time: '', notes: '', deadline: '' });
    loadTasks();
  };

  const handleComplete = async () => {
    if (!reflection.trim()) return;
    await api.put(`/tasks/${reflectionModal.id}`, { status: 'completed', completion_reflection: reflection });
    toast.success(`"${reflectionModal.title}" completed!`);
    setReflectionModal(null);
    setReflection('');
    loadTasks();
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    toast.info('Task deleted');
    loadTasks();
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({ title: task.title, type: task.type, pillar_id: task.pillar_id || '', estimated_time: task.estimated_time || '', notes: task.notes || '', deadline: task.deadline || '' });
    setShowModal(true);
  };

  const filtered = tasks.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };

  const StatusIcon = ({ status }) => {
    if (status === 'completed') return <Check size={12} strokeWidth={2.5} />;
    if (status === 'in_progress') return <Loader size={12} strokeWidth={2} />;
    return <Circle size={12} strokeWidth={1.5} />;
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1><CheckSquare size={22} strokeWidth={1.8} /> Tasks</h1></div>
        {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-block" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1><CheckSquare size={22} strokeWidth={1.8} /> Tasks</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditTask(null);
          setForm({ title: '', type: 'project', pillar_id: '', estimated_time: '', notes: '', deadline: '' });
          setShowModal(true);
        }}>
          <Plus size={15} /> New Task
        </button>
      </div>

      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="flex mb-6" style={{ gap: 6, flexWrap: 'wrap' }}>
        {TYPES.map(t => (
          <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType(t)}>
            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span style={{ width: 1, background: 'var(--border-color)', margin: '0 4px' }} />
        {STATUSES.map(s => (
          <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="tasks-grid mb-6">
        {filtered.length === 0 && <p className="text-muted text-sm" style={{ gridColumn: '1 / -1' }}>No tasks match your filters.</p>}
        {filtered.map((task, i) => (
          <div key={task.id} className="card" style={{ padding: '16px 20px', animation: `slideUp 0.35s ease ${i * 0.05}s forwards`, opacity: 0 }}>
            {/* Top row: Badges and Title */}
            <div className="flex items-center justify-between mb-3">
              <span className={`badge badge-status-${task.status}`}>
                <StatusIcon status={task.status} /> {task.status.replace('_', ' ')}
              </span>
              <div className="flex" style={{ gap: 4 }}>
                {task.status !== 'completed' && (
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-teal)', padding: '4px 8px' }}
                    onClick={() => { setReflectionModal(task); setReflection(''); }}
                    title="Mark Complete">
                    <Check size={14} />
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => openEdit(task)} title="Edit">
                  <Edit3 size={13} />
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)', padding: '4px 8px' }}
                  onClick={() => handleDelete(task.id)} title="Delete">
                  <X size={14} />
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              {task.title}
            </h3>

            {/* Meta tags wrapping properly below title */}
            <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 16 }}>
              {task.pillar_name && (
                <span className={`badge ${PILLAR_BADGES[task.pillar_name] || ''}`}>{PILLAR_SHORT[task.pillar_name]}</span>
              )}
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{task.type}</span>
              
              {task.deadline && (
                <span className="badge" style={{ background: 'rgba(245,119,153,0.1)', color: 'var(--accent-red)' }}>
                  <AlertCircle size={11} strokeWidth={2.5} /> {task.deadline}
                </span>
              )}
              {task.estimated_time && (
                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  <Clock size={11} strokeWidth={2.5} /> {task.estimated_time}m
                </span>
              )}
            </div>

            {/* Content that stretches (Notes & Reflections) */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {task.notes && (
                <div style={{ background: 'rgba(255,247,205,0.03)', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {task.notes}
                </div>
              )}
              {task.completion_reflection && (
                <div style={{ background: 'rgba(11,214,161,0.08)', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid rgba(11,214,161,0.15)', fontSize: '0.85rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Lightbulb size={14} style={{ marginTop: 2, flexShrink: 0 }} /> 
                  <span>{task.completion_reflection}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => {
        setEditTask(null);
        setForm({ title: '', type: 'project', pillar_id: '', estimated_time: '', notes: '', deadline: '' });
        setShowModal(true);
      }}><Plus size={22} /></button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editTask ? <><Edit3 size={18} /> Edit Task</> : <><Plus size={18} /> New Task</>}</h2>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What do you need to do?" autoFocus />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="daily">Daily Habit</option>
                  <option value="project">Project Task</option>
                  <option value="deadline">Deadline Task</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pillar</label>
                <select value={form.pillar_id} onChange={e => setForm({ ...form, pillar_id: e.target.value })}>
                  <option value="">None</option>
                  {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Estimated Time (min)</label>
                <input type="number" value={form.estimated_time} onChange={e => setForm({ ...form, estimated_time: e.target.value })} placeholder="e.g., 90" />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional context..." />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editTask ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </div>
        </div>
      )}

      {reflectionModal && (
        <div className="modal-overlay" onClick={() => setReflectionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2><Check size={18} /> Complete: {reflectionModal.title}</h2>
            <p className="text-sm text-muted mb-6">Reflect on what you accomplished before marking this done.</p>
            <div className="form-group">
              <label>Completion Reflection *</label>
              <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="What did you learn? What went well?" autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setReflectionModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleComplete} disabled={!reflection.trim()}>
                <Check size={14} /> Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
