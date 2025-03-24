import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface Location {
  address: string;
}

interface Restaurant {
  id: string;
  name: string;
  locations: Location[];
  venues: any[];
  tables: any[];
  isActive: boolean;
}

const dummyData: Restaurant[] = [
  {
    id: '1',
    name: 'Restaurant A',
    locations: [{ address: '123 Main St' }],
    venues: [1, 2, 3],
    tables: [1, 2, 3, 4],
    isActive: true,
  },
  {
    id: '2',
    name: 'Restaurant B',
    locations: [{ address: '456 Oak Ave' }],
    venues: [1, 2],
    tables: [1, 2],
    isActive: false,
  },
];

const RestaurantsPage: React.FC = () => {
  const navigate = useNavigate();

  const columns: ColumnDef<Restaurant>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Address',
      accessorKey: 'locations',
      cell: ({ row }) => row.original.locations[0]?.address || '-',
    },
    {
      header: 'Venues Count',
      accessorKey: 'venues',
      cell: ({ row }) => row.original.venues.length,
    },
    {
      header: 'Tables Count',
      accessorKey: 'tables',
      cell: ({ row }) => row.original.tables.length,
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleRowClick = (row: Restaurant) => {
    navigate(`/restaurants/${row.id}`);
  };

  const handleAddNew = () => {
    navigate('/restaurants/add');
  };

  return (
    <div className="flex-1 p-8">
      <DataTable
        columns={columns}
        data={dummyData}
        onRowClick={handleRowClick}
        onAddNew={handleAddNew}
      />
    </div>
  );
};

export default RestaurantsPage;
