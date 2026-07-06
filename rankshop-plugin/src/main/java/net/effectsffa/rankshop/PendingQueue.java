package net.effectsffa.rankshop;

import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

/**
 * Holds purchases for players who have never joined the server yet, so they
 * can be applied the first time that player joins. Persisted to disk so the
 * queue survives a plugin/server restart.
 */
public class PendingQueue {

    private final File file;
    private final Logger logger;
    private final List<PendingPurchase> queued = new ArrayList<>();

    public PendingQueue(File dataFolder, Logger logger) {
        this.file = new File(dataFolder, "queued-purchases.yml");
        this.logger = logger;
        load();
    }

    public synchronized void enqueue(PendingPurchase purchase) {
        queued.add(purchase);
        save();
    }

    /**
     * Removes and returns all purchases queued for the given (case-insensitive) IGN.
     */
    public synchronized List<PendingPurchase> takeForIgn(String ign) {
        List<PendingPurchase> result = new ArrayList<>();
        Iterator<PendingPurchase> it = queued.iterator();
        while (it.hasNext()) {
            PendingPurchase purchase = it.next();
            if (purchase.getIgn().equalsIgnoreCase(ign)) {
                result.add(purchase);
                it.remove();
            }
        }
        if (!result.isEmpty()) save();
        return result;
    }

    private synchronized void load() {
        if (!file.exists()) return;
        YamlConfiguration yaml = YamlConfiguration.loadConfiguration(file);
        List<?> rawList = yaml.getList("queue", new ArrayList<>());
        for (Object raw : rawList) {
            if (!(raw instanceof java.util.Map<?, ?> map)) continue;
            PendingPurchase purchase = new PendingPurchase();
            purchase.setId(String.valueOf(map.get("id")));
            purchase.setIgn(String.valueOf(map.get("ign")));
            purchase.setRank(String.valueOf(map.get("rank")));
            Object nickname = map.get("nickname");
            Object color = map.get("color");
            if (nickname != null) purchase.setNickname(String.valueOf(nickname));
            if (color != null) purchase.setColor(String.valueOf(color));
            queued.add(purchase);
        }
    }

    private synchronized void save() {
        YamlConfiguration yaml = new YamlConfiguration();
        List<java.util.Map<String, String>> serialized = new ArrayList<>();
        for (PendingPurchase purchase : queued) {
            java.util.Map<String, String> map = new java.util.LinkedHashMap<>();
            map.put("id", purchase.getId());
            map.put("ign", purchase.getIgn());
            map.put("rank", purchase.getRank());
            if (purchase.getNickname() != null) map.put("nickname", purchase.getNickname());
            if (purchase.getColor() != null) map.put("color", purchase.getColor());
            serialized.add(map);
        }
        yaml.set("queue", serialized);
        try {
            yaml.save(file);
        } catch (IOException e) {
            logger.warning("RankShop failed to save queued-purchases.yml: " + e.getMessage());
        }
    }
}
