import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator as CalcIcon, Droplets, FlaskConical, ArrowRightLeft } from 'lucide-react';

const ResultBox = ({ label, value, unit }: { label: string; value: number | null; unit: string }) => {
  if (value === null) return null;
  return (
    <div className="p-4 rounded-lg bg-primary/10 text-center border border-primary/20">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-primary">{value % 1 === 0 ? value : value.toFixed(2)}</p>
      <p className="text-sm text-muted-foreground">{unit}</p>
    </div>
  );
};

const Calculator = () => {
  const { t } = useTranslation();

  // Dose por peso
  const [weight, setWeight] = useState('');
  const [dosePerKg, setDosePerKg] = useState('');
  const [totalDoseResult, setTotalDoseResult] = useState<number | null>(null);

  // Gotejamento
  const [dripVolume, setDripVolume] = useState('');
  const [dripTime, setDripTime] = useState('');
  const [dropFactor, setDropFactor] = useState('20');
  const [dropsResult, setDropsResult] = useState<number | null>(null);
  const [mlHourResult, setMlHourResult] = useState<number | null>(null);

  // Diluição
  const [dilMedDose, setDilMedDose] = useState('');
  const [dilMedConc, setDilMedConc] = useState('');
  const [dilVolume, setDilVolume] = useState('');
  const [dilResult, setDilResult] = useState<number | null>(null);

  // Conversão
  const [convValue, setConvValue] = useState('');
  const [convType, setConvType] = useState<'mg_to_mcg' | 'mcg_to_mg' | 'ml_to_l' | 'l_to_ml' | 'f_to_c' | 'c_to_f'>('mg_to_mcg');
  const [convResult, setConvResult] = useState<number | null>(null);

  const calcDose = () => {
    const w = parseFloat(weight);
    const d = parseFloat(dosePerKg);
    if (!isNaN(w) && !isNaN(d) && w > 0) setTotalDoseResult(w * d);
  };

  const calcDrops = () => {
    const v = parseFloat(dripVolume);
    const h = parseFloat(dripTime);
    const f = parseFloat(dropFactor);
    if (!isNaN(v) && !isNaN(h) && !isNaN(f) && h > 0) {
      setDropsResult(Math.round((v * f) / (h * 60)));
      setMlHourResult(Math.round((v / h) * 100) / 100);
    }
  };

  const calcDilution = () => {
    const dose = parseFloat(dilMedDose);
    const conc = parseFloat(dilMedConc);
    const vol = parseFloat(dilVolume);
    if (!isNaN(dose) && !isNaN(conc) && !isNaN(vol) && conc > 0) {
      setDilResult(Math.round(((dose * vol) / conc) * 100) / 100);
    }
  };

  const calcConversion = () => {
    const v = parseFloat(convValue);
    if (isNaN(v)) return;
    const conversions: Record<string, number> = {
      mg_to_mcg: v * 1000,
      mcg_to_mg: v / 1000,
      ml_to_l: v / 1000,
      l_to_ml: v * 1000,
      f_to_c: (v - 32) * 5 / 9,
      c_to_f: (v * 9 / 5) + 32,
    };
    setConvResult(Math.round(conversions[convType] * 1000) / 1000);
  };

  const convLabels: Record<string, { from: string; to: string; unitFrom: string; unitTo: string }> = {
    mg_to_mcg: { from: 'mg', to: 'mcg', unitFrom: 'mg', unitTo: 'mcg' },
    mcg_to_mg: { from: 'mcg', to: 'mg', unitFrom: 'mcg', unitTo: 'mg' },
    ml_to_l: { from: 'mL', to: 'L', unitFrom: 'mL', unitTo: 'L' },
    l_to_ml: { from: 'L', to: 'mL', unitFrom: 'L', unitTo: 'mL' },
    f_to_c: { from: '°F', to: '°C', unitFrom: '°F', unitTo: '°C' },
    c_to_f: { from: '°C', to: '°F', unitFrom: '°C', unitTo: '°F' },
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-4">{t('calculator.title')}</h1>

      <Tabs defaultValue="dose">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="dose" className="text-xs px-1">
            <CalcIcon className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
            {t('calculator.doseTab')}
          </TabsTrigger>
          <TabsTrigger value="drip" className="text-xs px-1">
            <Droplets className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
            {t('calculator.dripTab')}
          </TabsTrigger>
          <TabsTrigger value="dilution" className="text-xs px-1">
            <FlaskConical className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
            {t('calculator.dilutionTab')}
          </TabsTrigger>
          <TabsTrigger value="convert" className="text-xs px-1">
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
            {t('calculator.convertTab')}
          </TabsTrigger>
        </TabsList>

        {/* Dose por peso */}
        <TabsContent value="dose">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('calculator.doseByWeight')}</CardTitle>
              <CardDescription>{t('calculator.doseByWeightDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>{t('calculator.weight')}</Label>
                <Input type="number" min="0" step="0.1" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('calculator.dosePerKg')}</Label>
                <Input type="number" min="0" step="0.01" placeholder="10" value={dosePerKg} onChange={(e) => setDosePerKg(e.target.value)} />
              </div>
              <Button onClick={calcDose} className="w-full">{t('calculator.calculate')}</Button>
              <ResultBox label={t('calculator.totalDose')} value={totalDoseResult} unit="mg" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gotejamento */}
        <TabsContent value="drip">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('calculator.dripCalc')}</CardTitle>
              <CardDescription>{t('calculator.dripCalcDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>{t('calculator.volume')}</Label>
                <Input type="number" min="0" placeholder="500" value={dripVolume} onChange={(e) => setDripVolume(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('calculator.time')}</Label>
                <Input type="number" min="0" step="0.5" placeholder="6" value={dripTime} onChange={(e) => setDripTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('calculator.dropFactor')}</Label>
                <Input type="number" min="0" placeholder="20" value={dropFactor} onChange={(e) => setDropFactor(e.target.value)} />
              </div>
              <Button onClick={calcDrops} className="w-full">{t('calculator.calculate')}</Button>
              <div className="grid grid-cols-2 gap-3">
                <ResultBox label={t('calculator.dropsPerMin')} value={dropsResult} unit="gts/min" />
                <ResultBox label={t('calculator.mlPerHour')} value={mlHourResult} unit="mL/h" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diluição */}
        <TabsContent value="dilution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('calculator.dilution')}</CardTitle>
              <CardDescription>{t('calculator.dilutionDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>{t('calculator.desiredDose')}</Label>
                <Input type="number" min="0" step="0.01" placeholder="100" value={dilMedDose} onChange={(e) => setDilMedDose(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('calculator.concentration')}</Label>
                <Input type="number" min="0" step="0.01" placeholder="500" value={dilMedConc} onChange={(e) => setDilMedConc(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t('calculator.diluentVolume')}</Label>
                <Input type="number" min="0" step="0.1" placeholder="10" value={dilVolume} onChange={(e) => setDilVolume(e.target.value)} />
              </div>
              <Button onClick={calcDilution} className="w-full">{t('calculator.calculate')}</Button>
              <ResultBox label={t('calculator.volumeToAdminister')} value={dilResult} unit="mL" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversões */}
        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('calculator.conversions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-1">
                {Object.keys(convLabels).map(key => (
                  <Button
                    key={key}
                    size="sm"
                    variant={convType === key ? 'default' : 'outline'}
                    className="text-xs"
                    onClick={() => { setConvType(key as any); setConvResult(null); }}
                  >
                    {convLabels[key].from} → {convLabels[key].to}
                  </Button>
                ))}
              </div>
              <div className="space-y-1">
                <Label>{t('calculator.valueIn')} {convLabels[convType].unitFrom}</Label>
                <Input type="number" min="0" step="any" value={convValue} onChange={(e) => setConvValue(e.target.value)} />
              </div>
              <Button onClick={calcConversion} className="w-full">{t('calculator.calculate')}</Button>
              <ResultBox label={t('calculator.result')} value={convResult} unit={convLabels[convType].unitTo} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;
