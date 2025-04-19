export enum ConnectorType {
    SFTP = 'SFTP',
    AS2 = 'AS2',
    API = 'API'
}

export interface SftpConfig {
    id: number;
    client: {
        id: number;
        name: string;
    };
    interfaceConfig: {
        id: number;
        name: string;
    };
    host: string;
    port: number;
    username: string;
    password: string;
    privateKeyPath: string;
    privateKeyPassphrase: string;
    monitoredDirectories: string[];
    processedDirectory: string;
    errorDirectory: string;
    connectionTimeout: number;
    channelTimeout: number;
    threadPoolSize: number;
    retryAttempts: number;
    retryDelay: number;
    pollingInterval: number;
    active: boolean;
}

export enum As2EncryptionAlgorithm {
    TRIPLE_DES = '3DES',
    AES_128 = 'AES128',
    AES_192 = 'AES192',
    AES_256 = 'AES256'
}

export enum As2SignatureAlgorithm {
    SHA1 = 'SHA1',
    SHA256 = 'SHA256',
    SHA384 = 'SHA384',
    SHA512 = 'SHA512'
}

export enum As2MdnMode {
    SYNC = 'SYNC',
    ASYNC = 'ASYNC'
}

export enum As2ApiName {
    SERVER = 'SERVER',
    CLIENT = 'CLIENT'
}

export interface As2Config {
    id: string;
    name: string;
    client: {
        id: number;
        name: string;
    };
    interfaceConfig: {
        id: number;
        name: string;
    };
    serverId: string;
    partnerId: string;
    localId: string;
    apiName: As2ApiName;
    encryptionAlgorithm: As2EncryptionAlgorithm;
    signatureAlgorithm: As2SignatureAlgorithm;
    compression: boolean;
    mdnMode: As2MdnMode;
    mdnDigestAlgorithm: As2SignatureAlgorithm;
    encryptMessage: boolean;
    signMessage: boolean;
    requestMdn: boolean;
    mdnUrl?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface As2ConfigFormData {
    client: {
        id: number;
        name: string;
    };
    interfaceConfig: {
        id: number;
        name: string;
    };
    serverId: string;
    partnerId: string;
    localId: string;
    apiName: As2ApiName;
    encryptionAlgorithm: As2EncryptionAlgorithm;
    signatureAlgorithm: As2SignatureAlgorithm;
    compression: boolean;
    mdnMode: As2MdnMode;
    mdnDigestAlgorithm: As2SignatureAlgorithm;
    encryptMessage: boolean;
    signMessage: boolean;
    requestMdn: boolean;
    mdnUrl?: string;
    active: boolean;
}

export interface As2ConfigListResponse {
    configs: As2Config[];
}

export interface As2ConfigCreateResponse {
    config: As2Config;
    message: string;
}

export interface As2ConfigUpdateResponse {
    config: As2Config;
    message: string;
}

export interface As2ConfigDeleteResponse {
    message: string;
}

export interface As2ConfigToggleResponse {
    config: As2Config;
    message: string;
}

export interface ApiConfig {
    baseUrl: string;
    username: string;
    password: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    headers?: Record<string, string>;
}

export interface ConnectorStatus {
    id: string;
    type: string;
    status: string;
    lastChecked: string;
    metrics: {
        messagesProcessed: number;
        errors: number;
        avgProcessingTime: number;
    };
}

export interface AlertConfig {
    enabled: boolean;
    errorThreshold: number;
    processingTimeThreshold: number;
    notificationEmail: string;
    notificationWebhook: string;
} 