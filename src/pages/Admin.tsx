import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Shield, ShieldOff, Trash2, Users, ArrowLeft, Crown, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  banned_until: string | null;
  full_name: string;
  specialty: string;
  role: string;
}

const Admin = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: null,
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
      });

      // Use fetch directly with query params
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=list`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setUsers(result.users || []);
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && session) fetchUsers();
  }, [isAdmin, session]);

  const callAdminAction = async (action: string, body: Record<string, any>) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=${action}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result;
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
      throw err;
    }
  };

  const handleBan = async (userId: string, ban: boolean) => {
    await callAdminAction('ban', { user_id: userId, ban });
    toast.success(ban ? t('admin.userBanned') : t('admin.userUnbanned'));
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    await callAdminAction('delete', { user_id: userId });
    toast.success(t('admin.userDeleted'));
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await callAdminAction('update_role', { user_id: userId, role });
    toast.success(t('admin.roleUpdated'));
    fetchUsers();
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><Shield className="h-3 w-3 mr-1" />Mod</Badge>;
      default:
        return <Badge variant="secondary"><UserCheck className="h-3 w-3 mr-1" />{t('admin.user')}</Badge>;
    }
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{users.length}</p>
            <p className="text-[10px] text-muted-foreground">{t('admin.totalUsers')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <UserCheck className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => !u.banned).length}</p>
            <p className="text-[10px] text-muted-foreground">{t('admin.active')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <UserX className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-lg font-bold">{users.filter(u => u.banned).length}</p>
            <p className="text-[10px] text-muted-foreground">{t('admin.blocked')}</p>
          </CardContent>
        </Card>
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className={u.banned ? 'opacity-60 border-red-200' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {u.full_name || u.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.specialty && (
                      <p className="text-xs text-muted-foreground">{u.specialty}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getRoleBadge(u.role)}
                    {u.banned && (
                      <Badge variant="destructive" className="text-[10px]">
                        {t('admin.bannedLabel')}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground mb-3">
                  {t('admin.registered')}: {format(new Date(u.created_at), 'dd/MM/yyyy')}
                  {u.last_sign_in_at && (
                    <> · {t('admin.lastLogin')}: {format(new Date(u.last_sign_in_at), 'dd/MM/yyyy HH:mm')}</>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Role selector */}
                  <Select
                    value={u.role}
                    onValueChange={(val) => handleRoleChange(u.id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t('admin.user')}</SelectItem>
                      <SelectItem value="moderator">{t('admin.moderator')}</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Ban/Unban */}
                  <Button
                    variant={u.banned ? 'outline' : 'secondary'}
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleBan(u.id, !u.banned)}
                  >
                    {u.banned ? (
                      <><ShieldOff className="h-3 w-3" />{t('admin.unblock')}</>
                    ) : (
                      <><Shield className="h-3 w-3" />{t('admin.block')}</>
                    )}
                  </Button>

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.confirmDeleteDesc')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(u.id)} className="bg-destructive text-destructive-foreground">
                          {t('common.delete')}
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
    </div>
  );
};

export default Admin;
