import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartRequest } from '@/lib/llm-service';
import { ensureColors } from '@/lib/chart-colors';

interface ScatterChartProps {
  data: ChartRequest;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ data }) => {
  const colors = ensureColors(1, data.colors);
  
  // Para scatter chart, esperamos dados com x e y
  const scatterData = data.data.map(item => ({
    x: item.value,
    y: item.value * 1.2 + Math.random() * 100, // Simular correlação
    name: item.name
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
          <XAxis 
            type="number"
            dataKey="x"
            name="X"
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: data.xAxisLabel || 'X', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            name="Y"
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: data.yAxisLabel || 'Y', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Scatter 
            data={scatterData}
            dataKey="y" 
            fill={colors[0]}
            animationDuration={800}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

