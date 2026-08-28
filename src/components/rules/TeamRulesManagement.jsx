import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  Sliders, 
  Layers, 
  Download, 
  Share2, 
  Info,
  ShieldAlert,
  ClipboardList,
  Edit3,
  X,
  FileCode,
  ListOrdered,
  Zap,
  CloudCheck,
  CloudAlert,
  RotateCcw
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Modal } from '../common/Modal';
import './TeamRulesManagement.css';

const DEFAULT_SEMAPHORE_RULES = [
  "A team should consist of a maximum of 15 members.",
  "The fest is open to all MCA students.",
  "Teams must confirm their participation through our website: semaphore2k26.in",
  "The registration fee is ₹2000 per team.",
  "All participants must be present before 8:00 AM.",
  "The overall championship will be decided based on the cumulative participation of each team across all events.",
  "For the Fashion show event, anyone from other events can join. But those in IT Manager and Photography can't join any other events.",
  "Participants are required to produce their college ID on the fest day.",
  "All participants must be available on campus for both days of the event.",
  "The department/convenor reserves the right to take action in case of any misconduct.",
  "The decisions of the judges will be final and binding.",
  "For any issues regarding the payment of registration fees, please contact the core committee members.",
  "A cash prize and trophy will be awarded to the overall champions and runners-up.",
  "Participants must bring a permission letter from their respective colleges.",
  "Participants must bring accessories such as pens, laptops, chargers, etc. themselves.",
  "NOTE: The rules may be changed by the authorities at any time if necessary. Any changes will be notified."
];

