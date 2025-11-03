import React from 'react';
import { motion } from 'framer-motion';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { AreaChart } from './AreaChart';
import { ScatterChart } from './ScatterChart';
import { ChartRequest } from '@/lib/llm-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartRendererProps {
  charts: ChartRequest[];
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ charts }) => {
  const renderChart = (chart: ChartRequest, index: number) => {
    const chartComponents = {
      line: LineChart,
      bar: BarChart,
      pie: PieChart,
      area: AreaChart,
      scatter: ScatterChart,
    };

    const ChartComponent = chartComponents[chart.type];
    
    if (!ChartComponent) {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-destructive">Tipo de gráfico não suportado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                O tipo "{chart.type}" não é suportado.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card className="w-full hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
            {chart.description && (
              <CardDescription>{chart.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ChartComponent data={chart} />
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (charts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nenhum gráfico gerado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tente fazer uma solicitação mais específica.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {charts.map((chart, index) => renderChart(chart, index))}
    </div>
  );
};

