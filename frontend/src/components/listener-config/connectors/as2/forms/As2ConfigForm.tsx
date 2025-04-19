import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useAs2Config } from '../../../../../hooks/useAs2Config';
import { As2Config, As2ApiName, As2EncryptionAlgorithm, As2SignatureAlgorithm, As2MdnMode } from '../../../../../types/connectors';
import { useClientInterface } from '../../../../../context/ClientInterfaceContext';

// Define the validation schema
const as2ConfigSchema = z.object({
    client: z.object({
        id: z.number(),
        name: z.string()
    }),
    interfaceConfig: z.object({
        id: z.number(),
        name: z.string()
    }),
    serverId: z.string().min(1, 'Server ID is required'),
    partnerId: z.string().min(1, 'Partner ID is required'),
    localId: z.string().min(1, 'Local ID is required'),
    apiName: z.nativeEnum(As2ApiName),
    encryptionAlgorithm: z.nativeEnum(As2EncryptionAlgorithm),
    signatureAlgorithm: z.nativeEnum(As2SignatureAlgorithm),
    compression: z.boolean(),
    mdnMode: z.nativeEnum(As2MdnMode),
    mdnDigestAlgorithm: z.nativeEnum(As2SignatureAlgorithm),
    encryptMessage: z.boolean(),
    signMessage: z.boolean(),
    requestMdn: z.boolean(),
    mdnUrl: z.string().optional(),
    active: z.boolean()
});

type As2ConfigFormValues = z.infer<typeof as2ConfigSchema>;

interface As2ConfigFormProps {
    initialData?: As2Config;
    onSubmit?: (data: As2Config) => void;
    onClose?: () => void;
}

