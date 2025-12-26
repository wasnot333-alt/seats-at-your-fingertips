import { useState, useEffect, useMemo } from 'react';
import { InvitationCode, InvitationCodeStatus } from '@/types/booking';
import {
  getInvitationCodes,
  createInvitationCode,
  updateInvitationCode,
  deleteInvitationCode,
} from '@/services/api';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function InvitationCodesManager() {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvitationCodeStatus>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<InvitationCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formParticipantName, setFormParticipantName] = useState('');
  const [formStatus, setFormStatus] = useState<InvitationCodeStatus>('active');
  const [formMaxUsage, setFormMaxUsage] = useState<string>('1');
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const data = await getInvitationCodes();
      setCodes(data);
    } catch (error) {
      console.error('Failed to load invitation codes:', error);
      toast.error('Failed to load invitation codes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const matchesSearch = 
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (code.participantName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
      
      let matchesUsage = true;
      if (usageFilter === 'used') {
        matchesUsage = code.currentUsage > 0;
      } else if (usageFilter === 'unused') {
        matchesUsage = code.currentUsage === 0;
      }
      
      return matchesSearch && matchesStatus && matchesUsage;
    });
  }, [codes, searchTerm, statusFilter, usageFilter]);

  const resetForm = () => {
    setFormCode('');
    setFormParticipantName('');
    setFormStatus('active');
    setFormMaxUsage('1');
    setFormExpiresAt('');
    setEditingCode(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (code: InvitationCode) => {
    setEditingCode(code);
    setFormCode(code.code);
    setFormParticipantName(code.participantName || '');
    setFormStatus(code.status);
    setFormMaxUsage(code.maxUsage?.toString() || '');
    setFormExpiresAt(code.expiresAt ? code.expiresAt.slice(0, 16) : '');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formCode.trim()) {
      toast.error('Code is required');
      return;
    }

    setSaving(true);
    try {
      const codeData = {
        code: formCode,
        participantName: formParticipantName.trim() || null,
        status: formStatus,
        maxUsage: formMaxUsage ? parseInt(formMaxUsage, 10) : null,
        expiresAt: formExpiresAt || null,
        createdBy: null,
      };

      if (editingCode) {
        const result = await updateInvitationCode(editingCode.id, codeData);
        if (result.success) {
          toast.success('Invitation code updated');
          loadCodes();
          setDialogOpen(false);
          resetForm();
        } else {
          toast.error(result.error || 'Failed to update code');
        }
      } else {
        const result = await createInvitationCode(codeData);
        if (result.success) {
          toast.success('Invitation code created');
          loadCodes();
          setDialogOpen(false);
          resetForm();
        } else {
          toast.error(result.error || 'Failed to create code');
        }
      }
    } catch (error) {
      console.error('Error saving invitation code:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation code?')) {
      return;
    }

    setDeleting(id);
    try {
      const result = await deleteInvitationCode(id);
      if (result.success) {
        toast.success('Invitation code deleted');
        loadCodes();
      } else {
        toast.error(result.error || 'Failed to delete code');
      }
    } catch (error) {
      console.error('Error deleting invitation code:', error);
      toast.error('An error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (code: InvitationCode) => {
    const newStatus: InvitationCodeStatus = code.status === 'active' ? 'disabled' : 'active';
    const result = await updateInvitationCode(code.id, { status: newStatus });
    if (result.success) {
      toast.success(`Code ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      loadCodes();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: InvitationCodeStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-seat-available/10 text-seat-available">
            <CheckCircle2 className="w-4 h-4" />
            Active
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-500">
            <XCircle className="w-4 h-4" />
            Disabled
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-500">
            <Clock className="w-4 h-4" />
            Expired
          </span>
        );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            <Key className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Invitation Codes
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage participant invitation codes
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Code
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search codes or names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-12"
            />
          </div>
          <div className="relative sm:w-40">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="input-premium pl-12 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="relative sm:w-40">
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value as typeof usageFilter)}
              className="input-premium appearance-none cursor-pointer"
            >
              <option value="all">All Usage</option>
              <option value="used">Used</option>
              <option value="unused">Unused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="text-center py-20">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">No invitation codes found</p>
            <p className="text-muted-foreground mb-4">
              {codes.length === 0 ? 'Create your first invitation code' : 'Try adjusting your search or filter'}
            </p>
            {codes.length === 0 && (
              <Button onClick={openCreateDialog} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Add Code
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Code</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Participant</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground hidden md:table-cell">Usage</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground hidden lg:table-cell">Expires</th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((code) => (
                  <tr
                    key={code.id}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {code.participantName ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{code.participantName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(code.status)}</td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      <span className="font-medium text-foreground">{code.currentUsage}</span>
                      <span className="text-muted-foreground">
                        {code.maxUsage !== null ? ` / ${code.maxUsage}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm hidden lg:table-cell">
                      {formatDate(code.expiresAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(code)}
                          title={code.status === 'active' ? 'Disable code' : 'Enable code'}
                          disabled={code.status === 'expired'}
                        >
                          {code.status === 'active' ? (
                            <XCircle className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-seat-available" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(code)}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(code.id)}
                          disabled={deleting === code.id}
                        >
                          {deleting === code.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && filteredCodes.length > 0 && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Showing {filteredCodes.length} of {codes.length} codes
        </p>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              {editingCode ? 'Edit Invitation Code' : 'Create Invitation Code'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g., GURU2025"
                className="font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">
                Case-insensitive. Will be stored in uppercase.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantName">Participant Name</Label>
              <Input
                id="participantName"
                value={formParticipantName}
                onChange={(e) => setFormParticipantName(e.target.value)}
                placeholder="e.g., John Doe"
              />
              <p className="text-xs text-muted-foreground">
                If set, only this person can use the code (strict name match).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as InvitationCodeStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsage">Max Usage</Label>
              <Input
                id="maxUsage"
                type="number"
                min="1"
                value={formMaxUsage}
                onChange={(e) => setFormMaxUsage(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Number of times this code can be used. Empty = unlimited.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiration date.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingCode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
