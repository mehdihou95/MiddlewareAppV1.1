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
import { useSftpConfig } from '../../hooks/useSftpConfig';
import { SftpConfig } from '../../types/connectors';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SftpConfigListPage: React.FC = () => {
    const navigate = useNavigate();
    const { getAllConfigurations, deleteConfiguration, toggleActive, loading, error } = useSftpConfig();
    const [configs, setConfigs] = useState<SftpConfig[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<SftpConfig | null>(null);

    useEffect(() => {
        loadConfigurations();
    }, []);

    const loadConfigurations = async () => {
        const data = await getAllConfigurations();
        if (data) {
            setConfigs(data);
        }
    };

    const handleEdit = (config: SftpConfig) => {
        navigate(`/listener-config/sftp/${config.id}`);
    };

    const handleDelete = async (config: SftpConfig) => {
        setSelectedConfig(config);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedConfig) {
            await deleteConfiguration(selectedConfig.id);
            await loadConfigurations();
            setDeleteDialogOpen(false);
            setSelectedConfig(null);
        }
    };

    const handleToggleActive = async (config: SftpConfig) => {
        await toggleActive(config.id);
        await loadConfigurations();
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
                    <Typography color="text.primary">SFTP Configurations</Typography>
                </Breadcrumbs>

                {/* Page Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1">
                        SFTP Configurations
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/listener-config/sftp/new')}
                    >
                        Add Configuration
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
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
                                    <TableCell>Host</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {configs.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell>{config.client.name}</TableCell>
                                        <TableCell>{config.interfaceConfig.name}</TableCell>
                                        <TableCell>{config.host}</TableCell>
                                        <TableCell>{config.username}</TableCell>
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
                    title="Delete SFTP Configuration"
                    content={`Are you sure you want to delete the SFTP configuration for ${selectedConfig?.client.name} - ${selectedConfig?.interfaceConfig.name}?`}
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

export default SftpConfigListPage; 