export const TeamRulesManagement = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Data states
  const [ruleSets, setRuleSets] = useState([]);
  const [selectedRuleSetId, setSelectedRuleSetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Auto-Save feature state (default ON)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('semaphore_rules_autosave');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'unsaved' | 'local_only'

  // Current editing form state
  const [formData, setFormData] = useState({
    id: null,
    title: 'Semaphore 2026 - Team Rules & Guidelines',
    description: 'Official pointwise rules and guidelines for all participating teams and college contingents.',
    category: 'general',
    rules: [...DEFAULT_SEMAPHORE_RULES],
    isActive: true,
    createdAt: null,
    updatedAt: null
  });

  // UI States
  const [newRuleText, setNewRuleText] = useState('');
  const [bottomRuleText, setBottomRuleText] = useState('');
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview' | 'split'
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetCategory, setNewSetCategory] = useState('general');
  const [newSetTitle, setNewSetTitle] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Ref to debounce auto-save
  const autoSaveTimerRef = useRef(null);
  const rulesListBottomRef = useRef(null);

  // Helper to persist draft locally
  const persistDraftLocally = (updatedData) => {
    try {
      localStorage.setItem('semaphore_team_rules_cache', JSON.stringify(updatedData));
      const customSets = JSON.parse(localStorage.getItem('semaphore_custom_team_rules') || '[]');
      const targetId = updatedData.id || 'default_rules_set';
      const exists = customSets.some(s => (s._id || s.id) === targetId);
      const updatedCustom = exists
        ? customSets.map(s => ((s._id || s.id) === targetId ? { ...s, ...updatedData } : s))
        : [updatedData, ...customSets];
      localStorage.setItem('semaphore_custom_team_rules', JSON.stringify(updatedCustom));
    } catch (e) {
      console.warn('Failed to persist rules locally:', e);
    }
  };

  // Perform background server sync
  const performSave = useCallback(async (dataToSave, isAuto = false) => {
    if (!dataToSave.title.trim()) return;
    if (dataToSave.rules.length === 0) return;

    if (!isAuto) setSaving(true);
    setSyncStatus('saving');

    try {
      const payload = {
        title: dataToSave.title.trim(),
        description: (dataToSave.description || '').trim(),
        category: dataToSave.category || 'general',
        rules: dataToSave.rules.map(r => r.trim()).filter(Boolean),
        isActive: dataToSave.isActive !== undefined ? dataToSave.isActive : true
      };

      // Always ensure local persistence
      persistDraftLocally({ ...dataToSave, ...payload });

      const result = await apiService.updateTeamRules(dataToSave.id, payload);

      if (result) {
        setFormData(prev => ({
          ...prev,
          id: result._id || result.id || prev.id,
          updatedAt: result.updatedAt || new Date().toISOString()
        }));
      }

      setHasUnsavedChanges(false);
      setSyncStatus('synced');

      if (!isAuto) {
        showSuccess('Team rules saved and published to live server!');
      }

      // Background refresh of set list
      apiService.getAllTeamRules().then(updatedList => {
        if (Array.isArray(updatedList) && updatedList.length > 0) {
          setRuleSets(updatedList);
        }
      }).catch(() => null);

    } catch (err) {
      console.warn('Backend save encountered issue, saved to local cache:', err);
      setSyncStatus('local_only');
      if (!isAuto) {
        showWarning('Saved locally! Server sync will retry automatically.');
      }
    } finally {
      if (!isAuto) setSaving(false);
    }
  }, [showSuccess, showWarning]);

  // Trigger auto-save debounce
  const triggerAutoSave = useCallback((updatedForm) => {
    persistDraftLocally(updatedForm);
    if (!autoSaveEnabled) {
      setHasUnsavedChanges(true);
      setSyncStatus('unsaved');
      return;
    }

    setSyncStatus('saving');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performSave(updatedForm, true);
    }, 700);
  }, [autoSaveEnabled, performSave]);

  // Toggle Auto-save
  const handleToggleAutoSave = (checked) => {
    setAutoSaveEnabled(checked);
    try {
      localStorage.setItem('semaphore_rules_autosave', String(checked));
    } catch {}
    if (checked && hasUnsavedChanges) {
      performSave(formData, true);
      showInfo('Auto-Save enabled: changes synchronized.');
    } else {
      showInfo(checked ? 'Auto-Save is now active.' : 'Auto-Save turned off. Use "Save & Publish" manually.');
    }
  };

  // Browser navigation safety
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !autoSaveEnabled) {
        e.preventDefault();
        e.returnValue = 'You have unsaved rule changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, autoSaveEnabled]);

  // Fetch Team Rules from Backend / Cache
  const fetchRules = async () => {
    setLoading(true);
    try {
      const allSets = await apiService.getAllTeamRules();
      if (Array.isArray(allSets) && allSets.length > 0) {
        setRuleSets(allSets);
        const current = allSets.find(s => (s._id || s.id) === selectedRuleSetId) || allSets[0];
        loadRuleSetIntoForm(current);
      } else {
        const single = await apiService.getTeamRules();
        if (single && (single.rules || single.title)) {
          setRuleSets([single]);
          loadRuleSetIntoForm(single);
        } else {
          // Check local cache
          const cached = JSON.parse(localStorage.getItem('semaphore_team_rules_cache') || 'null');
          if (cached && Array.isArray(cached.rules) && cached.rules.length > 0) {
            setRuleSets([cached]);
            loadRuleSetIntoForm(cached);
          } else {
            setFormData({
              id: null,
              title: 'Semaphore 2026 - Team Rules & Guidelines',
              description: 'Official pointwise rules and guidelines for all participating teams and college contingents.',
              category: 'general',
              rules: [...DEFAULT_SEMAPHORE_RULES],
              isActive: true
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch rules from backend, using local defaults:', err);
      // Fallback to local cache if present
      const cached = JSON.parse(localStorage.getItem('semaphore_team_rules_cache') || 'null');
      if (cached) {
        setRuleSets([cached]);
        loadRuleSetIntoForm(cached);
      }
      showError(err.message || 'Failed to fetch rules from backend server.');
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
      setSyncStatus('synced');
    }
  };

  const loadRuleSetIntoForm = (ruleObj) => {
    if (!ruleObj) return;
    const ruleId = ruleObj._id || ruleObj.id || null;
    setSelectedRuleSetId(ruleId);
    
    // Check if local cache has newer rules for this set
    let rulesToUse = Array.isArray(ruleObj.rules) && ruleObj.rules.length > 0 ? [...ruleObj.rules] : [...DEFAULT_SEMAPHORE_RULES];
    try {
      const cached = JSON.parse(localStorage.getItem('semaphore_team_rules_cache') || 'null');
      if (cached && (cached._id === ruleId || cached.id === ruleId) && Array.isArray(cached.rules) && cached.rules.length >= rulesToUse.length) {
        rulesToUse = [...cached.rules];
      }
    } catch {}

    setFormData({
      id: ruleId,
      title: ruleObj.title || 'Semaphore 2026 - Team Rules & Guidelines',
      description: ruleObj.description || '',
      category: ruleObj.category || 'general',
      rules: rulesToUse,
      isActive: ruleObj.isActive !== undefined ? ruleObj.isActive : true,
      createdAt: ruleObj.createdAt || null,
      updatedAt: ruleObj.updatedAt || null
    });
    setHasUnsavedChanges(false);
    setSyncStatus('synced');
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Handle Input Changes
  const handleMetaChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      triggerAutoSave(updated);
      return updated;
    });
  };

  // Rule Item Operations
  const handleAddRule = (textToAdd, source = 'top') => {
    const cleanText = (textToAdd || (source === 'bottom' ? bottomRuleText : newRuleText)).trim();
    if (!cleanText) return;

    setFormData(prev => {
      const updatedRules = [...prev.rules, cleanText];
      const updatedForm = { ...prev, rules: updatedRules };
      triggerAutoSave(updatedForm);
      return updatedForm;
    });

    if (source === 'bottom') {
      setBottomRuleText('');
    } else {
      setNewRuleText('');
    }

    showSuccess(`Rule #${formData.rules.length + 1} added!`);

    // Smoothly scroll towards the newly added rule
    setTimeout(() => {
      if (rulesListBottomRef.current) {
        rulesListBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleUpdateRuleItem = (index, text) => {
    setFormData(prev => {
      const updated = [...prev.rules];
      updated[index] = text;
      const updatedForm = { ...prev, rules: updated };
      triggerAutoSave(updatedForm);
      return updatedForm;
    });
  };

  const handleDeleteRuleItem = (index) => {
    setFormData(prev => {
      const updated = prev.rules.filter((_, idx) => idx !== index);
      const updatedForm = { ...prev, rules: updated };
      triggerAutoSave(updatedForm);
      return updatedForm;
    });
    showInfo(`Removed rule #${index + 1}`);
  };

  const handleMoveRule = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= formData.rules.length) return;

    setFormData(prev => {
      const updated = [...prev.rules];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      const updatedForm = { ...prev, rules: updated };
      triggerAutoSave(updatedForm);
      return updatedForm;
    });
  };

  // Bulk Import Processing
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      showWarning('Please paste some text to import.');
      return;
    }

    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .map(line => line.replace(/^(\d+[\.\)]|\-|\*|•)\s*/, '').trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      showWarning('No valid rules found in the pasted content.');
      return;
    }

    setFormData(prev => {
      const updatedForm = {
        ...prev,
        rules: [...prev.rules, ...lines]
      };
      triggerAutoSave(updatedForm);
      return updatedForm;
    });

    setBulkText('');
    setShowBulkModal(false);
    showSuccess(`Imported ${lines.length} rules successfully!`);
  };

  // Reset to Fest Defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all rules to the official Semaphore 2026 default rules?')) {
      setFormData(prev => {
        const updatedForm = {
          ...prev,
          rules: [...DEFAULT_SEMAPHORE_RULES]
        };
        triggerAutoSave(updatedForm);
        return updatedForm;
      });
      showSuccess('Reset to default team rules.');
    }
  };

  // Explicit Save / Publish Handler
  const handleManualSave = () => {
    performSave(formData, false);
  };

  // Create New Rule Set
  const handleCreateNewSet = async (e) => {
    e.preventDefault();
    if (!newSetTitle.trim()) {
      showWarning('Please enter a title for the new rule set.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: newSetTitle.trim(),
        description: `Rules and guidelines for ${newSetCategory} events.`,
        category: newSetCategory,
        rules: ["Standard event rules apply. Reporting time is 30 minutes prior to event start."],
        isActive: true
      };

      const created = await apiService.createTeamRules(payload);
      showSuccess('New rule set created!');
      setShowCreateModal(false);
      setNewSetTitle('');
      await fetchRules();
      if (created) loadRuleSetIntoForm(created);
    } catch (err) {
      showError(err.message || 'Failed to create new rule set.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Rule Set
  const handleDeleteCurrentSet = async () => {
    if (!formData.id) {
      showWarning('Cannot delete an unsaved rule set.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete the "${formData.title}" rule set?`)) {
      setSaving(true);
      try {
        await apiService.deleteTeamRules(formData.id);
        showSuccess('Rule set deleted.');
        await fetchRules();
      } catch (err) {
        showError(err.message || 'Failed to delete rule set.');
      } finally {
        setSaving(false);
      }
    }
  };

  // Copy helpers
  const handleCopySingle = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
    showSuccess('Rule copied to clipboard.');
  };

  const handleCopyAllMarkdown = () => {
    const formatted = `# ${formData.title}\n\n${formData.description}\n\n${formData.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    showSuccess('All rules copied formatted in Markdown!');
  };

  const handleDownloadTxt = () => {
    const content = `${formData.title.toUpperCase()}\nCategory: ${formData.category}\nStatus: ${formData.isActive ? 'Active' : 'Inactive'}\n${'='.repeat(50)}\n\n${formData.description}\n\nPOINTWISE GUIDELINES:\n${formData.rules.map((r, i) => `[${i + 1}] ${r}`).join('\n\n')}\n\nGenerated from Semaphore 2026 Admin Portal`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Semaphore_2026_Team_Rules_${formData.category}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Downloaded rules as .txt file.');
  };

  return (
    <div className="team-rules-page">
      {/* Page Header */}
      <div className="rules-header-card">
        <div className="rules-header-top">
          <div className="rules-brand">
            <div className="rules-icon-badge">
              <BookOpen size={24} className="rules-main-icon" />
              <span className="icon-pulse-beacon" />
            </div>
            <div>
              <div className="rules-title-row">
                <h1 className="rules-heading">Team Rules & Guidelines</h1>
                <span className="rules-category-tag">{formData.category.toUpperCase()}</span>
                {formData.isActive ? (
                  <span className="status-pill status-active">
                    <span className="status-dot-active" /> Active on Live Portal
                  </span>
                ) : (
                  <span className="status-pill status-inactive">
                    <span className="status-dot-inactive" /> Draft / Hidden
                  </span>
                )}
                
                {/* Sync status indicator */}
                <div className={`sync-badge sync-${syncStatus}`}>
                  {syncStatus === 'synced' && <><CheckCircle2 size={13} /> <span>Saved to Server & Cache</span></>}
                  {syncStatus === 'saving' && <><RefreshCw size={13} className="spin-icon" /> <span>Syncing live...</span></>}
                  {syncStatus === 'unsaved' && <><AlertCircle size={13} /> <span>Unsaved changes</span></>}
                  {syncStatus === 'local_only' && <><Zap size={13} /> <span>Saved Locally</span></>}
                </div>
              </div>
              <p className="rules-subheading">
                Manage, publish, and structure official fest rules and pointwise team guidelines for Semaphore 2026.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="rules-header-actions">
            {/* Auto-Save Toggle */}
            <label className="autosave-header-toggle" title="Automatically save and publish changes as you type">
              <input 
                type="checkbox" 
                checked={autoSaveEnabled} 
                onChange={(e) => handleToggleAutoSave(e.target.checked)} 
              />
              <span className="autosave-toggle-slider" />
              <span className="autosave-toggle-label">
                <Zap size={13} className={autoSaveEnabled ? 'text-warning' : 'text-muted'} />
                <span>Auto-Save {autoSaveEnabled ? 'ON' : 'OFF'}</span>
              </span>
            </label>

            <button 
              className="btn btn-secondary rules-btn" 
              onClick={fetchRules}
              disabled={loading || saving}
              title="Refresh from server"
            >
              <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>

            <button 
              className="btn btn-secondary rules-btn"
              onClick={handleCopyAllMarkdown}
              title="Copy all rules as Markdown"
            >
              {copiedAll ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
            </button>

            <button 
              className="btn btn-secondary rules-btn"
              onClick={handleDownloadTxt}
              title="Download text document"
            >
              <Download size={16} />
              <span>Export .TXT</span>
            </button>

            <button 
              className={`btn btn-primary rules-btn ${hasUnsavedChanges ? 'pulse-save-btn' : ''}`}
              onClick={handleManualSave}
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{hasUnsavedChanges ? 'Publish Changes *' : 'Save & Publish'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Mode & Rule Sets Switcher Bar */}
        <div className="rules-toolbar-bar">
          <div className="rules-sets-selector">
            <span className="selector-label">
              <Layers size={14} /> Rule Sets ({ruleSets.length}):
            </span>
            <div className="rule-sets-chips">
              {ruleSets.map((rs, idx) => {
                const rsId = rs._id || rs.id || `set_${idx}`;
                const isSelected = selectedRuleSetId === rsId || (!selectedRuleSetId && idx === 0);
                return (
                  <button
                    key={rsId}
                    type="button"
                    className={`rule-set-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => loadRuleSetIntoForm(rs)}
                  >
                    <FileText size={13} />
                    <span>{rs.title || `Rules Set #${idx + 1}`}</span>
                    <span className="chip-count">{Array.isArray(rs.rules) ? rs.rules.length : 0}</span>
                  </button>
                );
              })}

              <button 
                type="button" 
                className="rule-set-chip chip-add"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={13} /> New Category Set
              </button>
            </div>
          </div>

          <div className="rules-view-tabs">
            <button 
              type="button" 
              className={`view-tab-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
            >
              <Edit3 size={14} /> Editor
            </button>
            <button 
              type="button" 
              className={`view-tab-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              <Sliders size={14} /> Split View
            </button>
            <button 
              type="button" 
              className={`view-tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
            >
              <Eye size={14} /> Live Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`rules-layout-grid view-${viewMode}`}>
        
        {/* LEFT COLUMN: Rule Configuration & Pointwise Editor */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="rules-editor-pane">
            
            {/* Metadata Settings Card */}
            <div className="rules-card metadata-card">
              <div className="card-section-title">
                <Sliders size={16} className="title-icon" />
                <span>Rule Set Configuration</span>
              </div>

              <div className="meta-form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="rule-title">Official Title</label>
                  <input
                    id="rule-title"
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => handleMetaChange('title', e.target.value)}
                    placeholder="e.g. Semaphore 2026 - Team Rules & Guidelines"
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label" htmlFor="rule-description">Guidelines Description / Summary</label>
                  <textarea
                    id="rule-description"
                    className="form-input form-textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleMetaChange('description', e.target.value)}
                    placeholder="Summary of fest conduct and participant expectations..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rule-category">Target Category</label>
                  <select
                    id="rule-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => handleMetaChange('category', e.target.value)}
                  >
                    <option value="general">General (All Contingents)</option>
                    <option value="technical">Technical Events</option>
                    <option value="cultural">Cultural & Arts</option>
                    <option value="gaming">E-Sports & Gaming</option>
                    <option value="management">Management & IT</option>
                  </select>
                </div>

                <div className="form-group active-toggle-group">
                  <label className="form-label">Visibility Status</label>
                  <label className="toggle-switch-label">
                    <input
                      type="checkbox"
                      className="toggle-checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleMetaChange('isActive', e.target.checked)}
                    />
                    <span className="toggle-switch-slider" />
                    <span className="toggle-text">
                      {formData.isActive ? 'Active (Live)' : 'Draft (Hidden)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pointwise Rules Editor */}
            <div className="rules-card pointwise-card">
              <div className="pointwise-card-header">
                <div className="card-section-title">
                  <ListOrdered size={16} className="title-icon" />
                  <span>Pointwise Rules ({formData.rules.length})</span>
                </div>
                
                <div className="pointwise-header-tools">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowBulkModal(true)}
                  >
                    <ClipboardList size={13} /> Bulk Import
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-sm btn-ghost text-muted"
                    onClick={handleResetToDefaults}
                    title="Reset to fest default rules"
                  >
                    <Sparkles size={13} /> Default Rules
                  </button>
                </div>
              </div>

              {/* Quick Add Rule Input (TOP) */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddRule(newRuleText, 'top');
                }} 
                className="add-rule-inline-form"
              >
                <div className="add-rule-input-wrapper">
                  <span className="rule-next-number">#{formData.rules.length + 1}</span>
                  <input 
                    type="text"
                    className="form-input add-rule-input"
                    placeholder="Type a new pointwise rule and press Enter or click Add..."
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm add-btn"
                    disabled={!newRuleText.trim()}
                  >
                    <Plus size={15} />
                    <span>Add Rule</span>
                  </button>
                </div>
              </form>

              {/* Rules List */}
              <div className="rules-items-list">
                {formData.rules.length === 0 ? (
                  <EmptyState 
                    icon={FileText}
                    title="No rules added yet"
                    description="Add your first pointwise rule above or click 'Default Rules' to auto-populate."
                    action={
                      <button className="btn btn-secondary btn-sm" onClick={handleResetToDefaults}>
                        <Sparkles size={14} /> Populate Default Rules
                      </button>
                    }
                  />
                ) : (
                  formData.rules.map((rule, idx) => (
                    <div key={idx} className="rule-item-row">
                      {/* Index Badge */}
                      <div className="rule-index-col">
                        <span className="rule-number-badge">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Rule Text Editor */}
                      <div className="rule-content-col">
                        <textarea
                          className="rule-item-textarea"
                          rows={Math.max(1, Math.ceil(rule.length / 75))}
                          value={rule}
                          onChange={(e) => handleUpdateRuleItem(idx, e.target.value)}
                          placeholder={`Enter rule #${idx + 1}...`}
                        />
                      </div>

                      {/* Actions */}
                      <div className="rule-actions-col">
                        <button
                          type="button"
                          className="rule-action-btn"
                          disabled={idx === 0}
                          onClick={() => handleMoveRule(idx, 'up')}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="rule-action-btn"
                          disabled={idx === formData.rules.length - 1}
                          onClick={() => handleMoveRule(idx, 'down')}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="rule-action-btn"
                          onClick={() => handleCopySingle(rule, idx)}
                          title="Copy rule"
                        >
                          {copiedIndex === idx ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                        <button
                          type="button"
                          className="rule-action-btn btn-delete-rule"
                          onClick={() => handleDeleteRuleItem(idx)}
                          title="Remove rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={rulesListBottomRef} />
              </div>

              {/* Bottom Quick Add Input (Convenient when scrolled to bottom) */}
              {formData.rules.length > 5 && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddRule(bottomRuleText, 'bottom');
                  }} 
                  className="add-rule-inline-form bottom-add-form"
                >
                  <div className="add-rule-input-wrapper">
                    <span className="rule-next-number">#{formData.rules.length + 1}</span>
                    <input 
                      type="text"
                      className="form-input add-rule-input"
                      placeholder="Add another rule at the end..."
                      value={bottomRuleText}
                      onChange={(e) => setBottomRuleText(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm add-btn"
                      disabled={!bottomRuleText.trim()}
                    >
                      <Plus size={15} />
                      <span>Add Rule</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Card Footer with Direct Save & Delete */}
              {formData.rules.length > 0 && (
                <div className="rules-card-footer">
                  <div className="rules-footer-left">
                    <span className="rules-counter-text">
                      Total: <strong>{formData.rules.length}</strong> pointwise rules configured
                    </span>
                    <span className="rules-autosave-status-text">
                      {autoSaveEnabled ? (
                        <span className="text-success inline-flex-center"><CheckCircle2 size={13} /> Auto-Sync Active</span>
                      ) : hasUnsavedChanges ? (
                        <span className="text-warning inline-flex-center"><AlertCircle size={13} /> Changes Pending Save</span>
                      ) : (
                        <span className="text-muted inline-flex-center"><Check size={13} /> All Saved</span>
                      )}
                    </span>
                  </div>

                  <div className="rules-footer-actions">
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm"
                      onClick={handleManualSave}
                      disabled={saving}
                    >
                      {saving ? <RefreshCw size={13} className="spin-icon" /> : <Save size={13} />}
                      <span>Save & Publish</span>
                    </button>

                    {formData.id && (
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-xs text-danger"
                        onClick={handleDeleteCurrentSet}
                      >
                        <Trash2 size={12} /> Delete this rule set
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* RIGHT COLUMN: Live Participant Preview Card */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="rules-preview-pane">
            <div className="preview-sticky-wrapper">
              <div className="preview-badge-header">
                <div className="preview-label">
                  <Eye size={14} />
                  <span>Participant Live View Preview</span>
                </div>
                <span className="preview-status-tag">
                  {formData.isActive ? '● LIVE TO STUDENTS' : '○ HIDDEN (DRAFT)'}
                </span>
              </div>

              {/* Live Preview Display Card */}
              <div className="participant-display-card">
                <div className="display-card-glow" />

                <div className="display-header">
                  <div className="display-fest-tag">
                    <span>SEMAPHORE 2026</span>
                    <span className="dot-divider">•</span>
                    <span>NATIONAL LEVEL IT FEST</span>
                  </div>
                  <h2 className="display-title">{formData.title || 'Team Rules & Guidelines'}</h2>
                  {formData.description && (
                    <p className="display-description">{formData.description}</p>
                  )}
                </div>

                <div className="display-divider" />

                <div className="display-rules-list">
                  {formData.rules.map((rule, idx) => (
                    <div key={idx} className="display-rule-item">
                      <div className="display-num-pill">{idx + 1}</div>
                      <div className="display-rule-text">{rule}</div>
                    </div>
                  ))}
                </div>

                <div className="display-footer">
                  <div className="display-footer-left">
                    <ShieldAlert size={14} className="shield-icon" />
                    <span>Organizing Committee • MCA Department</span>
                  </div>
                  <span className="display-category-badge">{formData.category.toUpperCase()}</span>
                </div>
              </div>

              {/* Endpoint Guide Card */}
              <div className="api-quick-guide-card">
                <div className="api-guide-title">
                  <FileCode size={14} /> Backend Integration Endpoints
                </div>
                <div className="api-endpoints-list">
                  <div className="endpoint-row">
                    <span className="http-badge get">GET</span>
                    <span className="endpoint-path">/api/teamrules</span>
                    <span className="endpoint-desc">Public Pointwise Rules</span>
                  </div>
                  <div className="endpoint-row">
                    <span className="http-badge put">PUT</span>
                    <span className="endpoint-path">/api/teamrules</span>
                    <span className="endpoint-desc">Admin Update Endpoint</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Floating Action Bar when unsaved changes exist and AutoSave is OFF */}
      {hasUnsavedChanges && !autoSaveEnabled && (
        <div className="rules-floating-save-bar">
          <div className="floating-bar-info">
            <AlertCircle size={18} className="text-warning" />
            <span>You have unsaved rule changes (<strong>{formData.rules.length}</strong> rules)</span>
          </div>
          <div className="floating-bar-actions">
            <button 
              type="button" 
              className="btn btn-ghost btn-sm"
              onClick={fetchRules}
            >
              <RotateCcw size={14} /> Discard
            </button>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={handleManualSave}
              disabled={saving}
            >
              {saving ? <RefreshCw size={14} className="spin-icon" /> : <Save size={14} />}
              <span>Save & Publish Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} maxWidth="580px" className="bulk-modal">
          <div className="modal-header">
            <div className="modal-title-row">
              <ClipboardList size={20} className="modal-icon" />
              <h3>Bulk Import Pointwise Rules</h3>
            </div>
            <button className="modal-close" onClick={() => setShowBulkModal(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <p className="modal-helper-text">
              Paste your pointwise rules below (one rule per line). Numbering (e.g. 1., 2.), dashes, or bullets will be automatically cleaned!
            </p>
            <textarea
              className="form-input form-textarea bulk-textarea"
              rows={8}
              placeholder="1. Each team must consist of max 2 members.&#10;2. Participants must carry ID cards.&#10;3. Reporting time is 9:00 AM."
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleBulkImport}
              disabled={!bulkText.trim()}
            >
              <Plus size={16} /> Import Rules
            </button>
          </div>
        </Modal>
      )}

      {/* Create New Rule Set Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="540px" className="set-modal">
          <div className="modal-header">
            <div className="modal-title-row">
              <Plus size={20} className="modal-icon" />
              <h3>Create New Rule Set Category</h3>
            </div>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateNewSet}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="set-title">Rule Set Title</label>
                <input
                  id="set-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Semaphore 2026 - Coding Event Rules"
                  value={newSetTitle}
                  onChange={e => setNewSetTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="set-category">Category</label>
                <select
                  id="set-category"
                  className="form-select"
                  value={newSetCategory}
                  onChange={e => setNewSetCategory(e.target.value)}
                >
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="gaming">Gaming</option>
                  <option value="management">Management</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving || !newSetTitle.trim()}
              >
                <Plus size={16} /> Create Set
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
