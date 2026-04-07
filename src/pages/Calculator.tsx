import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Calculator = () => {
  const { t } = useTranslation();

  const [weight, setWeight] = useState('');
  const [dosePerKg, setDosePerKg] = useState('');
  const [totalDoseResult, setTotalDoseResult] = useState<number | null>(null);

  const [volume, setVolume] = useState('');
  const [time, setTime] = useState('');
  const [dropFactor, setDropFactor] = useState('20');
  const [dropsResult, setDropsResult] = useState<number | null>(null);

  const calcDose = () => {
    const w = parseFloat(weight);
    const d = parseFloat(dosePerKg);
    if (!isNaN(w) && !isNaN(d)) setTotalDoseResult(w * d);
  };

  const calcDrops = () => {
    const v = parseFloat(volume);
    const h = parseFloat(time);
    const f = parseFloat(dropFactor);
    if (!isNaN(v) && !isNaN(h) && !isNaN(f) && h > 0) {
      setDropsResult(Math.round((v * f) / (h * 60)));
    }
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">{t('calculator.title')}</h1>

      <Tabs defaultValue="dose">
        <TabsList className="w-full">
          <TabsTrigger value="dose" className="flex-1">{t('calculator.totalDose')}</TabsTrigger>
          <TabsTrigger value="drops" className="flex-1">{t('calculator.dropsPerMin')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dose">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('calculator.dosePerKg')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                placeholder={t('calculator.weight')}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('calculator.dosePerKg')}
                value={dosePerKg}
                onChange={(e) => setDosePerKg(e.target.value)}
              />
              <Button onClick={calcDose} className="w-full">{t('calculator.calculate')}</Button>
              {totalDoseResult !== null && (
                <div className="p-3 rounded-lg bg-accent text-accent-foreground text-center">
                  <p className="text-sm text-muted-foreground">{t('calculator.result')}</p>
                  <p className="text-2xl font-bold">{totalDoseResult.toFixed(2)} mg</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drops">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('calculator.dropsPerMin')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                placeholder={t('calculator.volume')}
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('calculator.time')}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <Input
                type="number"
                placeholder={t('calculator.dropFactor')}
                value={dropFactor}
                onChange={(e) => setDropFactor(e.target.value)}
              />
              <Button onClick={calcDrops} className="w-full">{t('calculator.calculate')}</Button>
              {dropsResult !== null && (
                <div className="p-3 rounded-lg bg-accent text-accent-foreground text-center">
                  <p className="text-sm text-muted-foreground">{t('calculator.result')}</p>
                  <p className="text-2xl font-bold">{dropsResult} gts/min</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;
