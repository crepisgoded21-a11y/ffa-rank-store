package net.effectsffa.rankshop.listeners;

import net.effectsffa.rankshop.ColorUtil;
import net.effectsffa.rankshop.RankShopPlugin;
import net.effectsffa.rankshop.gui.RankGuiHolder;
import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.InventoryDragEvent;

public class RankGuiListener implements Listener {

    private final RankShopPlugin plugin;

    public RankGuiListener(RankShopPlugin plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onClick(InventoryClickEvent event) {
        if (!(event.getInventory().getHolder() instanceof RankGuiHolder holder)) return;
        event.setCancelled(true);

        if (!(event.getWhoClicked() instanceof Player player)) return;
        String rankKey = holder.getRank(event.getRawSlot());
        if (rankKey == null) return;

        String storeUrl = plugin.getConfig().getString("gui.store-url", "");
        player.closeInventory();

        TextComponent message = new TextComponent(
                ColorUtil.colorize("&aClick here to purchase &f" + rankKey.toUpperCase() + "&a on our store!")
        );
        message.setClickEvent(new ClickEvent(ClickEvent.Action.OPEN_URL, storeUrl));
        player.spigot().sendMessage(message);
    }

    @EventHandler
    public void onDrag(InventoryDragEvent event) {
        if (event.getInventory().getHolder() instanceof RankGuiHolder) {
            event.setCancelled(true);
        }
    }
}
