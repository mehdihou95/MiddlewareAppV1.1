import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export interface MetricsData {
    timestamp: number;
    value: number;
}

export interface MetricsChartProps {
    data: Record<string, MetricsData[]>;
    onClose: () => void;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ data, onClose }) => {
    const chartData = {
        labels: Object.values(data)[0]?.map(d => new Date(d.timestamp).toLocaleTimeString()) || [],
        datasets: Object.entries(data).map(([key, values]) => ({
            label: key,
            data: values.map(v => v.value),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1,
        })),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Performance Metrics',
            },
        },
    };

    return (
        <Box>
            <Line data={chartData} options={options} />
        </Box>
    );
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export default MetricsChart; 