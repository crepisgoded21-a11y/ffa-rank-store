package net.effectsffa.rankshop.gui;

import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.InventoryHolder;
import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;

public class RankGuiHolder implements InventoryHolder {

    private final Map<Integer, String> slotToRank = new HashMap<>();
    private Inventory inventory;

    @Override
    public @NotNull Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }

    public void mapSlot(int slot, String rankKey) {
        slotToRank.put(slot, rankKey);
    }

    public String getRank(int slot) {
        return slotToRank.get(slot);
    }
}
