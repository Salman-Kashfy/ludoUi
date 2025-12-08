import { useEffect, useState, useContext } from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { PickersShortcutsItem } from '@mui/x-date-pickers/PickersShortcuts';
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function PaymentCharts() {
  const companyContext = useContext(CompanyContext);
  const companyUuid = companyContext?.companyUuid;

  const [daterange, setDaterange] = useState<{ start: Dayjs | null; end: Dayjs | null }>({
    start: dayjs().startOf("month").startOf('day'),
    end: dayjs().endOf("month").endOf('day'),
  });

  const [barData, setBarData] = useState<RevenueSourceSplit[]>([]);
  const [pieData, setPieData] = useState<PaymentType[]>([]);

  const shortcutsItems: PickersShortcutsItem<[Dayjs | null, Dayjs | null]>[] = [
    { label: 'Today', getValue: () => [dayjs().startOf('day'), dayjs().endOf('day')] },
    {
      label: 'Yesterday', getValue: () => {
        const yesterday = dayjs().subtract(1, 'day');
        return [yesterday.startOf('day'), yesterday.endOf('day')];
      }
    },
    { label: 'Last 7 Days', getValue: () => [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
    {
      label: 'Last Month', getValue: () => [
        dayjs().subtract(1, 'month').startOf('month').startOf('day'),
        dayjs().subtract(1, 'month').endOf('month').endOf('day')
      ]
    },
    { label: 'Current Month', getValue: () => [dayjs().startOf('month').startOf('day'), dayjs().endOf('month').endOf('day')] },
    { label: 'Reset', getValue: () => [null, null] },
  ];

  const fetchCharts = async () => {
    if (!companyUuid || !daterange.start || !daterange.end) return;

    const startDate = daterange.start.startOf('day').toISOString();
    const endDate = daterange.end.endOf('day').toISOString();

    try {
      const paymentsResponse = await Payments(
        { page: 1, limit: 1000 },
        { companyUuid, startDate, endDate }
      );
      const paymentsList = paymentsResponse.list ?? [];

      // Pie chart data (payment types)
      const paymentTypesMap: Record<string, number> = {};
      paymentsList.forEach(p => {
        const type = p.method || "Other";
        paymentTypesMap[type] = (paymentTypesMap[type] || 0) + p.totalAmount;
      });
      setPieData(Object.entries(paymentTypesMap).map(([type, value]) => ({ type, value })));

      // Bar chart data (day-wise revenue)
      const revenueMap: Record<string, { tableRevenue: number; tournamentRevenue: number }> = {};
      paymentsList.forEach(p => {
        const dateKey = dayjs(Number(p.createdAt)).format("YYYY-MM-DD");
        if (!revenueMap[dateKey]) revenueMap[dateKey] = { tableRevenue: 0, tournamentRevenue: 0 };
        if (p.tableSessionId) revenueMap[dateKey].tableRevenue += p.totalAmount;
        if (p.tournamentId) revenueMap[dateKey].tournamentRevenue += p.totalAmount;
      });
      setBarData(Object.entries(revenueMap).map(([source, values]) => ({
        source,
        tableRevenue: values.tableRevenue,
        tournamentRevenue: values.tournamentRevenue
      })));

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
              name="allowedRange"
              defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
              format="MMM DD, YYYY"
              label="Select Daterange"
              onChange={(values) => setDaterange({
                start: values[0] ? values[0].startOf('day') : null,
                end: values[1] ? values[1].endOf('day') : null
              })}
              slotProps={{
                textField: {
                  variant: 'standard',
                  sx: { width: '100%' },
                },
                shortcuts: {
                  items: shortcutsItems,
                },
              }}
            />
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Charts side by side */}
      <Grid container spacing={3} justifyContent="space-between">
        <Grid item sx={{ width: '49%' }}>
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

        <Grid item sx={{ width: '49%' }}>
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
