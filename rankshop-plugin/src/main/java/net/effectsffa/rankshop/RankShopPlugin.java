package net.effectsffa.rankshop;

import net.effectsffa.rankshop.commands.RankShopCommand;
import net.effectsffa.rankshop.listeners.PlayerJoinListener;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import java.util.List;

public class RankShopPlugin extends JavaPlugin {

    private ApiClient apiClient;
    private NicknameValidator nicknameValidator;
    private PendingQueue pendingQueue;
    private PurchaseProcessor purchaseProcessor;
    private BukkitTask pollTask;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        apiClient = new ApiClient(getConfig(), getLogger());
        nicknameValidator = new NicknameValidator(getConfig());
        pendingQueue = new PendingQueue(getDataFolder(), getLogger());
        purchaseProcessor = new PurchaseProcessor(this, pendingQueue, nicknameValidator);

        RankShopCommand commandHandler = new RankShopCommand(this);
        getCommand("rankshop").setExecutor(commandHandler);
        getCommand("rankshop").setTabCompleter(commandHandler);

        Bukkit.getPluginManager().registerEvents(new PlayerJoinListener(pendingQueue, purchaseProcessor), this);

        startPolling();
        getLogger().info("RankShop enabled.");
    }

    @Override
    public void onDisable() {
        if (pollTask != null) pollTask.cancel();
        getLogger().info("RankShop disabled.");
    }

    public void reloadPlugin() {
        if (pollTask != null) pollTask.cancel();
        reloadConfig();
        apiClient.reload(getConfig());
        nicknameValidator.reload(getConfig());
        startPolling();
    }

    private void startPolling() {
        long intervalTicks = getConfig().getInt("api.poll-interval-seconds", 30) * 20L;
        pollTask = Bukkit.getScheduler().runTaskTimerAsynchronously(this, this::pollOnce, intervalTicks, intervalTicks);
    }

    private void pollOnce() {
        List<PendingPurchase> purchases = apiClient.fetchPendingPurchases();
        if (purchases.isEmpty()) return;

        for (PendingPurchase purchase : purchases) {
            Bukkit.getScheduler().runTask(this, () -> purchaseProcessor.process(purchase));
            apiClient.acknowledge(purchase.getId());
        }
    }

    public ApiClient getApiClient() { return apiClient; }
    public NicknameValidator getNicknameValidator() { return nicknameValidator; }
    public PendingQueue getPendingQueue() { return pendingQueue; }
    public PurchaseProcessor getPurchaseProcessor() { return purchaseProcessor; }
}
