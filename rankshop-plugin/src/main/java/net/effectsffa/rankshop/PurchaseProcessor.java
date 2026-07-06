package net.effectsffa.rankshop;

import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.Sound;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Player;

import java.util.List;

/**
 * Applies a single purchase. Must be called on the main server thread since it
 * touches the Bukkit API (dispatchCommand, player messaging, sounds).
 */
public class PurchaseProcessor {

    public enum Outcome { APPLIED, QUEUED, INVALID }

    private final RankShopPlugin plugin;
    private final PendingQueue pendingQueue;
    private final NicknameValidator nicknameValidator;

    public PurchaseProcessor(RankShopPlugin plugin, PendingQueue pendingQueue, NicknameValidator nicknameValidator) {
        this.plugin = plugin;
        this.pendingQueue = pendingQueue;
        this.nicknameValidator = nicknameValidator;
    }

    public Outcome process(PendingPurchase purchase) {
        String rankKey = purchase.getRank() == null ? "" : purchase.getRank().toLowerCase();
        if (!plugin.getConfig().isConfigurationSection("ranks." + rankKey)) {
            plugin.getLogger().warning("Unknown rank '" + purchase.getRank() + "' for " + purchase.getIgn() + ", skipping.");
            return Outcome.INVALID;
        }

        OfflinePlayer target = Bukkit.getOfflinePlayer(purchase.getIgn());
        if (!target.hasPlayedBefore() && !target.isOnline()) {
            pendingQueue.enqueue(purchase);
            plugin.getLogger().info("Queued purchase for " + purchase.getIgn() + " (never joined yet).");
            return Outcome.QUEUED;
        }

        applyRankCommands(rankKey, purchase.getIgn());

        boolean nicknameApplied = false;
        if (purchase.getNickname() != null && !purchase.getNickname().isEmpty()) {
            NicknameValidator.Result result = nicknameValidator.validate(purchase.getNickname());
            if (!result.isValid()) {
                plugin.getLogger().warning("Rejected nickname for " + purchase.getIgn() + ": " + result.getReason());
            } else if (purchase.getColor() == null || !ColorUtil.isValidHex(purchase.getColor())) {
                plugin.getLogger().warning("Rejected color for " + purchase.getIgn() + ": " + purchase.getColor());
            } else {
                applyNicknameCommand(rankKey, purchase.getIgn(), purchase.getNickname(), purchase.getColor());
                nicknameApplied = true;
            }
        }

        notifyIfOnline(target, rankKey, nicknameApplied);
        return Outcome.APPLIED;
    }

    /**
     * Used by /rankshop recolor and /rankshop rename to re-apply a nickname
     * outside the normal purchase flow. Returns false if no rank in config
     * defines a nickname-command.
     */
    public boolean applyNicknamePublic(String ign, String nickname, String hexColor) {
        String rankKey = findNicknameRank();
        if (rankKey == null) return false;
        applyNicknameCommand(rankKey, ign, nickname, hexColor);
        return true;
    }

    private String findNicknameRank() {
        ConfigurationSection ranksSection = plugin.getConfig().getConfigurationSection("ranks");
        if (ranksSection == null) return null;
        for (String key : ranksSection.getKeys(false)) {
            if (ranksSection.contains(key + ".nickname-command")) return key;
        }
        return null;
    }

    private void applyRankCommands(String rankKey, String ign) {
        List<String> commands = plugin.getConfig().getStringList("ranks." + rankKey + ".commands");
        for (String template : commands) {
            String cmd = template.replace("%player%", ign);
            Bukkit.dispatchCommand(Bukkit.getConsoleSender(), cmd);
        }
    }

    private void applyNicknameCommand(String rankKey, String ign, String nickname, String hexColor) {
        String template = plugin.getConfig().getString("ranks." + rankKey + ".nickname-command");
        if (template == null || template.isEmpty()) return;
        String cmd = template
                .replace("%player%", ign)
                .replace("%nickname%", nickname)
                .replace("%color%", ColorUtil.hexToSection(hexColor));
        Bukkit.dispatchCommand(Bukkit.getConsoleSender(), cmd);
    }

    private void notifyIfOnline(OfflinePlayer target, String rankKey, boolean nicknameApplied) {
        if (!target.isOnline()) return;
        Player player = target.getPlayer();
        if (player == null) return;

        String rankMsg = plugin.getConfig().getString("messages.rank-applied", "").replace("%rank%", rankKey.toUpperCase());
        player.sendMessage(ColorUtil.colorize(rankMsg));

        if (nicknameApplied) {
            String nickMsg = plugin.getConfig().getString("messages.nickname-applied", "");
            player.sendMessage(ColorUtil.colorize(nickMsg));
        }

        if (plugin.getConfig().getBoolean("sound.enabled", true)) {
            try {
                Sound sound = Sound.valueOf(plugin.getConfig().getString("sound.name", "ENTITY_PLAYER_LEVELUP"));
                float volume = (float) plugin.getConfig().getDouble("sound.volume", 1.0);
                float pitch = (float) plugin.getConfig().getDouble("sound.pitch", 1.0);
                player.playSound(player.getLocation(), sound, volume, pitch);
            } catch (IllegalArgumentException e) {
                plugin.getLogger().warning("Invalid sound name in config: " + plugin.getConfig().getString("sound.name"));
            }
        }
    }
}
