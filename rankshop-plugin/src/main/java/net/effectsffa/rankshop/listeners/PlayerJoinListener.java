package net.effectsffa.rankshop.listeners;

import net.effectsffa.rankshop.PendingPurchase;
import net.effectsffa.rankshop.PendingQueue;
import net.effectsffa.rankshop.PurchaseProcessor;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

import java.util.List;

public class PlayerJoinListener implements Listener {

    private final PendingQueue pendingQueue;
    private final PurchaseProcessor purchaseProcessor;

    public PlayerJoinListener(PendingQueue pendingQueue, PurchaseProcessor purchaseProcessor) {
        this.pendingQueue = pendingQueue;
        this.purchaseProcessor = purchaseProcessor;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onJoin(PlayerJoinEvent event) {
        List<PendingPurchase> queued = pendingQueue.takeForIgn(event.getPlayer().getName());
        for (PendingPurchase purchase : queued) {
            purchaseProcessor.process(purchase);
        }
    }
}
