import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isSameDay, isWithinInterval, parseISO, type Locale } from 'date-fns';
import { pt, ptBR, enUS, es, fr, it } from 'date-fns/locale';
import { toast } from 'sonner';
import ShiftForm from '@/components/schedule/ShiftForm';
import ShiftCard from '@/components/schedule/ShiftCard';

const LOCALE_MAP: Record<string, Locale> = {
  'pt-BR': ptBR, 'pt-PT': pt, en: enUS, es, fr, it,
};

type ViewMode = 'day' | 'week' | 'month';

const Schedule = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const locale = LOCALE_MAP[i18n.language] || ptBR;

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dateRange = useMemo(() => {
    if (viewMode === 'day') return { start: currentDate, end: currentDate };
    if (viewMode === 'week') return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
    return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
  }, [viewMode, currentDate]);

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts', user?.id, format(dateRange.start, 'yyyy-MM-dd'), format(dateRange.end, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .gte('shift_date', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('shift_date', format(dateRange.end, 'yyyy-MM-dd'))
        .order('shift_date')
        .order('start_time');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('shifts').insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setShowForm(false);
      toast.success(t('schedule.shiftAdded'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from('shifts').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setEditingShift(null);
      setSelectedShift(null);
      toast.success(t('schedule.shiftUpdated'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shifts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setSelectedShift(null);
      setShowDeleteConfirm(false);
      toast.success(t('schedule.shiftDeleted'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const navigate = (dir: 1 | -1) => {
    if (viewMode === 'day') setCurrentDate(prev => dir === 1 ? addDays(prev, 1) : subDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1));
    else setCurrentDate(prev => dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const headerLabel = useMemo(() => {
    if (viewMode === 'day') return format(currentDate, 'EEEE, d MMM yyyy', { locale });
    if (viewMode === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 1 });
      const e = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(s, 'd MMM', { locale })} - ${format(e, 'd MMM yyyy', { locale })}`;
    }
    return format(currentDate, 'MMMM yyyy', { locale });
  }, [viewMode, currentDate, locale]);

  const shiftsForDay = (date: Date) => shifts.filter(s => isSameDay(parseISO(s.shift_date), date));

  const shiftDates = useMemo(() => shifts.map(s => parseISO(s.shift_date)), [shifts]);

  const renderDayView = () => {
    const dayShifts = shiftsForDay(currentDate);
    return (
      <div className="space-y-2">
        {dayShifts.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">{t('schedule.noShifts')}</p>
        ) : (
          dayShifts.map(s => <ShiftCard key={s.id} shift={s} onClick={() => setSelectedShift(s)} />)
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return (
      <div className="space-y-4">
        {days.map(day => {
          const dayShifts = shiftsForDay(day);
          return (
            <div key={day.toISOString()}>
              <h3 className="text-sm font-semibold text-foreground mb-2 capitalize">
                {format(day, 'EEEE, d', { locale })}
              </h3>
              {dayShifts.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-2 pb-2">—</p>
              ) : (
                <div className="space-y-2">
                  {dayShifts.map(s => <ShiftCard key={s.id} shift={s} onClick={() => setSelectedShift(s)} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => (
    <div>
      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={(d) => { if (d) { setCurrentDate(d); setViewMode('day'); } }}
        month={currentDate}
        onMonthChange={setCurrentDate}
        locale={locale}
        weekStartsOn={1}
        className="rounded-md border pointer-events-auto w-full"
        modifiers={{ hasShift: shiftDates }}
        modifiersClassNames={{ hasShift: 'bg-primary/20 font-bold text-primary' }}
      />
      <div className="mt-4 space-y-2">
        {shiftsForDay(currentDate).map(s => (
          <ShiftCard key={s.id} shift={s} onClick={() => setSelectedShift(s)} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('schedule.title')}</h1>
        <Button size="sm" onClick={() => { setEditingShift(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t('schedule.addShift')}
        </Button>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="day" className="flex-1">{t('schedule.day')}</TabsTrigger>
          <TabsTrigger value="week" className="flex-1">{t('schedule.week')}</TabsTrigger>
          <TabsTrigger value="month" className="flex-1">{t('schedule.month')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-foreground capitalize">{headerLabel}</span>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground text-sm py-8">{t('common.loading')}</p>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={showForm || !!editingShift} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingShift(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingShift ? t('schedule.editShift') : t('schedule.addShift')}</DialogTitle>
          </DialogHeader>
          <ShiftForm
            initialData={editingShift ? {
              title: editingShift.title,
              shift_type: editingShift.shift_type,
              shift_date: editingShift.shift_date,
              start_time: editingShift.start_time?.slice(0, 5),
              end_time: editingShift.end_time?.slice(0, 5),
              location: editingShift.location || '',
              sector: editingShift.sector || '',
              notes: editingShift.notes || '',
              is_day_off: editingShift.is_day_off,
            } : { shift_date: format(currentDate, 'yyyy-MM-dd') }}
            onSubmit={(data) => editingShift ? updateMutation.mutate({ id: editingShift.id, ...data }) : createMutation.mutate(data)}
            onCancel={() => { setShowForm(false); setEditingShift(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!selectedShift && !editingShift} onOpenChange={(open) => { if (!open) setSelectedShift(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedShift?.title}</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-3 text-sm">
              {!selectedShift.is_day_off && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('schedule.shiftType')}</span>
                    <span className="font-medium">{t(`schedule.${selectedShift.shift_type}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('schedule.startTime')}</span>
                    <span className="font-medium">{selectedShift.start_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('schedule.endTime')}</span>
                    <span className="font-medium">{selectedShift.end_time?.slice(0, 5)}</span>
                  </div>
                  {selectedShift.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('schedule.location')}</span>
                      <span className="font-medium">{selectedShift.location}</span>
                    </div>
                  )}
                  {selectedShift.sector && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('schedule.sector')}</span>
                      <span className="font-medium">{selectedShift.sector}</span>
                    </div>
                  )}
                </>
              )}
              {selectedShift.is_day_off && (
                <p className="text-center text-green-600 font-medium py-2">🌴 {t('schedule.dayOff')}</p>
              )}
              {selectedShift.notes && (
                <div>
                  <span className="text-muted-foreground">{t('schedule.notes')}</span>
                  <p className="mt-1 text-foreground">{selectedShift.notes}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setEditingShift(selectedShift)}>
                  <Edit className="h-4 w-4 mr-1" /> {t('common.edit')}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> {t('common.delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('schedule.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('schedule.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedShift && deleteMutation.mutate(selectedShift.id)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schedule;
