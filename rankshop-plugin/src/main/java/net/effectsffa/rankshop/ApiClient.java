package net.effectsffa.rankshop;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.bukkit.configuration.file.FileConfiguration;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Talks to the backend's pending-purchases JSON API.
 *
 * Expected GET {@code pending-url} response body:
 * {@code [{"id":"abc123","ign":"Notch","rank":"vip"},
 *          {"id":"def456","ign":"Steve","rank":"custom","nickname":"ShadowWolf","color":"#55FF55"}]}
 *
 * Ack is a POST to {@code ack-url} with body {@code {"id":"abc123"}}.
 */
public class ApiClient {

    private final Gson gson = new Gson();
    private final Logger logger;

    private String pendingUrl;
    private String ackUrl;
    private String apiKey;
    private Duration timeout;
    private HttpClient httpClient;

    public ApiClient(FileConfiguration config, Logger logger) {
        this.logger = logger;
        reload(config);
    }

    public void reload(FileConfiguration config) {
        this.pendingUrl = config.getString("api.pending-url");
        this.ackUrl = config.getString("api.ack-url");
        this.apiKey = config.getString("api.api-key", "");
        this.timeout = Duration.ofSeconds(config.getInt("api.request-timeout-seconds", 10));
        this.httpClient = HttpClient.newBuilder().connectTimeout(timeout).build();
    }

    public List<PendingPurchase> fetchPendingPurchases() {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(pendingUrl))
                    .timeout(timeout)
                    .GET();
            applyAuth(builder);

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                logger.warning("RankShop API returned status " + response.statusCode() + " for " + pendingUrl);
                return List.of();
            }

            Type listType = new TypeToken<List<PendingPurchase>>() { }.getType();
            List<PendingPurchase> purchases = gson.fromJson(response.body(), listType);
            return purchases != null ? purchases : List.of();
        } catch (IOException | InterruptedException e) {
            logger.warning("RankShop failed to reach the pending-purchases API: " + e.getMessage());
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            return List.of();
        }
    }

    public void acknowledge(String purchaseId) {
        try {
            String body = gson.toJson(Map.of("id", purchaseId));
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(ackUrl))
                    .timeout(timeout)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body));
            applyAuth(builder);

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() >= 300) {
                logger.warning("RankShop failed to ack purchase " + purchaseId + " (status " + response.statusCode() + ")");
            }
        } catch (IOException | InterruptedException e) {
            logger.warning("RankShop failed to ack purchase " + purchaseId + ": " + e.getMessage());
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
        }
    }

    private void applyAuth(HttpRequest.Builder builder) {
        if (apiKey != null && !apiKey.isEmpty()) {
            builder.header("Authorization", "Bearer " + apiKey);
        }
    }
}
