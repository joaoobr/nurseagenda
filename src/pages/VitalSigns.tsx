import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Activity, Heart, Thermometer, Wind, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

const VitalSigns = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedPatient = searchParams.get('patient') || '';

  const [selectedPatient, setSelectedPatient] = useState(preselectedPatient);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSat, setOxygenSat] = useState('');
  const [respRate, setRespRate] = useState('');
  const [glucose, setGlucose] = useState('');
  const [notes, setNotes] = useState('');

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-list', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('patients').select('id, full_name').eq('status', 'active').order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: vitals = [], isLoading } = useQuery({
    queryKey: ['vital-signs', user?.id, selectedPatient],
    queryFn: async () => {
      let query = supabase.from('vital_signs').select('*, patients(full_name)').order('recorded_at', { ascending: true });
      if (selectedPatient) query = query.eq('patient_id', selectedPatient);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('vital_signs').insert({
        user_id: user!.id,
        patient_id: selectedPatient,
        systolic_bp: systolic ? parseInt(systolic) : null,
        diastolic_bp: diastolic ? parseInt(diastolic) : null,
        heart_rate: heartRate ? parseInt(heartRate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        oxygen_saturation: oxygenSat ? parseInt(oxygenSat) : null,
        respiratory_rate: respRate ? parseInt(respRate) : null,
        blood_glucose: glucose ? parseInt(glucose) : null,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vital-signs'] });
      resetForm();
      toast.success(t('vitalSigns.recorded'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vital_signs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vital-signs'] });
      setShowDeleteConfirm(false);
      toast.success(t('vitalSigns.deleted'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const resetForm = () => {
    setShowForm(false);
    setSystolic(''); setDiastolic(''); setHeartRate(''); setTemperature('');
    setOxygenSat(''); setRespRate(''); setGlucose(''); setNotes('');
  };

  const chartData = vitals.map((v: any) => ({
    time: format(new Date(v.recorded_at), 'dd/MM HH:mm'),
    systolic: v.systolic_bp,
    diastolic: v.diastolic_bp,
    hr: v.heart_rate,
    temp: v.temperature ? Number(v.temperature) : null,
    spo2: v.oxygen_saturation,
    rr: v.respiratory_rate,
    glucose: v.blood_glucose,
  }));

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('vitalSigns.title')}</h1>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={!selectedPatient}>
          <Plus className="h-4 w-4 mr-1" /> {t('vitalSigns.record')}
        </Button>
      </div>

      <div className="mb-4">
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger>
            <SelectValue placeholder={t('medications.selectPatient')} />
          </SelectTrigger>
          <SelectContent>
            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!selectedPatient ? (
        <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-sm">{t('vitalSigns.selectPatientFirst')}</p>
        </div>
      ) : isLoading ? (
        <p className="text-center text-muted-foreground text-sm py-8">{t('common.loading')}</p>
      ) : (
        <>
          {/* Latest vitals summary */}
          {latestVital && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {latestVital.systolic_bp && (
                <Card><CardContent className="p-3 text-center">
                  <Activity className="h-4 w-4 mx-auto text-red-500 mb-1" />
                  <p className="text-lg font-bold text-foreground">{latestVital.systolic_bp}/{latestVital.diastolic_bp}</p>
                  <p className="text-[10px] text-muted-foreground">mmHg</p>
                </CardContent></Card>
              )}
              {latestVital.heart_rate && (
                <Card><CardContent className="p-3 text-center">
                  <Heart className="h-4 w-4 mx-auto text-pink-500 mb-1" />
                  <p className="text-lg font-bold text-foreground">{latestVital.heart_rate}</p>
                  <p className="text-[10px] text-muted-foreground">bpm</p>
                </CardContent></Card>
              )}
              {latestVital.temperature && (
                <Card><CardContent className="p-3 text-center">
                  <Thermometer className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                  <p className="text-lg font-bold text-foreground">{Number(latestVital.temperature).toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">°C</p>
                </CardContent></Card>
              )}
              {latestVital.oxygen_saturation && (
                <Card><CardContent className="p-3 text-center">
                  <Wind className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold text-foreground">{latestVital.oxygen_saturation}%</p>
                  <p className="text-[10px] text-muted-foreground">SpO₂</p>
                </CardContent></Card>
              )}
              {latestVital.respiratory_rate && (
                <Card><CardContent className="p-3 text-center">
                  <Wind className="h-4 w-4 mx-auto text-teal-500 mb-1" />
                  <p className="text-lg font-bold text-foreground">{latestVital.respiratory_rate}</p>
                  <p className="text-[10px] text-muted-foreground">irpm</p>
                </CardContent></Card>
              )}
              {latestVital.blood_glucose && (
                <Card><CardContent className="p-3 text-center">
                  <Droplets className="h-4 w-4 mx-auto text-purple-500 mb-1" />
                  <p className="text-lg font-bold text-foreground">{latestVital.blood_glucose}</p>
                  <p className="text-[10px] text-muted-foreground">mg/dL</p>
                </CardContent></Card>
              )}
            </div>
          )}

          <Tabs defaultValue="charts">
            <TabsList className="w-full">
              <TabsTrigger value="charts" className="flex-1">{t('vitalSigns.charts')}</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">{t('vitalSigns.history')}</TabsTrigger>
            </TabsList>

            <TabsContent value="charts">
              {chartData.length < 2 ? (
                <p className="text-center text-muted-foreground text-sm py-8">{t('vitalSigns.needMoreData')}</p>
              ) : (
                <div className="space-y-4">
                  {/* BP Chart */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">{t('vitals.bloodPressure')}</CardTitle></CardHeader>
                    <CardContent className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="systolic" stroke="hsl(var(--destructive))" name="Sistólica" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--primary))" name="Diastólica" dot={{ r: 3 }} />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* HR & SpO2 */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">{t('vitals.heartRate')} & SpO₂</CardTitle></CardHeader>
                    <CardContent className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="hr" stroke="#ec4899" name="FC" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="spo2" stroke="#3b82f6" name="SpO₂" dot={{ r: 3 }} />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Temp & Glucose */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">{t('vitals.temperature')} & {t('vitals.bloodGlucose')}</CardTitle></CardHeader>
                    <CardContent className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="temp" stroke="#f97316" name="Temp" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="glucose" stroke="#8b5cf6" name="Glicemia" dot={{ r: 3 }} />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {vitals.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">{t('vitalSigns.noRecords')}</p>
              ) : (
                <div className="space-y-2">
                  {[...vitals].reverse().map((v: any) => (
                    <Card key={v.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-xs text-muted-foreground">{format(new Date(v.recorded_at), 'dd/MM/yyyy HH:mm')}</p>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeleteId(v.id); setShowDeleteConfirm(true); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-1 text-sm">
                          {v.systolic_bp && <span>PA: {v.systolic_bp}/{v.diastolic_bp}</span>}
                          {v.heart_rate && <span>FC: {v.heart_rate}</span>}
                          {v.temperature && <span>T: {Number(v.temperature).toFixed(1)}°C</span>}
                          {v.oxygen_saturation && <span>SpO₂: {v.oxygen_saturation}%</span>}
                          {v.respiratory_rate && <span>FR: {v.respiratory_rate}</span>}
                          {v.blood_glucose && <span>Glic: {v.blood_glucose}</span>}
                        </div>
                        {v.notes && <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Form */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) resetForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('vitalSigns.record')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t('vitalSigns.systolic')}</Label>
                <Input type="number" placeholder="120" value={systolic} onChange={e => setSystolic(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('vitalSigns.diastolic')}</Label>
                <Input type="number" placeholder="80" value={diastolic} onChange={e => setDiastolic(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t('vitals.heartRate')} (bpm)</Label>
                <Input type="number" placeholder="80" value={heartRate} onChange={e => setHeartRate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('vitals.temperature')} (°C)</Label>
                <Input type="number" step="0.1" placeholder="36.5" value={temperature} onChange={e => setTemperature(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>SpO₂ (%)</Label>
                <Input type="number" placeholder="98" value={oxygenSat} onChange={e => setOxygenSat(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('vitals.respiratoryRate')} (irpm)</Label>
                <Input type="number" placeholder="18" value={respRate} onChange={e => setRespRate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t('vitals.bloodGlucose')} (mg/dL)</Label>
              <Input type="number" placeholder="100" value={glucose} onChange={e => setGlucose(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t('schedule.notes')}</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">{t('common.cancel')}</Button>
              <Button className="flex-1" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('vitalSigns.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('vitalSigns.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VitalSigns;
