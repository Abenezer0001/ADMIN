import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Tables = () => {
  const navigate = useNavigate();
  const [tables] = React.useState([
    {
      id: '1',
      name: 'I-A1',
      numberOfGuests: null,
      tableType: 'Seat',
      restaurant: 'Cinema City Arabian Centre',
      zone: 'Club',
    },
    {
      id: '2',
      name: 'I-A10',
      numberOfGuests: null,
      tableType: 'Seat',
      restaurant: 'Cinema City Arabian Centre',
      zone: 'Club',
    },
    {
      id: '3',
      name: 'I-A11',
      numberOfGuests: null,
      tableType: 'Seat',
      restaurant: 'Cinema City Arabian Centre',
      zone: 'Club',
    },
    {
      id: '4',
      name: 'I-A12',
      numberOfGuests: null,
      tableType: 'Seat',
      restaurant: 'Cinema City Arabian Centre',
      zone: 'Club',
    },
    {
      id: '5',
      name: 'I-A13',
      numberOfGuests: null,
      tableType: 'Seat',
      restaurant: 'Cinema City Arabian Centre',
      zone: 'Club',
    },
  ]);

  const handleEdit = (tableId: string) => {
    navigate(`/tables/${tableId}/edit`);
  };

  const handleOpen = (tableId: string) => {
    // Implement open table functionality
    console.log('Opening table:', tableId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Tables
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Number of guests</TableCell>
              <TableCell>Table Type</TableCell>
              <TableCell>Restaurant</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id}>
                <TableCell>{table.name}</TableCell>
                <TableCell>{table.numberOfGuests || '-'}</TableCell>
                <TableCell>{table.tableType}</TableCell>
                <TableCell>{table.restaurant}</TableCell>
                <TableCell>{table.zone}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEdit(table.id)}
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleOpen(table.id)}
                    startIcon={<OpenIcon />}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Tables;
