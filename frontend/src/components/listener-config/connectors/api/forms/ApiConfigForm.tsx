import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useApiConfig } from '../../../../../hooks/useApiConfig';

// Validation schema for API configuration
const apiConfigSchema = z.object({
    baseUrl: z.string().url('Invalid URL format'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    timeout: z.coerce.number().min(1000).max(30000),
    retryAttempts: z.coerce.number().min(0).max(5),
    retryDelay: z.coerce.number().min(1000).max(30000),
    headers: z.record(z.string()).optional(),
});

type ApiConfigFormValues = z.infer<typeof apiConfigSchema>;

export default function ApiConfigForm() {
    const { config, saveConfig, testConnection, loading, error } = useApiConfig();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ApiConfigFormValues>({
        resolver: zodResolver(apiConfigSchema),
        defaultValues: config || {
            baseUrl: '',
            username: '',
            password: '',
            timeout: 5000,
            retryAttempts: 3,
            retryDelay: 1000,
            headers: {},
        },
    });

    const onSubmit = async (data: ApiConfigFormValues) => {
        try {
            await saveConfig(data);
        } catch (error) {
            console.error('Failed to save API configuration:', error);
        }
    };

    const handleTestConnection = async () => {
        try {
            const result = await testConnection();
            if (result.success) {
                // Show success message
            } else {
                // Show error message
            }
        } catch (error) {
            console.error('Failed to test API connection:', error);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    API Connection Configuration
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        {/* Server Details */}
                        <Grid item xs={12}>
                            <Controller
                                name="baseUrl"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Base URL"
                                        fullWidth
                                        error={!!errors.baseUrl}
                                        helperText={errors.baseUrl?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Authentication */}
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

                        {/* Connection Settings */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Connection Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="timeout"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Timeout (ms)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.timeout}
                                        helperText={errors.timeout?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="retryAttempts"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Retry Attempts"
                                        type="number"
                                        fullWidth
                                        error={!!errors.retryAttempts}
                                        helperText={errors.retryAttempts?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="retryDelay"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Retry Delay (ms)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.retryDelay}
                                        helperText={errors.retryDelay?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Form Actions */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleTestConnection}
                                    disabled={loading || isSubmitting}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Test Connection'}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || isSubmitting}
                                >
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Save Configuration'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
} 