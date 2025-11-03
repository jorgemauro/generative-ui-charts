import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartRequest } from '@/lib/llm-service';
import { ensureColors } from '@/lib/chart-colors';

interface LineChartProps {
  data: ChartRequest;
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const colors = ensureColors(1, data.colors);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: data.xAxisLabel, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            className="text-muted-foreground"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: data.yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colors[0]} 
            strokeWidth={3}
            dot={{ fill: colors[0], strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, strokeWidth: 2 }}
            animationDuration={800}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

