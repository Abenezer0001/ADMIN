import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import TablesList from './TablesList';
import TableForm from './TableForm';
import TableSettings from './TableSettings';
import { TableFormData } from '../../types/tableTypes';

// Mock data for demonstration
const mockTables = {
  '1': {
    id: '1',
    name: 'I-A1',
    tableType: 'Seat',
    restaurant: 'Cinema City Arabian Centre',
    zone: 'Club',
  },
  '2': {
    id: '2',
    name: 'I-A10',
    tableType: 'Seat',
    restaurant: 'Cinema City Arabian Centre',
    zone: 'Club',
  },
};

const EditTableWrapper: React.FC = () => {
  const { id } = useParams();
  const tableData = id ? mockTables[id] : null;

  if (!tableData) {
    return <div>Table not found</div>;
  }

  return (
    <TableForm
      title={`Change: ${tableData.name}`}
      initialData={{
        name: tableData.name,
        tableType: tableData.tableType,
        restaurant: tableData.restaurant,
        zone: tableData.zone,
      }}
      onSubmit={(data) => console.log('Updating table:', data)}
    />
  );
};

const TablesPage: React.FC = () => {
  const handleSubmit = (data: TableFormData) => {
    console.log('Submitting table data:', data);
    // TODO: Implement API call
  };

  return (
    <Routes>
      <Route index element={<TablesList />} />
      <Route
        path="new"
        element={<TableForm title="Add new table" onSubmit={handleSubmit} />}
      />
      <Route path=":id/edit" element={<EditTableWrapper />} />
      <Route path="settings" element={<TableSettings />} />
    </Routes>
  );
};

export default TablesPage;
