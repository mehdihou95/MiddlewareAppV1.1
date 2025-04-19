package com.middleware.listener.connectors.sftp.config;

import com.middleware.listener.connectors.sftp.model.SftpConfig;
import com.middleware.listener.connectors.sftp.service.SftpConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SftpCamelConfig {
    private final SftpConfigService sftpConfigService;
    private final CamelContext camelContext;

    @PostConstruct
    public void initializeRoutes() {
        updateRoutes();
    }

    @Scheduled(fixedDelay = 60000) // Check for config changes every minute
    public void updateRoutes() {
        List<SftpConfig> activeConfigs = sftpConfigService.getActiveConfigurations();
        
        // Remove inactive routes
        removeInactiveRoutes(activeConfigs);
        
        // Add or update routes for active configs
        for (SftpConfig config : activeConfigs) {
            createOrUpdateRoute(config);
        }
    }

    private void createOrUpdateRoute(SftpConfig config) {
        try {
            String routeId = buildRouteId(config);
            
            // Remove existing route if it exists
            if (camelContext.getRoute(routeId) != null) {
                camelContext.removeRoute(routeId);
            }

            // Create new route
            camelContext.addRoutes(new RouteBuilder() {
                @Override
                public void configure() throws Exception {
                    // Error handling
                    errorHandler(defaultErrorHandler()
                        .maximumRedeliveries(config.getRetryAttempts())
                        .redeliveryDelay(config.getRetryDelay())
                        .backOffMultiplier(2)
                        .useExponentialBackOff());

                    // Process each monitored directory
                    for (String directory : config.getMonitoredDirectoriesAsList()) {
                        from(buildSftpUri(config, directory))
                            .routeId(routeId + "-" + directory.replace('/', '-'))
                            .log("Retrieved file ${header.CamelFileName} from SFTP server for client: " + config.getClient().getName())
                            .setHeader("ClientId", constant(config.getClient().getId()))
                            .setHeader("InterfaceId", constant(config.getInterfaceConfig().getId()))
                            .to("direct:processInboundFile")
                            .log("Completed processing ${header.CamelFileName}");
                    }
                }
            });
            
            log.info("Created/Updated SFTP route for client: {} and interface: {}", 
                    config.getClient().getId(), config.getInterfaceConfig().getId());
        } catch (Exception e) {
            log.error("Failed to create/update route for config: " + config.getId(), e);
        }
    }

    private String buildRouteId(SftpConfig config) {
        return String.format("sftp-%d-%d", config.getClient().getId(), config.getInterfaceConfig().getId());
    }

    private String buildSftpUri(SftpConfig config, String directory) {
        StringBuilder uri = new StringBuilder();
        uri.append("sftp://").append(config.getUsername());
        if (config.getPassword() != null) {
            uri.append(":").append(config.getPassword());
        }
        uri.append("@").append(config.getHost())
           .append(":").append(config.getPort())
           .append(directory)
           .append("?delete=false")
           .append("&move=.processed")
           .append("&moveFailed=.error")
           .append("&readLock=changed")
           .append("&readLockTimeout=").append(config.getPollingInterval())
           .append("&disconnect=true")
           .append("&maximumReconnectAttempts=").append(config.getRetryAttempts())
           .append("&reconnectDelay=").append(config.getRetryDelay())
           .append("&connectTimeout=").append(config.getConnectionTimeout())
           .append("&disconnect=true");

        if (config.getPrivateKeyPath() != null) {
            uri.append("&privateKeyFile=").append(config.getPrivateKeyPath());
            if (config.getPrivateKeyPassphrase() != null) {
                uri.append("&privateKeyPassphrase=").append(config.getPrivateKeyPassphrase());
            }
        }

        return uri.toString();
    }

    private void removeInactiveRoutes(List<SftpConfig> activeConfigs) {
        Set<String> activeRouteIds = activeConfigs.stream()
            .map(this::buildRouteId)
            .collect(Collectors.toSet());

        camelContext.getRoutes().stream()
            .filter(route -> route.getId().startsWith("sftp-"))
            .filter(route -> !activeRouteIds.contains(route.getId()))
            .forEach(route -> {
                try {
                    camelContext.removeRoute(route.getId());
                    log.info("Removed inactive route: {}", route.getId());
                } catch (Exception e) {
                    log.error("Failed to remove route: " + route.getId(), e);
                }
            });
    }
} 