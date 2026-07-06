package net.effectsffa.rankshop.commands;

import net.effectsffa.rankshop.gui.RankGui;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

public class RankCommand implements CommandExecutor {

    private final RankGui gui;

    public RankCommand(RankGui gui) {
        this.gui = gui;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Only players can use this command.");
            return true;
        }
        gui.open(player);
        return true;
    }
}
