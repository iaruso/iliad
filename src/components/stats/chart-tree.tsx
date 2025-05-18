import React, { PureComponent } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';

type TreeNode = {
  data: number[];
};

interface CustomizedContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

class CustomizedContent extends PureComponent<CustomizedContentProps> {
  render() {
    const { x, y, width, height } = this.props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: 'hsl(var(--chart-1))',
            fillOpacity: 0.01,
            stroke: 'hsl(var(--border))',
            strokeWidth: 0.2,
            strokeOpacity: 1,
          }}
        />
      </g>
    );
  }
}

export default class ChartTree extends PureComponent<TreeNode> {
  render() {
    const { data } = this.props;
    const processedData = data.map((value) => ({
      name: value.toFixed(2),
      children: [
        { name: '', size: parseFloat(value.toFixed(2)) }
      ]
    }));

    return (
      <ResponsiveContainer width='101%' height='101%' className='absolute inset-0 -m-[1px]'>
        <Treemap
          animationDuration={0}
          width={400}
          height={200}
          data={processedData}
          dataKey='size'
          content={<CustomizedContent x={0} y={0} width={0} height={0} />}
        />
      </ResponsiveContainer>
    );
  }
}