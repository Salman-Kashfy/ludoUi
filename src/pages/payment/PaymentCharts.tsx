import { useEffect, useState, useContext } from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { PickersShortcutsItem } from '@mui/x-date-pickers/PickersShortcuts';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import dayjs, { Dayjs } from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, LabelList
} from "recharts";

import { CompanyContext } from '../../hooks/CompanyContext';
import { Payments } from "../../services/payment.service";

interface RevenueSourceSplit {
  source: string;
  tableRevenue: number;
  tournamentRevenue: number;
}

interface PaymentType {
  type: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PaymentCharts() {
  const companyContext = useContext(CompanyContext);
  const companyUuid = companyContext?.companyUuid;

  const [daterange, setDaterange] = useState<{ start: Dayjs | null; end: Dayjs | null }>({
    start: dayjs().startOf("month"),
    end: dayjs().endOf("month"),
  });

  const [barData, setBarData] = useState<RevenueSourceSplit[]>([]);
  const [pieData, setPieData] = useState<PaymentType[]>([]);

  const shortcuts: PickersShortcutsItem<DateRange<Dayjs>>[] = [
    { label: 'Today', getValue: () => [dayjs(), dayjs()] },
    { label: 'Yesterday', getValue: () => [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
    { label: 'Last 7 Days', getValue: () => [dayjs().subtract(6, 'day'), dayjs()] },
    { label: 'Last Month', getValue: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    { label: 'Current Month', getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Reset', getValue: () => [null, null] },
  ];

  const fetchCharts = async () => {
    if (!companyUuid || !daterange.start || !daterange.end) return;

    try {
      const startDate = daterange.start.startOf('day').valueOf().toString();
      const endDate = daterange.end.endOf('day').valueOf().toString();

      // Fetch all payments in date range
      const paymentsResponse = await Payments({ page: 1, limit: 1000, startDate, endDate });
      const paymentsList = paymentsResponse.list ?? [];

      // Pie chart: payment types
      const typeMap: Record<string, number> = {};
      paymentsList.forEach(p => {
        const type = p.method || "Other";
        typeMap[type] = (typeMap[type] || 0) + (p.totalAmount || p.amount);
      });
      setPieData(Object.entries(typeMap).map(([type, value]) => ({ type, value })));

      // Bar chart: day-wise revenue (Tables & Tournaments)
      const revenueByDate: Record<string, { tableRevenue: number; tournamentRevenue: number }> = {};
      paymentsList.forEach(p => {
        const dateKey = new Date(Number(p.createdAt)).toLocaleDateString();
        if (!revenueByDate[dateKey]) revenueByDate[dateKey] = { tableRevenue: 0, tournamentRevenue: 0 };
        if (p.tableSessionId) revenueByDate[dateKey].tableRevenue += (p.totalAmount || p.amount);
        if (p.tournamentId) revenueByDate[dateKey].tournamentRevenue += (p.totalAmount || p.amount);
      });
      setBarData(Object.entries(revenueByDate).map(([source, revenue]) => ({ source, ...revenue })));

    } catch (error) {
      console.error("Failed to fetch payment charts:", error);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, [companyUuid, daterange]);

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h5" gutterBottom>Payment Charts</Typography>

      {/* Date Range Picker */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateRangePicker
              slots={{ field: SingleInputDateRangeField }}
              value={[daterange.start, daterange.end]}
              onChange={(values: DateRange<Dayjs>) => setDaterange({ start: values[0], end: values[1] })}
              slotProps={{
                textField: { variant: 'outlined', fullWidth: true },
                shortcuts: { items: shortcuts },
              }}
            />
          </LocalizationProvider>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Bar chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Day-wise Revenue (Tables & Tournaments)</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tableRevenue" name="Table Revenue" fill="#1976d2">
                    <LabelList dataKey="tableRevenue" position="top" />
                  </Bar>
                  <Bar dataKey="tournamentRevenue" name="Tournament Revenue" fill="#FFBB28">
                    <LabelList dataKey="tournamentRevenue" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Types</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
