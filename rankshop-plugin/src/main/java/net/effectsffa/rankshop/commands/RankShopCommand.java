package net.effectsffa.rankshop.commands;

import net.effectsffa.rankshop.ColorUtil;
import net.effectsffa.rankshop.NicknameValidator;
import net.effectsffa.rankshop.PurchaseProcessor;
import net.effectsffa.rankshop.RankShopPlugin;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.List;

public class RankShopCommand implements CommandExecutor, TabCompleter {

    private final RankShopPlugin plugin;

    public RankShopCommand(RankShopPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, String[] args) {
        if (!sender.hasPermission("rankshop.admin")) {
            sender.sendMessage(ChatColor.RED + "You do not have permission to do that.");
            return true;
        }

        if (args.length == 0) {
            sender.sendMessage(ChatColor.YELLOW + "Usage: /" + label + " <reload|recolor|rename>");
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload" -> handleReload(sender);
            case "recolor" -> handleRecolor(sender, args);
            case "rename" -> handleRename(sender, args);
            default -> sender.sendMessage(ChatColor.YELLOW + "Usage: /" + label + " <reload|recolor|rename>");
        }
        return true;
    }

    private void handleReload(CommandSender sender) {
        plugin.reloadPlugin();
        sender.sendMessage(ChatColor.GREEN + "[RankShop] Configuration reloaded.");
    }

    private void handleRecolor(CommandSender sender, String[] args) {
        if (args.length < 3) {
            sender.sendMessage(ChatColor.YELLOW + "Usage: /rankshop recolor <player> <hex> [nickname]");
            return;
        }
        String ign = args[1];
        String hex = args[2];
        String nickname = args.length >= 4 ? args[3] : ChatColor.stripColor(ign);

        if (!ColorUtil.isValidHex(hex)) {
            sender.sendMessage(ChatColor.RED + "Invalid hex color. Use the format #RRGGBB.");
            return;
        }

        boolean applied = plugin.getPurchaseProcessor().applyNicknamePublic(ign, nickname, hex);
        if (applied) {
            sender.sendMessage(ChatColor.GREEN + "[RankShop] Recolored " + ign + "'s name.");
        } else {
            sender.sendMessage(ChatColor.RED + "No rank in config.yml defines a nickname-command.");
        }
    }

    private void handleRename(CommandSender sender, String[] args) {
        if (args.length < 3) {
            sender.sendMessage(ChatColor.YELLOW + "Usage: /rankshop rename <player> <nickname> [hex]");
            return;
        }
        String ign = args[1];
        String nickname = args[2];
        String hex = args.length >= 4 ? args[3] : "#FFFFFF";

        NicknameValidator.Result result = plugin.getNicknameValidator().validate(nickname);
        if (!result.isValid()) {
            sender.sendMessage(ChatColor.RED + "Invalid nickname: " + result.getReason());
            return;
        }
        if (!ColorUtil.isValidHex(hex)) {
            sender.sendMessage(ChatColor.RED + "Invalid hex color. Use the format #RRGGBB.");
            return;
        }

        boolean applied = plugin.getPurchaseProcessor().applyNicknamePublic(ign, nickname, hex);
        if (applied) {
            sender.sendMessage(ChatColor.GREEN + "[RankShop] Renamed " + ign + " to " + nickname + ".");
        } else {
            sender.sendMessage(ChatColor.RED + "No rank in config.yml defines a nickname-command.");
        }
    }

    @Override
    public @Nullable List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, String[] args) {
        if (args.length == 1) {
            return List.of("reload", "recolor", "rename");
        }
        return List.of();
    }
}
