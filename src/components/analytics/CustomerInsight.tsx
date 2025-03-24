import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Mock data
const customerSummary = {
  totalCustomers: 3245,
  repeatRate: 68,
  averageSpend: 42.75,
  growthRate: 15.3
};

const customerSegments = [
  { segment: 'Regulars', count: 1245, percentOfTotal: 38, averageSpend: 58.50, visits: 12 },
  { segment: 'Occasionals', count: 985, percentOfTotal: 30, averageSpend: 45.25, visits: 5 },
  { segment: 'New Customers', count: 675, percentOfTotal: 21, averageSpend: 32.80, visits: 1 },
  { segment: 'One-time', count: 340, percentOfTotal: 11, averageSpend: 28.40, visits: 1 }
];

const topCustomers = [
  { id: 1, name: 'John Smith', visits: 24, totalSpent: 1680, lastVisit: '2 days ago', favoriteItem: 'Margherita Pizza' },
  { id: 2, name: 'Emma Johnson', visits: 18, totalSpent: 1350, lastVisit: '1 week ago', favoriteItem: 'Caesar Salad' },
  { id: 3, name: 'Michael Brown', visits: 15, totalSpent: 1125, lastVisit: '3 days ago', favoriteItem: 'Cheeseburger' },
  { id: 4, name: 'Sophia Williams', visits: 12, totalSpent: 960, lastVisit: '5 days ago', favoriteItem: 'Chicken Alfredo' },
  { id: 5, name: 'James Davis', visits: 10, totalSpent: 850, lastVisit: '2 weeks ago', favoriteItem: 'Chocolate Cake' }
];

const customerFeedback = [
  { id: 1, name: 'Sarah Miller', rating: 5, comment: 'Excellent service and delicious food! Will definitely come back.', date: '2 days ago' },
  { id: 2, name: 'Robert Wilson', rating: 4, comment: 'Great atmosphere and good food. Service was a bit slow.', date: '1 week ago' },
  { id: 3, name: 'Jennifer Taylor', rating: 5, comment: 'Best restaurant in town! Love the new menu items.', date: '3 days ago' },
  { id: 4, name: 'David Anderson', rating: 3, comment: 'Food was good but portions were smaller than expected.', date: '5 days ago' }
];

function CustomerInsight() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Customer Insights
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Understand your customer base and optimize your service
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Customers
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customerSummary.totalCustomers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <RepeatIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Repeat Rate
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customerSummary.repeatRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Return customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Avg. Spend
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                ${customerSummary.averageSpend}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per customer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Growth Rate
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customerSummary.growthRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Month over month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Segments */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom>
          Customer Segments
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Segment</TableCell>
                <TableCell align="right">Customers</TableCell>
                <TableCell align="right">Avg. Spend</TableCell>
                <TableCell align="right">Avg. Visits</TableCell>
                <TableCell align="right">% of Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerSegments.map((segment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                      {segment.segment}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{segment.count}</TableCell>
                  <TableCell align="right">${segment.averageSpend}</TableCell>
                  <TableCell align="right">{segment.visits}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {segment.percentOfTotal}%
                      </Typography>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={segment.percentOfTotal} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: index === 0 ? '#2e7d32' : index === 1 ? '#1976d2' : index === 2 ? '#ed6c02' : '#d32f2f'
                            }
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Top Customers and Feedback */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Visits</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell align="right">Last Visit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                            {customer.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Favorite: {customer.favoriteItem}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{customer.visits}</TableCell>
                      <TableCell align="right">${customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell align="right">{customer.lastVisit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Recent Customer Feedback
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              {customerFeedback.map((feedback) => (
                <ListItem key={feedback.id} divider={feedback.id < customerFeedback.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: feedback.rating >= 4 ? '#2e7d32' : feedback.rating >= 3 ? '#ed6c02' : '#d32f2f' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {feedback.name}
                        </Typography>
                        <Chip 
                          label={`${feedback.rating}/5`} 
                          size="small" 
                          color={feedback.rating >= 4 ? 'success' : feedback.rating >= 3 ? 'warning' : 'error'} 
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {feedback.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {feedback.date}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary.dark">
                Customer Retention Tip
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Consider implementing a loyalty program to increase your repeat customer rate and average spend per visit.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CustomerInsight;
