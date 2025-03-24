// import React from 'react';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
//   MRT_GlobalFilterTextField,
//   MRT_ToggleFiltersButton,
// } from 'material-react-table';
// import {
//   Box,
//   IconButton,
//   Tooltip,
//   Typography,
//   lighten,
// } from '@mui/material';
// import {
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
// } from '@mui/icons-material';

// interface DataTableProps<T extends Record<string, any>> {
//   columns: MRT_ColumnDef<T>[];
//   data: T[];
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
//   onView?: (row: T) => void;
//   enableRowSelection?: boolean;
//   enableColumnFilters?: boolean;
//   enableColumnOrdering?: boolean;
//   enablePinning?: boolean;
//   enableGrouping?: boolean;
// }

// const DataTable = <T extends Record<string, any>>({
//   columns,
//   data,
//   onEdit,
//   onDelete,
//   onView,
//   enableRowSelection = false,
//   enableColumnFilters = true,
//   enableColumnOrdering = true,
//   enablePinning = true,
//   enableGrouping = false,
// }: DataTableProps<T>) => {
  
//   const table = useMaterialReactTable({
//     columns,
//     data,
//     enableColumnFilterModes: true,
//     enableColumnOrdering,
//     enableGrouping,
//     enableColumnPinning: enablePinning,
//     enableFacetedValues: true,
//     enableRowActions: true,
//     enableRowSelection,
//     enableColumnFilters,
//     initialState: {
//       showColumnFilters: true,
//       showGlobalFilter: true,
//       columnPinning: {
//         left: enableRowSelection ? ['mrt-row-select'] : [],
//         right: ['mrt-row-actions'],
//       },
//     },
//     paginationDisplayMode: 'pages',
//     positionToolbarAlertBanner: 'bottom',
//     muiSearchTextFieldProps: {
//       size: 'small',
//       variant: 'outlined',
//     },
//     muiPaginationProps: {
//       color: 'primary',
//       rowsPerPageOptions: [5, 10, 25],
//       shape: 'rounded',
//       variant: 'outlined',
//     },
//     renderRowActions: ({ row }) => (
//       <Box sx={{ display: 'flex', gap: '0.5rem' }}>
//         {onView && (
//           <Tooltip title="View">
//             <IconButton onClick={() => onView(row.original)} size="small">
//               <ViewIcon />
//             </IconButton>
//           </Tooltip>
//         )}
//         {onEdit && (
//           <Tooltip title="Edit">
//             <IconButton onClick={() => onEdit(row.original)} size="small">
//               <EditIcon />
//             </IconButton>
//           </Tooltip>
//         )}
//         {onDelete && (
//           <Tooltip title="Delete">
//             <IconButton 
//               onClick={() => onDelete(row.original)}
//               size="small"
//               color="error"
//             >
//               <DeleteIcon />
//             </IconButton>
//           </Tooltip>
//         )}
//       </Box>
//     ),
//     renderTopToolbar: ({ table }) => (
//       <Box
//         sx={(theme) => ({
//           backgroundColor: lighten(theme.palette.background.default, 0.05),
//           display: 'flex',
//           gap: '0.5rem',
//           p: '8px',
//           justifyContent: 'space-between',
//         })}
//       >
//         <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
//           <MRT_GlobalFilterTextField table={table} />
//           <MRT_ToggleFiltersButton table={table} />
//         </Box>
//       </Box>
//     ),
//     renderDetailPanel: ({ row }) => (
//       <Box>
//         <Typography>Address: {row.original.address}</Typography>
//       </Box>
//     ),
//   });

//   return <MaterialReactTable table={table} />;
// };

// export default DataTable;
import React from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from 'material-react-table';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  lighten,
  Stack,
} from '@mui/material';
import { DateRange } from 'react-date-range';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface DataTableProps<T extends Record<string, any>> {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  enableRowSelection?: boolean;
  enableColumnFilters?: boolean;
  enableColumnOrdering?: boolean;
  enablePinning?: boolean;
  enableGrouping?: boolean;
  dateRange?: any;
  onDateChange?: (range: any) => void;
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  enableRowSelection = false,
  enableColumnFilters = true,
  enableColumnOrdering = true,
  enablePinning = true,
  enableGrouping = false,
  dateRange,
  onDateChange,
}: DataTableProps<T>) => {
  
  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnOrdering,
    enableGrouping,
    enableColumnPinning: enablePinning,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection,
    enableColumnFilters,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: enableRowSelection ? ['mrt-row-select'] : [],
        right: ['mrt-row-actions'],
      },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'primary',
      rowsPerPageOptions: [5, 10, 25],
      shape: 'rounded',
      variant: 'outlined',
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        {onView && (
          <Tooltip title="View">
            <IconButton onClick={() => onView(row.original)} size="small">
              <ViewIcon />
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(row.original)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton 
              onClick={() => onDelete(row.original)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbar: ({ table }) => (
      <Box
        sx={(theme) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.05),
          display: 'flex',
          gap: '2rem',
          p: '16px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        })}
      >
        <Stack direction="row" gap={2} alignItems="center">
          <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <MRT_GlobalFilterTextField table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Box>
          
          {dateRange && onDateChange && (
            <DateRange
              ranges={[dateRange]}
              onChange={onDateChange}
              rangeColors={[theme.palette.primary.main]}
              showPreview={false}
            />
          )}
        </Stack>
      </Box>
    ),
    renderDetailPanel: ({ row }) => (
      <Box>
        <Typography>Address: {row.original.address}</Typography>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default DataTable;