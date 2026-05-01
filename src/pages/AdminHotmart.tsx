import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, Search, RefreshCw, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

type HotmartStatus = 'active' | 'canceled' | 'refunded' | 'expired' | 'chargeback';

interface HotmartSubscription {
  id: string;
  email: string;
  status: HotmartStatus;
  product_name: string | null;
  product_id: string | null;
  transaction_id: string | null;
  subscriber_code: string | null;
  purchase_date: string | null;
  next_charge_date: string | null;
  expires_at: string | null;
  last_event: string | null;
  created_at: string;
  updated_at: string;
}

const STATUSES: HotmartStatus[] = ['active', 'canceled', 'refunded', 'expired', 'chargeback'];

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (val: string) => (val ? new Date(val).toISOString() : null);

const emptyForm = {
  email: '',
  status: 'active' as HotmartStatus,
  product_name: '',
  product_id: '',
  transaction_id: '',
  subscriber_code: '',
  purchase_date: '',
  next_charge_date: '',
  expires_at: '',
};

const AdminHotmart = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [rows, setRows] = useState<HotmartSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HotmartSubscription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hotmart_subscriptions')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data || []) as HotmartSubscription[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchRows();
  }, [isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: HotmartSubscription) => {
    setEditing(row);
    setForm({
      email: row.email,
      status: row.status,
      product_name: row.product_name || '',
      product_id: row.product_id || '',
      transaction_id: row.transaction_id || '',
      subscriber_code: row.subscriber_code || '',
      purchase_date: toLocalInput(row.purchase_date),
      next_charge_date: toLocalInput(row.next_charge_date),
      expires_at: toLocalInput(row.expires_at),
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.email.trim()) {
      toast.error('E-mail é obrigatório');
      return;
    }
    setSaving(true);
    const payload = {
      email: form.email.trim().toLowerCase(),
      status: form.status,
      product_name: form.product_name || null,
      product_id: form.product_id || null,
      transaction_id: form.transaction_id || null,
      subscriber_code: form.subscriber_code || null,
      purchase_date: fromLocalInput(form.purchase_date),
      next_charge_date: fromLocalInput(form.next_charge_date),
      expires_at: fromLocalInput(form.expires_at),
      last_event: editing ? editing.last_event : 'manual_admin',
    };
    let error;
    if (editing) {
      ({ error } = await supabase
        .from('hotmart_subscriptions')
        .update(payload)
        .eq('id', editing.id));
    } else {
      ({ error } = await supabase
        .from('hotmart_subscriptions')
        .insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? 'Assinatura atualizada' : 'Assinatura criada');
    setDialogOpen(false);
    fetchRows();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('hotmart_subscriptions').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Assinatura removida');
    fetchRows();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.email.toLowerCase().includes(q) ||
        (r.transaction_id || '').toLowerCase().includes(q) ||
        (r.subscriber_code || '').toLowerCase().includes(q) ||
        (r.product_name || '').toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const statusBadge = (s: HotmartStatus) => {
    const map: Record<HotmartStatus, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-200',
      canceled: 'bg-muted text-muted-foreground',
      refunded: 'bg-red-500/10 text-red-600 border-red-200',
      expired: 'bg-red-500/10 text-red-600 border-red-200',
      chargeback: 'bg-amber-500/10 text-amber-600 border-amber-200',
    };
    return <Badge className={map[s]}>{s}</Badge>;
  };

  const fmt = (iso: string | null) => (iso ? format(new Date(iso), 'dd/MM/yyyy HH:mm') : '—');

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Assinaturas Hotmart
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie manualmente o acesso por e-mail</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchRows} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email, transação, produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />Nova
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma assinatura encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{r.email}</p>
                    {r.product_name && (
                      <p className="text-xs text-muted-foreground truncate">{r.product_name}</p>
                    )}
                  </div>
                  {statusBadge(r.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                  <div><span className="font-medium text-foreground">Compra:</span> {fmt(r.purchase_date)}</div>
                  <div><span className="font-medium text-foreground">Próx. cobrança:</span> {fmt(r.next_charge_date)}</div>
                  <div><span className="font-medium text-foreground">Expira:</span> {fmt(r.expires_at)}</div>
                </div>

                {(r.transaction_id || r.subscriber_code) && (
                  <div className="text-[10px] text-muted-foreground mb-3 truncate">
                    {r.transaction_id && <>TX: {r.transaction_id} </>}
                    {r.subscriber_code && <>· Sub: {r.subscriber_code}</>}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openEdit(r)}>
                    <Pencil className="h-3 w-3" />Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover assinatura?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação remove o acesso de {r.email}. Não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => remove(r.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar assinatura' : 'Nova assinatura'}</DialogTitle>
            <DialogDescription>
              O acesso é liberado pelo e-mail. Use o mesmo e-mail que o usuário usa para logar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as HotmartStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Produto</Label>
                <Input
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                />
              </div>
              <div>
                <Label>ID produto</Label>
                <Input
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Transação</Label>
                <Input
                  value={form.transaction_id}
                  onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                />
              </div>
              <div>
                <Label>Cód. assinante</Label>
                <Input
                  value={form.subscriber_code}
                  onChange={(e) => setForm({ ...form, subscriber_code: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Data da compra</Label>
              <Input
                type="datetime-local"
                value={form.purchase_date}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Próxima cobrança</Label>
              <Input
                type="datetime-local"
                value={form.next_charge_date}
                onChange={(e) => setForm({ ...form, next_charge_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Expira em</Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Deixe vazio para acesso sem expiração (enquanto status = active).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotmart;
