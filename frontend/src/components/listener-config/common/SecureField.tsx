import React, { useState } from 'react';
import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface SecureFieldProps extends Omit<TextFieldProps, 'type'> {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SecureField({ value, onChange, ...props }: SecureFieldProps) {
    const [showValue, setShowValue] = useState(false);

    const handleClickShowValue = () => {
        setShowValue(!showValue);
    };

    const handleMouseDownValue = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <TextField
            {...props}
            type={showValue ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            fullWidth
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle value visibility"
                            onClick={handleClickShowValue}
                            onMouseDown={handleMouseDownValue}
                            edge="end"
                        >
                            {showValue ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
} 