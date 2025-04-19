import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
    FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';

interface CertificateUploadProps {
    certificates: string[];
    onChange: (certificates: string[]) => void;
    error?: boolean;
    helperText?: string;
}

export default function CertificateUpload({
    certificates,
    onChange,
    error,
    helperText,
}: CertificateUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newCertificates: string[] = [];
        const errors: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                // Read the certificate file
                const content = await readFileAsText(file);
                
                // Basic validation that it's a certificate
                if (!content.includes('-----BEGIN CERTIFICATE-----')) {
                    errors.push(`${file.name} is not a valid certificate`);
                    continue;
                }

                newCertificates.push(content);
            } catch (error) {
                errors.push(`Failed to read ${file.name}`);
            }
        }

        if (errors.length > 0) {
            setUploadError(errors.join(', '));
        } else {
            setUploadError(null);
            onChange([...certificates, ...newCertificates]);
        }

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        const newCertificates = certificates.filter((_, i) => i !== index);
        onChange(newCertificates);
    };

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    };

    const getCertificateInfo = (cert: string) => {
        // Extract subject CN from certificate
        const match = cert.match(/CN=([^,\n]+)/);
        return match ? match[1] : 'Unknown Certificate';
    };

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Partner Certificates
            </Typography>
            <Box display="flex" gap={2} mb={2}>
                <input
                    type="file"
                    accept=".cer,.crt,.pem"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
                <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Upload Certificates
                </Button>
            </Box>
            <List>
                {certificates.map((cert, index) => (
                    <ListItem
                        key={index}
                        secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemove(index)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={getCertificateInfo(cert)} />
                    </ListItem>
                ))}
            </List>
            {uploadError && (
                <FormHelperText error>{uploadError}</FormHelperText>
            )}
            {error && helperText && (
                <FormHelperText error>{helperText}</FormHelperText>
            )}
        </Box>
    );
} 