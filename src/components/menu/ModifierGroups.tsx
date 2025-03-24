import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ContentCopy as ContentCopyIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ModifierGroup } from '../../types/menuTypes';
import { mockMenuItemService } from '../../services/mockService';
import { usePreferences } from '../../context/PreferenceContext';

interface Filters {
  required: string;
  hasModifiers: string;
}

const ModifierGroups: React.FC = () => {
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ModifierGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    required: 'all',
    hasModifiers: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await mockMenuItemService.getModifierGroups();
      setGroups(response);
    } catch (error) {
      console.error('Failed to load modifier groups:', error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target.name as keyof Filters;
    setFilters(prev => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const filteredGroups = groups.filter(group => {
    // Search filter
    const matchesSearch = 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group[`name_${preferences.secondaryLanguage.code}`]?.toLowerCase().includes(searchQuery.toLowerCase());

    // Required filter
    const matchesRequired = 
      filters.required === 'all' ||
      (filters.required === 'yes' && group.isRequired) ||
      (filters.required === 'no' && !group.isRequired);

    // Has modifiers filter
    const matchesHasModifiers = 
      filters.hasModifiers === 'all' ||
      (filters.hasModifiers === 'yes' && group.modifiers.length > 0) ||
      (filters.hasModifiers === 'no' && group.modifiers.length === 0);

    return matchesSearch && matchesRequired && matchesHasModifiers;
  });

  const handleDeleteClick = (group: ModifierGroup) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedGroup) {
      try {
        await mockMenuItemService.deleteModifierGroup(selectedGroup.id);
        setGroups(groups.filter(g => g.id !== selectedGroup.id));
        setDeleteDialogOpen(false);
        setSelectedGroup(null);
      } catch (error) {
        console.error('Failed to delete modifier group:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedGroup(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Modifier Groups</Typography>
        <Box>
          <IconButton onClick={() => setShowFilters(!showFilters)} sx={{ mr: 1 }}>
            <FilterListIcon color={showFilters ? 'primary' : undefined} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/menu/modifiers/new')}
          >
            Add Group
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search modifier groups..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {showFilters && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Required</InputLabel>
                  <Select
                    name="required"
                    value={filters.required}
                    label="Required"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="yes">Required</MenuItem>
                    <MenuItem value="no">Optional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Has Modifiers</InputLabel>
                  <Select
                    name="hasModifiers"
                    value={filters.hasModifiers}
                    label="Has Modifiers"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="yes">With Modifiers</MenuItem>
                    <MenuItem value="no">Without Modifiers</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Groups List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{preferences.secondaryLanguage.name}</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Min/Max</TableCell>
              <TableCell>Modifiers</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id} hover>
                <TableCell>{group.name}</TableCell>
                <TableCell dir={preferences.secondaryLanguage.direction}>
                  {group[`name_${preferences.secondaryLanguage.code}`]}
                </TableCell>
                <TableCell>{group.isRequired ? 'Yes' : 'No'}</TableCell>
                <TableCell>{group.minSelect}/{group.maxSelect}</TableCell>
                <TableCell>{group.modifiers.length}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/menu/modifiers/${group.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/menu/modifiers/${group.id}`, { state: { copy: true } })}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(group)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Modifier Group
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete the modifier group "{selectedGroup?.name}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModifierGroups;
