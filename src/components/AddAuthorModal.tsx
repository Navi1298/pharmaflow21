import React, { useState, useRef } from 'react';
import {
  UserPlus,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

interface AddAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { label: 'Photo 1 (Author)', path: '/avatars/naveen_author1.jpg' },
  { label: 'Photo 2 (Reviewer)', path: '/avatars/santosh_reviewer.jpg' },
  { label: 'Photo 3 (Approver)', path: '/avatars/rajsekhar_approver.jpg' },
  { label: 'Photo 4 (Author 2)', path: '/avatars/naveen_author2.jpg' },
];

export const AddAuthorModal: React.FC<AddAuthorModalProps> = ({ isOpen, onClose }) => {
  const { addNewAuthor } = useWorkflow();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('Process & Validation Engineer');
  const [department, setDepartment] = useState('Manufacturing Operations (Shift C)');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('/avatars/naveen_author1.jpg');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter the author full name.');
      return;
    }

    if (!employeeId.trim()) {
      setError('Please provide an Employee / Operator ID (e.g. ENG-8493).');
      return;
    }

    addNewAuthor({
      name: name.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      title: title.trim(),
      department: department.trim(),
      email: email.trim(),
      avatar,
    });

    // Reset form
    setName('');
    setEmployeeId('');
    setTitle('Process & Validation Engineer');
    setDepartment('Manufacturing Operations (Shift C)');
    setEmail('');
    setAvatar('/avatars/naveen_author1.jpg');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden shadow-teal-950/40 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Enroll New Author Persona</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold">
                  ROLE: AUTHOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Register new operator/scientist with 21 CFR Part 11 drafting credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Compliance Info Banner */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Strict Segregation Notice:</strong> Reviewer (
              <span className="text-blue-300">Santosh kumar majji</span>) and Approver (
              <span className="text-purple-300">Rajsekhar Gudivada</span>) roles remain fixed to
              prevent dual-control conflicts. All dynamically added personnel receive the{' '}
              <strong className="text-teal-300">AUTHOR</strong> role.
            </div>
          </div>

          {/* Avatar Selection & Upload */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-200 block">
              Profile Photo / Avatar
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                  title="Upload Custom Image"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span>Upload Local Photo</span>
                </button>

                <div className="text-[10px] text-slate-400">
                  Or pick from project photo presets:
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setAvatar(preset.path)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] border transition-all cursor-pointer ${
                        avatar === preset.path
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name & ID Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Author Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NAVEEN KUMAR MAJJI - 3"
                required
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Employee / Operator ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. ENG-8493"
                required
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 uppercase font-mono"
              />
            </div>
          </div>

          {/* Job Title & Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Formulation Scientist"
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Formulation R&D Suite C"
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. naveen.majji3@pharmatech.com (auto-generated if empty)"
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Digital Signature Preview */}
          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-teal-400 font-mono uppercase block font-bold">
                Auto-Generated 21 CFR Part 11 Signature ID:
              </span>
              <span className="font-mono text-white text-[11px] font-semibold">
                SIG-AUTH-{employeeId ? employeeId.toUpperCase() : 'XXXX'}-
                {name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 3) : 'XXX'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">
              Non-Repudiation
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Author & Switch Persona</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
