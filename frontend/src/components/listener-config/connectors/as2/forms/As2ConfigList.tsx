import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { As2Config } from '../../../../../types/connectors';
import { useAs2Config } from '../../../../../hooks/useAs2Config';
import { As2ConfigForm } from './As2ConfigForm';
import { ConfirmDialog } from '../../../common/ConfirmDialog';

interface As2ConfigListProps {
    onConfigSelect?: (config: As2Config) => void;
}

export function As2ConfigList({ onConfigSelect }: As2ConfigListProps) {
    const { configs, loading, error, deleteConfig, toggleConfig } = useAs2Config();
    const [selectedConfig, setSelectedConfig] = useState<As2Config | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [configToDelete, setConfigToDelete] = useState<As2Config | null>(null);

    const handleEdit = (config: As2Config) => {
        setSelectedConfig(config);
        setIsFormOpen(true);
    };

    const handleDelete = (config: As2Config) => {
        setConfigToDelete(config);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (configToDelete) {
            try {
                await deleteConfig(configToDelete.id);
                setIsDeleteDialogOpen(false);
                setConfigToDelete(null);
            } catch (error) {
                console.error('Failed to delete AS2 configuration:', error);
            }
        }
    };

    const handleToggle = async (config: As2Config) => {
        try {
            await toggleConfig(config.id);
        } catch (error) {
            console.error('Failed to toggle AS2 configuration:', error);
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">Error: {error.message}</Typography>;
    }

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">AS2 Configurations</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setSelectedConfig(null);
                            setIsFormOpen(true);
                        }}
                    >
                        Add Configuration
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Partner ID</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {configs.map((config) => (
                                <TableRow key={config.id}>
                                    <TableCell>{config.name}</TableCell>
                                    <TableCell>{config.partnerId}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={config.active ? 'Active' : 'Inactive'}
                                            color={config.active ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(config)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(config)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {isFormOpen && (
                    <As2ConfigForm
                        initialData={selectedConfig || undefined}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedConfig(null);
                        }}
                    />
                )}

                <ConfirmDialog
                    open={isDeleteDialogOpen}
                    title="Delete Configuration"
                    content="Are you sure you want to delete this AS2 configuration?"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => {
                        setIsDeleteDialogOpen(false);
                        setConfigToDelete(null);
                    }}
                />
            </CardContent>
        </Card>
    );
} 