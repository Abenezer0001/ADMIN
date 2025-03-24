import React from 'react';
import { Card, Typography, Grid, Button } from '@mui/material';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, ShoppingOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Overview: React.FC = () => {
  const data = [
    { name: 'Jan', Sales: 1000, Expenses: 400 },
    { name: 'Feb', Sales: 1170, Expenses: 460 },
    { name: 'Mar', Sales: 660, Expenses: 1120 },
    { name: 'Apr', Sales: 1030, Expenses: 540 },
  ];

  const options = {
    responsive: true,
  };

  return (
    <div>
      <Typography variant="h4">Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Total Orders</Typography>
            <Typography variant="h3" gutterBottom>
              2345
            </Typography>
            <ShoppingCartOutlined />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Active Users</Typography>
            <Typography variant="h3" gutterBottom>
              1234
            </Typography>
            <UserOutlined />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Total Revenue</Typography>
            <Typography variant="h3" gutterBottom>
              15432
            </Typography>
            <DollarOutlined />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Total Products</Typography>
            <Typography variant="h3" gutterBottom>
              543
            </Typography>
            <ShoppingOutlined />
          </Card>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Sales</Typography>
            <Typography variant="h3" gutterBottom>
              75%
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Expenses</Typography>
            <Typography variant="h3" gutterBottom>
              50%
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Profit</Typography>
            <Typography variant="h3" gutterBottom>
              85%
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Typography variant="h5">Growth</Typography>
            <Typography variant="h3" gutterBottom>
              60%
            </Typography>
          </Card>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Button startIcon={<BarChartOutlined />} variant="contained">
              Sales Chart
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Button startIcon={<PieChartOutlined />} variant="contained">
              Expenses Pie Chart
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <Button startIcon={<LineChartOutlined />} variant="contained">
              Profit Line Chart
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <AreaChart width={500} height={300} data={data} options={options}>
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="Sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorPv)" />
              <Area type="monotone" dataKey="Expenses" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
            </AreaChart>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Overview;
