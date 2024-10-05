'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { SeasonStat } from '@/lib/databaseAccess';

export const description = 'A bar chart with a custom label';

const chartData = [
	{ month: 'January', desktop: 186, mobile: 80 },
	{ month: 'February', desktop: 305, mobile: 200 },
	{ month: 'March', desktop: 237, mobile: 120 },
	{ month: 'April', desktop: 73, mobile: 190 },
	{ month: 'May', desktop: 209, mobile: 130 },
	{ month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
	desktop: {
		label: 'Desktop',
		color: 'hsl(var(--chart-1))',
	},
	mobile: {
		label: 'Mobile',
		color: 'hsl(var(--chart-2))',
	},
	label: {
		color: 'hsl(var(--foreground)',
	},
} satisfies ChartConfig;

type Props = { data?: SeasonStat[] };

export default function SeasonStats({ data }: Props) {
	if (!data) return <></>;
	return (
		<ChartContainer config={chartConfig} className="min-w-[200px] min-h-[100px] w-full">
			<BarChart
				accessibilityLayer
				data={chartData}
				layout="vertical"
				margin={{
					right: 16,
				}}>
				<CartesianGrid horizontal={false} />
				<YAxis dataKey="month" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} hide />
				<XAxis dataKey="desktop" type="number" hide />
				<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
				<Bar dataKey="desktop" layout="vertical" fill="var(--color-desktop)" radius={4}>
					<LabelList dataKey="month" position="insideLeft" offset={8} className="fill-white" fontSize={12} />
					<LabelList dataKey="desktop" position="right" offset={8} className="fill-white" fontSize={12} />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
