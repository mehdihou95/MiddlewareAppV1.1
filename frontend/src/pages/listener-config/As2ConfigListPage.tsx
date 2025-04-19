import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Switch,
    Breadcrumbs,
    Link,
    CircularProgress,
    Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAs2Config } from '../../hooks/useAs2Config';
import { As2Config } from '../../types/connectors';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const As2ConfigListPage: React.FC = () => {
    const navigate = useNavigate();
    const { configs, loading, error, refreshConfigs, deleteConfig, toggleConfig } = useAs2Config();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<As2Config | null>(null);

    useEffect(() => {
        refreshConfigs();
    }, [refreshConfigs]);

    const handleEdit = (config: As2Config) => {
        navigate(`/listener-config/as2/${config.id}`);
    };

    const handleDelete = async (config: As2Config) => {
        setSelectedConfig(config);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedConfig) {
            await deleteConfig(selectedConfig.id);
            setDeleteDialogOpen(false);
            setSelectedConfig(null);
        }
    };

    const handleToggleActive = async (config: As2Config) => {
        await toggleConfig(config.id);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                {/* Breadcrumb Navigation */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link component={RouterLink} to="/" color="inherit">
                        Home
                    </Link>
                    <Link component={RouterLink} to="/listener-config" color="inherit">
                        Listener Configuration
                    </Link>
                    <Typography color="text.primary">AS2 Configurations</Typography>
                </Breadcrumbs>

                {/* Page Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1">
                        AS2 Configurations
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/listener-config/as2/new')}
                    >
                        Add Configuration
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error.message || 'An error occurred'}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Interface</TableCell>
                                    <TableCell>Server ID</TableCell>
                                    <TableCell>Partner ID</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {configs.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell>{config.client.name}</TableCell>
                                        <TableCell>{config.interfaceConfig.name}</TableCell>
                                        <TableCell>{config.serverId}</TableCell>
                                        <TableCell>{config.partnerId}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={config.active}
                                                onChange={() => handleToggleActive(config)}
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleEdit(config)}
                                                color="primary"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(config)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete AS2 Configuration"
                    content={`Are you sure you want to delete the AS2 configuration for ${selectedConfig?.client.name} - ${selectedConfig?.interfaceConfig.name}?`}
                    onConfirm={confirmDelete}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setSelectedConfig(null);
                    }}
                />
            </Box>
        </Container>
    );
};

export default As2ConfigListPage; 