export const As2ConfigForm: React.FC<As2ConfigFormProps> = ({ initialData, onSubmit, onClose }) => {
    const { config, saveConfig, testConnection, loading, error } = useAs2Config();
    const { clients, interfaces, selectedClient, selectedInterface, setSelectedClient, setSelectedInterface, refreshClients, refreshInterfaces } = useClientInterface();
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        refreshClients();
    }, [refreshClients]);

    useEffect(() => {
        if (selectedClient) {
            refreshInterfaces();
        }
    }, [selectedClient, refreshInterfaces]);

    const form = useForm<As2ConfigFormValues>({
        resolver: zodResolver(as2ConfigSchema),
        defaultValues: initialData || {
            client: selectedClient || { id: 0, name: '' },
            interfaceConfig: selectedInterface || { id: 0, name: '' },
            serverId: config?.serverId || '',
            partnerId: config?.partnerId || '',
            localId: config?.localId || '',
            apiName: config?.apiName || As2ApiName.SERVER,
            encryptionAlgorithm: config?.encryptionAlgorithm || As2EncryptionAlgorithm.AES_256,
            signatureAlgorithm: config?.signatureAlgorithm || As2SignatureAlgorithm.SHA256,
            compression: config?.compression || true,
            mdnMode: config?.mdnMode || As2MdnMode.SYNC,
            mdnDigestAlgorithm: config?.mdnDigestAlgorithm || As2SignatureAlgorithm.SHA256,
            encryptMessage: config?.encryptMessage || true,
            signMessage: config?.signMessage || true,
            requestMdn: config?.requestMdn || true,
            mdnUrl: config?.mdnUrl || '',
            active: config?.active || true
        }
    });

    const onSubmitForm = async (data: As2ConfigFormValues) => {
        try {
            const savedConfig = await saveConfig(data as As2Config);
            setTestResult(null);
            if (onSubmit) {
                onSubmit(savedConfig);
            }
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Failed to save AS2 configuration:', error);
        }
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        try {
            const result = await testConnection();
            setTestResult({
                success: result.success,
                message: result.message,
            });
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Failed to test connection',
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleClientChange = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        setSelectedClient(client || null);
        setSelectedInterface(null);
        form.setValue('client', client || { id: 0, name: '' });
        form.setValue('interfaceConfig', { id: 0, name: '' });
    };

    const handleInterfaceChange = (interfaceId: number) => {
        const interface_ = interfaces.find(i => i.id === interfaceId);
        setSelectedInterface(interface_ || null);
        form.setValue('interfaceConfig', interface_ || { id: 0, name: '' });
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">AS2 Configuration</Typography>
                    <Button
                        variant="outlined"
                        onClick={handleTestConnection}
                        disabled={testingConnection || loading}
                    >
                        {testingConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                </Box>

                {testResult && (
                    <Box
                        mb={3}
                        p={2}
                        bgcolor={testResult.success ? 'success.light' : 'error.light'}
                        borderRadius={1}
                    >
                        <Typography color={testResult.success ? 'success.dark' : 'error.dark'}>
                            {testResult.message}
                        </Typography>
                    </Box>
                )}

                <form onSubmit={form.handleSubmit(onSubmitForm)}>
                    <Grid container spacing={3}>
                        {/* Client and Interface Selection */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Client and Interface Selection
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Client</InputLabel>
                                <Controller
                                    name="client"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value.id}
                                            onChange={(e) => handleClientChange(Number(e.target.value))}
                                            label="Client"
                                        >
                                            {clients.map((client) => (
                                                <MenuItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Interface</InputLabel>
                                <Controller
                                    name="interfaceConfig"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value.id}
                                            onChange={(e) => handleInterfaceChange(Number(e.target.value))}
                                            label="Interface"
                                            disabled={!selectedClient}
                                        >
                                            {interfaces.map((interface_) => (
                                                <MenuItem key={interface_.id} value={interface_.id}>
                                                    {interface_.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        {/* AS2 Configuration */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                AS2 Configuration
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="serverId"
                                control={form.control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Server ID"
                                        fullWidth
                                        error={!!form.formState.errors.serverId}
                                        helperText={form.formState.errors.serverId?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="partnerId"
                                control={form.control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Partner ID"
                                        fullWidth
                                        error={!!form.formState.errors.partnerId}
                                        helperText={form.formState.errors.partnerId?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="localId"
                                control={form.control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Local ID"
                                        fullWidth
                                        error={!!form.formState.errors.localId}
                                        helperText={form.formState.errors.localId?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>API Name</InputLabel>
                                <Controller
                                    name="apiName"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="API Name"
                                        >
                                            <MenuItem value={As2ApiName.SERVER}>Server</MenuItem>
                                            <MenuItem value={As2ApiName.CLIENT}>Client</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        {/* Security Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Security Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Encryption Algorithm</InputLabel>
                                <Controller
                                    name="encryptionAlgorithm"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Encryption Algorithm"
                                        >
                                            <MenuItem value={As2EncryptionAlgorithm.AES_128}>AES-128</MenuItem>
                                            <MenuItem value={As2EncryptionAlgorithm.AES_192}>AES-192</MenuItem>
                                            <MenuItem value={As2EncryptionAlgorithm.AES_256}>AES-256</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Signature Algorithm</InputLabel>
                                <Controller
                                    name="signatureAlgorithm"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Signature Algorithm"
                                        >
                                            <MenuItem value={As2SignatureAlgorithm.SHA1}>SHA-1</MenuItem>
                                            <MenuItem value={As2SignatureAlgorithm.SHA256}>SHA-256</MenuItem>
                                            <MenuItem value={As2SignatureAlgorithm.SHA384}>SHA-384</MenuItem>
                                            <MenuItem value={As2SignatureAlgorithm.SHA512}>SHA-512</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>MDN Mode</InputLabel>
                                <Controller
                                    name="mdnMode"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="MDN Mode"
                                        >
                                            <MenuItem value={As2MdnMode.SYNC}>Synchronous</MenuItem>
                                            <MenuItem value={As2MdnMode.ASYNC}>Asynchronous</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>MDN Digest Algorithm</InputLabel>
                                <Controller
                                    name="mdnDigestAlgorithm"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="MDN Digest Algorithm"
                                        >
                                            <MenuItem value={As2SignatureAlgorithm.SHA1}>SHA-1</MenuItem>
                                            <MenuItem value={As2SignatureAlgorithm.SHA256}>SHA-256</MenuItem>
                                            <MenuItem value={As2SignatureAlgorithm.SHA384}>SHA-384</MenuItem>
                                            <MenuItem value={As2SignatureAlgorithm.SHA512}>SHA-512</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        {/* Options */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Options
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="compression"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label="Enable Compression"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="encryptMessage"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label="Encrypt Message"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="signMessage"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label="Sign Message"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="requestMdn"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label="Request MDN"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="active"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>

                        {/* MDN URL (only shown when MDN Mode is ASYNC) */}
                        {form.watch('mdnMode') === As2MdnMode.ASYNC && (
                            <Grid item xs={12}>
                                <Controller
                                    name="mdnUrl"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="MDN URL"
                                            fullWidth
                                            error={!!form.formState.errors.mdnUrl}
                                            helperText={form.formState.errors.mdnUrl?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
}; 