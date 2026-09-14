import { useEffect, useRef, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { ThemeProps } from './shared';
import {
  defaultAboutContent,
  fetchAboutContent,
  loadAboutContent,
  saveAboutContent,
  type AboutContent,
} from './aboutContent';

interface AboutProps extends ThemeProps {}

export default function About({ darkMode, card, text, sub, bdr, inputCls }: AboutProps) {
  const [content, setContent] = useState<AboutContent>(loadAboutContent());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [headsBulkEdit, setHeadsBulkEdit] = useState('');
  const [dirty, setDirty] = useState(false);
  const lastSavedSnapshot = useRef(JSON.stringify(loadAboutContent()));

  useEffect(() => {
    let active = true;

    const load = async () => {
      const loaded = await fetchAboutContent();
      if (!active) return;
      setContent(loaded);
      lastSavedSnapshot.current = JSON.stringify(loaded);
      setDirty(false);
      setHeadsBulkEdit(
        loaded.communityHeads
          .map(head => `${head.name} | ${head.role} | ${head.phone}`)
          .join('\n')
      );
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setHeadsBulkEdit(
      content.communityHeads
        .map(head => `${head.name} | ${head.role} | ${head.phone}`)
        .join('\n')
    );
  }, [content.communityHeads]);

  useEffect(() => {
    setDirty(JSON.stringify(content) !== lastSavedSnapshot.current);
  }, [content]);

  const updateField = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    setContent(prev => ({
      ...prev,
      stats: prev.stats.map((stat, statIndex) => (
        statIndex === index ? { ...stat, [field]: value } : stat
      )),
    }));
  };

  const addStat = () => {
    setContent(prev => ({ ...prev, stats: [...prev.stats, { value: '', label: '' }] }));
  };

  const removeStat = (index: number) => {
    setContent(prev => ({ ...prev, stats: prev.stats.filter((_, statIndex) => statIndex !== index) }));
  };

  const updateTextListItem = (
    listKey: 'values' | 'programs',
    index: number,
    field: 'title' | 'description',
    value: string,
  ) => {
    setContent(prev => ({
      ...prev,
      [listKey]: prev[listKey].map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addTextListItem = (listKey: 'values' | 'programs') => {
    const emptyItem = { title: '', description: '' };
    setContent(prev => ({ ...prev, [listKey]: [...prev[listKey], emptyItem] }));
  };

  const removeTextListItem = (listKey: 'values' | 'programs', index: number) => {
    setContent(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateHead = (index: number, field: 'name' | 'role' | 'phone', value: string) => {
    setContent(prev => ({
      ...prev,
      communityHeads: prev.communityHeads.map((head, headIndex) => (
        headIndex === index ? { ...head, [field]: value } : head
      )),
    }));
  };

  const addHead = () => {
    setContent(prev => ({
      ...prev,
      communityHeads: [...prev.communityHeads, { name: '', role: '', phone: '' }],
    }));
  };

  const persistContent = async (nextContent: AboutContent, successMessage: string, failedMessage: string) => {
    setSaving(true);
    setMessage('');
    try {
      const savedContent = await saveAboutContent(nextContent);
      setContent(savedContent);
      lastSavedSnapshot.current = JSON.stringify(savedContent);
      setDirty(false);
      setHeadsBulkEdit(
        savedContent.communityHeads
          .map(head => `${head.name} | ${head.role} | ${head.phone}`)
          .join('\n')
      );
      window.dispatchEvent(new Event('ad-diin-about-updated'));
      setMessage(successMessage);
    } catch {
      setMessage(failedMessage);
    } finally {
      setSaving(false);
    }
  };

  const applyBulkHeads = () => {
    const parsedHeads = headsBulkEdit
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [name = '', role = '', phone = ''] = line.split('|').map(part => part.trim());
        return { name, role, phone };
      });

    if (parsedHeads.length === 0) {
      setMessage('Bulk edit field is empty.');
      return;
    }

    const nextContent = {
      ...content,
      communityHeads: parsedHeads,
    };

    setContent(nextContent);
    void persistContent(
      nextContent,
      'Bulk changes applied and saved.',
      'Bulk changes applied locally, but save failed. Please press Save Changes.'
    );
  };

  const removeHead = (index: number) => {
    const nextContent = {
      ...content,
      communityHeads: content.communityHeads.filter((_, headIndex) => headIndex !== index),
    };

    setContent(nextContent);

    void persistContent(
      nextContent,
      'Community head removed and saved.',
      'Removed locally, but save failed. Please press Save Changes.'
    );
  };

  const save = () => {
    void persistContent(
      content,
      'About content updated successfully.',
      'Failed to save about content.'
    );
  };

  const reset = () => {
    setContent(defaultAboutContent);
    setMessage('Reset complete. Press Save Changes to persist.');
  };

  return (
    <div className={`${card} rounded-xl shadow-sm p-6 space-y-6`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl font-semibold ${text}`}>About Us Editor</h3>
          <p className={`text-sm ${sub}`}>এখান থেকে public About page-এর সব content edit করা যাবে।</p>
          {dirty && <p className="mt-1 text-xs font-semibold text-amber-600">Unsaved changes আছে</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className={`rounded-lg border ${bdr} px-4 py-2 text-sm ${text}`}>
            Reset
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-emerald-200 bg-emerald-50'} ${text}`}>
          {message}
        </div>
      )}

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <h4 className={`text-lg font-semibold ${text}`}>Hero Section</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={inputCls} value={content.heroBadge} onChange={e => updateField('heroBadge', e.target.value)} placeholder="Badge" />
          <input className={inputCls} value={content.heroTitle} onChange={e => updateField('heroTitle', e.target.value)} placeholder="Title" />
        </div>
        <textarea className={`${inputCls} resize-none`} rows={4} value={content.heroDescription} onChange={e => updateField('heroDescription', e.target.value)} placeholder="Hero description" />
      </section>

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-semibold ${text}`}>Stats</h4>
          <button onClick={addStat} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
            <Plus className="h-4 w-4" /> Add Stat
          </button>
        </div>
        <div className="space-y-3">
          {content.stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input className={inputCls} value={stat.value} onChange={e => updateStat(index, 'value', e.target.value)} placeholder="Value" />
              <input className={inputCls} value={stat.label} onChange={e => updateStat(index, 'label', e.target.value)} placeholder="Label" />
              <button onClick={() => removeStat(index)} className="rounded-lg border border-red-200 px-3 py-2 text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <h4 className={`text-lg font-semibold ${text}`}>Mission & Vision</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={inputCls} value={content.missionTitle} onChange={e => updateField('missionTitle', e.target.value)} placeholder="Mission title" />
          <input className={inputCls} value={content.visionTitle} onChange={e => updateField('visionTitle', e.target.value)} placeholder="Vision title" />
        </div>
        <textarea className={`${inputCls} resize-none`} rows={4} value={content.missionDescription} onChange={e => updateField('missionDescription', e.target.value)} placeholder="Mission description" />
        <textarea className={`${inputCls} resize-none`} rows={4} value={content.visionDescription} onChange={e => updateField('visionDescription', e.target.value)} placeholder="Vision description" />
      </section>

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <h4 className={`text-lg font-semibold ${text}`}>Core Values</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={inputCls} value={content.valuesTitle} onChange={e => updateField('valuesTitle', e.target.value)} placeholder="Section title" />
          <input className={inputCls} value={content.valuesDescription} onChange={e => updateField('valuesDescription', e.target.value)} placeholder="Section description" />
        </div>
        <div className="space-y-3">
          {content.values.map((item, index) => (
            <div key={`${item.title}-${index}`} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <input className={inputCls} value={item.title} onChange={e => updateTextListItem('values', index, 'title', e.target.value)} placeholder="Title" />
              <input className={inputCls} value={item.description} onChange={e => updateTextListItem('values', index, 'description', e.target.value)} placeholder="Description" />
              <button onClick={() => removeTextListItem('values', index)} className="rounded-lg border border-red-200 px-3 py-2 text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => addTextListItem('values')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
            <Plus className="h-4 w-4" /> Add Value
          </button>
        </div>
      </section>

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <h4 className={`text-lg font-semibold ${text}`}>Programs</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={inputCls} value={content.programsTitle} onChange={e => updateField('programsTitle', e.target.value)} placeholder="Section title" />
          <input className={inputCls} value={content.programsDescription} onChange={e => updateField('programsDescription', e.target.value)} placeholder="Section description" />
        </div>
        <div className="space-y-3">
          {content.programs.map((item, index) => (
            <div key={`${item.title}-${index}`} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <input className={inputCls} value={item.title} onChange={e => updateTextListItem('programs', index, 'title', e.target.value)} placeholder="Title" />
              <input className={inputCls} value={item.description} onChange={e => updateTextListItem('programs', index, 'description', e.target.value)} placeholder="Description" />
              <button onClick={() => removeTextListItem('programs', index)} className="rounded-lg border border-red-200 px-3 py-2 text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => addTextListItem('programs')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm text-emerald-700">
            <Plus className="h-4 w-4" /> Add Program
          </button>
        </div>
      </section>

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <div className="flex items-center justify-between">
          <h4 className={`text-lg font-semibold ${text}`}>Community Heads</h4>
          <button onClick={addHead} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
            <Plus className="h-4 w-4" /> Add Head
          </button>
        </div>
        <div className={`rounded-lg border ${bdr} p-4 space-y-3`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold ${text}`}>Bulk edit</p>
              <p className={`text-xs ${sub}`}>One line per head. Format: name | role | phone</p>
            </div>
            <button onClick={applyBulkHeads} className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
              Apply bulk edit
            </button>
          </div>
          <textarea
            className={`${inputCls} resize-none font-mono text-sm`}
            rows={5}
            value={headsBulkEdit}
            onChange={e => setHeadsBulkEdit(e.target.value)}
            placeholder="Mojid Uddin | Community Head | +880 1000 000001"
          />
        </div>
        <div className="space-y-3">
          {content.communityHeads.map((head, index) => (
            <div key={`${head.name}-${index}`} className="grid gap-2 md:grid-cols-[1.1fr_1fr_1fr_auto]">
              <input className={inputCls} value={head.name} onChange={e => updateHead(index, 'name', e.target.value)} placeholder="Name" />
              <input className={inputCls} value={head.role} onChange={e => updateHead(index, 'role', e.target.value)} placeholder="Role" />
              <input className={inputCls} value={head.phone} onChange={e => updateHead(index, 'phone', e.target.value)} placeholder="Phone" />
              <button onClick={() => removeHead(index)} className="rounded-lg border border-red-200 px-3 py-2 text-red-600" disabled={saving}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-xl border ${bdr} p-4 space-y-4`}>
        <h4 className={`text-lg font-semibold ${text}`}>Call to Action</h4>
        <input className={inputCls} value={content.ctaTitle} onChange={e => updateField('ctaTitle', e.target.value)} placeholder="CTA title" />
        <textarea className={`${inputCls} resize-none`} rows={3} value={content.ctaDescription} onChange={e => updateField('ctaDescription', e.target.value)} placeholder="CTA description" />
      </section>

      {dirty && (
        <div className={`sticky bottom-4 z-20 rounded-xl border ${bdr} ${card} p-3 shadow-lg`}>
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${text}`}>Change save না করলে refresh এ আগের data দেখাবে</p>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
