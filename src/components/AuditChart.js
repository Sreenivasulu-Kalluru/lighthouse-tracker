'use client'; // This MUST be the first line

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AuditChart({ data }) {
  // 1. Format the data for the chart
  const formattedData = data.map((audit) => ({
    // Format the date to be readable on the X-axis
    date: new Date(audit.created_at).toLocaleDateString(),
    Performance: audit.performance_score,
    Accessibility: audit.accessibility_score,
    'Best Practices': audit.best_practices_score,
    SEO: audit.seo_score,
  }));

  // 2. Render the chart
  return (
    // ResponsiveContainer makes the chart fill its parent div
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Performance" stroke="#8884d8" />
        <Line type="monotone" dataKey="Accessibility" stroke="#82ca9d" />
        <Line type="monotone" dataKey="Best Practices" stroke="#ffc658" />
        <Line type="monotone" dataKey="SEO" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  );
}
