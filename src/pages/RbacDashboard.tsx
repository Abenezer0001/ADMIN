import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper } from '@mui/material';
import RoleManagement from '../components/rbac/RoleManagement';
import PermissionManagement from '../components/rbac/PermissionManagement';
import UserRoleAssignment from '../components/rbac/UserRoleAssignment';
import { RbacProvider } from '../context/RbacContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rbac-tabpanel-${index}`}
      aria-labelledby={`rbac-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `rbac-tab-${index}`,
    'aria-controls': `rbac-tabpanel-${index}`,
  };
}

const RbacDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <RbacProvider>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Role-Based Access Control
        </Typography>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="RBAC management tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Roles" {...a11yProps(0)} />
            <Tab label="Permissions" {...a11yProps(1)} />
            <Tab label="User Assignments" {...a11yProps(2)} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <RoleManagement />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <PermissionManagement />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <UserRoleAssignment />
          </TabPanel>
        </Paper>
      </Box>
    </RbacProvider>
  );
};

export default RbacDashboard; 