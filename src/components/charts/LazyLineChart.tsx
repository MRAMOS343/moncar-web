import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface LazyLineChartProps {
  data: any[];
  height?: number | string; // height for the responsive container
  children?: React.ReactNode;
  [key: string]: any;
}

export function LazyLineChart({ children, data, height = 320, ...rest }: LazyLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} {...rest}>
        {children}
      </LineChart>
    </ResponsiveContainer>
  );
}

export { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer };
