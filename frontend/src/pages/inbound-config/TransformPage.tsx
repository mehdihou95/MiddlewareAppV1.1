import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { useClientInterface } from '../../context/ClientInterfaceContext';
import ClientInterfaceSelector from '../../components/inbound-config/ClientInterfaceSelector';
import { XsdElement, MappingRule, DatabaseField } from '../../types';
import { xsdService } from '../../services/xsdService';
import XmlElementTree from '../../components/inbound-config/XmlElementTree';
import DatabaseFieldTree from '../../components/inbound-config/DatabaseFieldTree';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const TransformPage: React.FC = () => {
  const { selectedClient, selectedInterface } = useClientInterface();
  const [xsdElements, setXsdElements] = useState<XsdElement[]>([]);
  const [dbFields, setDbFields] = useState<DatabaseField[]>([]);
  const [selectedXsdElement, setSelectedXsdElement] = useState<XsdElement | null>(null);
  const [selectedXsdPath, setSelectedXsdPath] = useState<string>('');
  const [selectedDbField, setSelectedDbField] = useState('');
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMapping, setNewMapping] = useState<Omit<MappingRule, 'id'>>({
    clientId: 0,
    interfaceId: 0,
    name: '',
    xmlPath: '',
    databaseField: '',
    xsdElement: '',
    tableName: '',
    dataType: '',
    isAttribute: false,
    description: '',
    required: false,
    defaultValue: '',
    priority: 0,
    transformationRule: '',
    isActive: true,
    sourceField: '',
    targetField: ''
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [loading, setLoading] = useState(false);
  const [mappingSearchTerm, setMappingSearchTerm] = useState('');

  const loadXsdStructure = useCallback(async () => {
    if (!selectedInterface) return;
    
    try {
      setLoading(true);
      const elements = await xsdService.getXsdStructureById(selectedInterface.id);
      setXsdElements(elements);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load XSD structure',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedInterface]);

  const loadDatabaseFields = useCallback(async () => {
    if (!selectedClient || !selectedInterface) return;
    
    try {
      setLoading(true);
      const fields = await xsdService.getDatabaseFields(selectedClient.id, selectedInterface.id);
      setDbFields(fields);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load database fields',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClient, selectedInterface]);

  const loadMappingRules = useCallback(async () => {
    if (!selectedClient || !selectedInterface) return;
    
    try {
      setLoading(true);
      const rules = await xsdService.getMappingRules(selectedClient.id, selectedInterface.id);
      setMappingRules(rules);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load mapping rules',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClient, selectedInterface]);

  const handleXsdElementClick = (element: XsdElement, path: string) => {
    setSelectedXsdElement(element);
    setSelectedXsdPath(path);
  };

  const handleDbFieldClick = (fieldNameStr: string) => {
    setSelectedDbField(fieldNameStr);
    if (selectedXsdElement && selectedClient && selectedInterface) {
      const isAttribute = false;
      const parts = fieldNameStr.split('.');
      const tableName = parts[0];
      const fieldNamePart = parts[1];
      const dbField = dbFields.find(f => f.field === fieldNameStr);
      
      if (dbField) {
        setNewMapping({
          clientId: selectedClient.id,
          interfaceId: selectedInterface.id,
          name: `${selectedXsdPath} -> ${fieldNamePart}`,
          xmlPath: selectedXsdPath,
          databaseField: fieldNamePart,
          xsdElement: selectedXsdElement.name,
          tableName: tableName,
          dataType: dbField.type,
          isAttribute: isAttribute,
          description: `Mapping from ${selectedXsdPath} to ${fieldNamePart}`,
          priority: mappingRules.length + 1,
          isActive: true,
          required: false,
          defaultValue: '',
          transformationRule: '',
          sourceField: '',
          targetField: ''
        });
        setOpenDialog(true);
      }
    }
  };

  useEffect(() => {
    if (selectedClient && selectedInterface) {
      loadXsdStructure();
      loadMappingRules();
      loadDatabaseFields();
    }
  }, [selectedClient, selectedInterface, loadXsdStructure, loadMappingRules, loadDatabaseFields]);

  const handleSaveMapping = async () => {
    if (!selectedClient || !selectedInterface) {
      setSnackbar({
        open: true,
        message: 'Please select a client and interface first',
        severity: 'error'
      });
      return;
    }

    try {
      if (!newMapping.xmlPath || !newMapping.databaseField) {
        setSnackbar({
          open: true,
          message: 'Please select both XML element and database field',
          severity: 'error'
        });
        return;
      }

      const savedRule = await xsdService.createMappingRule(newMapping);
      setMappingRules([...mappingRules, savedRule]);
      setOpenDialog(false);
      setSelectedXsdElement(null);
      setSelectedDbField('');
      setSnackbar({
        open: true,
        message: 'Mapping rule saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save mapping rule',
        severity: 'error'
      });
    }
  };

  const handleDeleteMapping = async (id: number) => {
    try {
      await xsdService.deleteMappingRule(id);
      setMappingRules(mappingRules.filter(rule => rule.id !== id));
      setSnackbar({
        open: true,
        message: 'Mapping rule deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete mapping rule',
        severity: 'error'
      });
    }
  };

  const handleRefreshXsd = async () => {
    if (selectedInterface?.id) {
      try {
        setSnackbar({
          open: true,
          message: 'Refreshing XSD structure...',
          severity: 'info'
        });
        await loadXsdStructure();
        setSnackbar({
          open: true,
          message: 'XSD structure refreshed successfully',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to refresh XSD structure',
          severity: 'error'
        });
      }
    }
  };

  const filteredMappingRules = mappingRules.filter(rule => {
    if (!mappingSearchTerm) return true;
    const searchTerm = mappingSearchTerm.toLowerCase();
    return (
      rule.name?.toLowerCase().includes(searchTerm) ||
      rule.xmlPath.toLowerCase().includes(searchTerm) ||
      rule.databaseField.toLowerCase().includes(searchTerm) ||
      rule.description?.toLowerCase().includes(searchTerm) ||
      rule.tableName?.toLowerCase().includes(searchTerm)
    );
  });

  const renderMappingRule = (rule: MappingRule) => (
    <ListItem
      key={rule.id}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}>
          <Typography variant="body2" color="text.secondary">
            {rule.priority || 0}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2" noWrap title={rule.xmlPath}>
            {rule.xmlPath}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2" noWrap title={`${rule.tableName}.${rule.databaseField}`}>
            {rule.tableName}.{rule.databaseField}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="body2" color="text.secondary" noWrap title={rule.description || ''}>
            {rule.description || 'No description'}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {rule.required && (
              <Tooltip title="Required Field">
                <Box component="span" sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'error.main',
                  display: 'inline-block'
                }} />
              </Tooltip>
            )}
            {!rule.isActive && (
              <Tooltip title="Inactive">
                <Box component="span" sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'text.disabled',
                  display: 'inline-block'
                }} />
              </Tooltip>
            )}
            <IconButton
              size="small"
              onClick={() => handleDeleteMapping(rule.id!)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </ListItem>
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: 3, gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">XML to Database Mapping</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefreshXsd}
            startIcon={<RefreshIcon />}
            disabled={!selectedClient || !selectedInterface}
          >
            Refresh XSD
          </Button>
        </Box>
      </Box>

      <ClientInterfaceSelector required />

      {!selectedClient || !selectedInterface ? (
        <Alert severity="info">
          Please select a client and interface to view and manage mapping rules
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ 
                p: 2, 
                height: '60vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" gutterBottom>XML Structure</Typography>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <XmlElementTree
                    elements={xsdElements}
                    onElementClick={handleXsdElementClick}
                    selectedElement={selectedXsdElement}
                  />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper sx={{ 
                p: 2, 
                height: '60vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" gutterBottom>Database Fields</Typography>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <DatabaseFieldTree
                    fields={dbFields}
                    onFieldClick={handleDbFieldClick}
                    selectedField={selectedDbField}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Mapping Rules</Typography>
              <TextField
                size="small"
                placeholder="Search mappings..."
                value={mappingSearchTerm}
                onChange={(e) => setMappingSearchTerm(e.target.value)}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Box>
            <List sx={{ maxHeight: '30vh', overflow: 'auto' }}>
              {filteredMappingRules.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={
                      mappingSearchTerm 
                        ? "No mapping rules found matching your search"
                        : "No mapping rules defined yet"
                    } 
                  />
                </ListItem>
              ) : (
                filteredMappingRules.map((rule: MappingRule) => renderMappingRule(rule))
              )}
            </List>
          </Paper>
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Mapping Rule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Name"
                value={newMapping.name}
                onChange={(e) => setNewMapping({...newMapping, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="XML Path"
                value={newMapping.xmlPath}
                onChange={(e) => setNewMapping({...newMapping, xmlPath: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Database Field"
                value={newMapping.databaseField}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Description"
                value={newMapping.description}
                onChange={(e) => setNewMapping({...newMapping, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Default Value"
                value={newMapping.defaultValue || ''}
                onChange={(e) => setNewMapping({...newMapping, defaultValue: e.target.value})}
                helperText="Value to use if XML path is not found"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Priority"
                type="number"
                value={newMapping.priority || 0}
                onChange={(e) => setNewMapping({...newMapping, priority: parseInt(e.target.value) || 0})}
                helperText="Processing order priority"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transformation Rule"
                value={newMapping.transformationRule || ''}
                onChange={(e) => setNewMapping({...newMapping, transformationRule: e.target.value})}
                helperText="Optional transformation to apply to the value"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newMapping.required || false}
                    onChange={(e) => setNewMapping({...newMapping, required: e.target.checked})}
                  />
                }
                label="Required Field"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newMapping.isActive !== false}
                    onChange={(e) => setNewMapping({...newMapping, isActive: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveMapping} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransformPage;