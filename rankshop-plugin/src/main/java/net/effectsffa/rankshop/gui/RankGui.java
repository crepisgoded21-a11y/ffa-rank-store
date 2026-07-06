package net.effectsffa.rankshop.gui;

import net.effectsffa.rankshop.ColorUtil;
import net.effectsffa.rankshop.RankShopPlugin;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Player;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import java.util.List;
import java.util.stream.Collectors;

public class RankGui {

    private final RankShopPlugin plugin;

    public RankGui(RankShopPlugin plugin) {
        this.plugin = plugin;
    }

    public void open(Player player) {
        ConfigurationSection guiConfig = plugin.getConfig().getConfigurationSection("gui");
        if (guiConfig == null) {
            player.sendMessage(ColorUtil.colorize("&cThe rank store GUI isn't configured."));
            return;
        }

        String title = ColorUtil.colorize(guiConfig.getString("title", "&8Rank Store"));
        int size = guiConfig.getInt("size", 27);

        RankGuiHolder holder = new RankGuiHolder();
        Inventory inventory = Bukkit.createInventory(holder, size, title);
        holder.setInventory(inventory);

        ConfigurationSection ranksSection = guiConfig.getConfigurationSection("ranks");
        if (ranksSection != null) {
            for (String rankKey : ranksSection.getKeys(false)) {
                ConfigurationSection rankSection = ranksSection.getConfigurationSection(rankKey);
                if (rankSection == null) continue;
                buildItem(inventory, holder, rankKey, rankSection);
            }
        }

        player.openInventory(inventory);
    }

    private void buildItem(Inventory inventory, RankGuiHolder holder, String rankKey, ConfigurationSection rankSection) {
        int slot = rankSection.getInt("slot", 0);
        Material material = Material.matchMaterial(rankSection.getString("material", "STONE"));
        if (material == null) material = Material.STONE;

        ItemStack item = new ItemStack(material);
        ItemMeta meta = item.getItemMeta();
        if (meta != null) {
            meta.setDisplayName(ColorUtil.colorize(rankSection.getString("display-name", rankKey)));
            List<String> lore = rankSection.getStringList("lore").stream()
                    .map(ColorUtil::colorize)
                    .collect(Collectors.toList());
            meta.setLore(lore);
            item.setItemMeta(meta);
        }

        inventory.setItem(slot, item);
        holder.mapSlot(slot, rankKey);
    }
}
