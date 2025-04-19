import React, { useState } from 'react';
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
    Switch,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import { useSftpConfig } from '../../../../../hooks/useSftpConfig';
import { SftpConfig } from '../../../../../types/connectors';
import { useClientInterface } from '../../../../../context/ClientInterfaceContext';
import ClientInterfaceSelector from '../../../../inbound-config/ClientInterfaceSelector';

// Define the validation schema
const sftpConfigSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().min(1, 'Port is required').max(65535, 'Port must be between 1 and 65535'),
    username: z.string().min(1, 'Username is required'),
    password: z.string(),
    privateKeyPath: z.string(),
    privateKeyPassphrase: z.string(),
    monitoredDirectories: z.array(z.string()).min(1, 'At least one monitored directory is required'),
    processedDirectory: z.string().min(1, 'Processed directory is required'),
    errorDirectory: z.string().min(1, 'Error directory is required'),
    connectionTimeout: z.number().min(1000, 'Connection timeout must be at least 1000ms'),
    channelTimeout: z.number(),
    threadPoolSize: z.number().min(1, 'Thread pool size must be at least 1'),
});

type SftpConfigFormValues = z.infer<typeof sftpConfigSchema>;

export default function SftpConfigForm() {
    const { 
        loading: configLoading, 
        error: configError,
        createConfiguration,
        testConnection 
    } = useSftpConfig();
    
    const {
        selectedClient,
        selectedInterface,
        loading: clientLoading,
        error: clientError
    } = useClientInterface();

    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [usePrivateKey, setUsePrivateKey] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<SftpConfigFormValues>({
        resolver: zodResolver(sftpConfigSchema),
        defaultValues: {
            host: '',
            port: 22,
            username: '',
            password: '',
            privateKeyPath: '',
            privateKeyPassphrase: '',
            monitoredDirectories: ['/inbound'],
            processedDirectory: '/processed',
            errorDirectory: '/error',
            connectionTimeout: 5000,
            channelTimeout: 30000,
            threadPoolSize: 4,
        },
    });

    const onSubmit = async (data: SftpConfigFormValues) => {
        if (!selectedClient || !selectedInterface) {
            return;
        }

        try {
            const configData: SftpConfig = {
                ...data,
                id: 0, // New config
                active: true,
                client: selectedClient,
                interfaceConfig: selectedInterface,
                retryAttempts: 3,
                retryDelay: 1000,
                pollingInterval: 10000,
                channelTimeout: data.channelTimeout || 30000
            };
            await createConfiguration(configData);
            setTestResult(null);
        } catch (error) {
            console.error('Failed to save SFTP configuration:', error);
        }
    };

    const handleTestConnection = async () => {
        if (!selectedClient || !selectedInterface) {
            return;
        }

        setTestingConnection(true);
        try {
            const formData = getValues();
            const configData: SftpConfig = {
                ...formData,
                id: 0,
                active: true,
                client: selectedClient,
                interfaceConfig: selectedInterface,
                retryAttempts: 3,
                retryDelay: 1000,
                pollingInterval: 10000,
                channelTimeout: formData.channelTimeout || 30000
            };
            const result = await testConnection(configData);
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

    const isFormDisabled = !selectedClient || !selectedInterface || configLoading || clientLoading;

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">SFTP Configuration</Typography>
                    <Button
                        variant="outlined"
                        onClick={handleTestConnection}
                        disabled={isFormDisabled || testingConnection}
                    >
                        {testingConnection ? 'Testing...' : 'Test Connection'}
                    </Button>
                </Box>

                {(configError || clientError) && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {configError || clientError}
                    </Alert>
                )}

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

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        {/* Client and Interface Selection */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Client and Interface Selection
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <ClientInterfaceSelector required showManageButtons />
                        </Grid>

                        {/* Server Configuration */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Server Configuration
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="host"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Host"
                                        fullWidth
                                        error={!!errors.host}
                                        helperText={errors.host?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="port"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Port"
                                        type="number"
                                        fullWidth
                                        error={!!errors.port}
                                        helperText={errors.port?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Username"
                                        fullWidth
                                        error={!!errors.username}
                                        helperText={errors.username?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Authentication */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Authentication
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={usePrivateKey}
                                        onChange={(e) => setUsePrivateKey(e.target.checked)}
                                    />
                                }
                                label="Use Private Key Authentication"
                            />
                        </Grid>

                        {!usePrivateKey ? (
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Password"
                                            type="password"
                                            fullWidth
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        ) : (
                            <>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="privateKeyPath"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Private Key Path"
                                                fullWidth
                                                error={!!errors.privateKeyPath}
                                                helperText={errors.privateKeyPath?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="privateKeyPassphrase"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Private Key Passphrase"
                                                type="password"
                                                fullWidth
                                                error={!!errors.privateKeyPassphrase}
                                                helperText={errors.privateKeyPassphrase?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Directory Configuration */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Directory Configuration
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Controller
                                name="monitoredDirectories"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Monitored Directories"
                                        fullWidth
                                        error={!!errors.monitoredDirectories}
                                        helperText={errors.monitoredDirectories?.message || 'Comma-separated list of directories'}
                                        onChange={(e) => field.onChange(e.target.value.split(',').map(d => d.trim()))}
                                        value={field.value.join(', ')}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="processedDirectory"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Processed Directory"
                                        fullWidth
                                        error={!!errors.processedDirectory}
                                        helperText={errors.processedDirectory?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="errorDirectory"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Error Directory"
                                        fullWidth
                                        error={!!errors.errorDirectory}
                                        helperText={errors.errorDirectory?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Connection Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Connection Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="connectionTimeout"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Connection Timeout (ms)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.connectionTimeout}
                                        helperText={errors.connectionTimeout?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="channelTimeout"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Channel Timeout (ms)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.channelTimeout}
                                        helperText={errors.channelTimeout?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="threadPoolSize"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Thread Pool Size"
                                        type="number"
                                        fullWidth
                                        error={!!errors.threadPoolSize}
                                        helperText={errors.threadPoolSize?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isFormDisabled}
                                >
                                    {configLoading ? 'Saving...' : 'Save Configuration'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
} 