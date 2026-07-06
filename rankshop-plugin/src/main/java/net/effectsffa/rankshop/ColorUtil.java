package net.effectsffa.rankshop;

import org.bukkit.ChatColor;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ColorUtil {

    private static final Pattern HEX_PATTERN = Pattern.compile("^#?([0-9A-Fa-f]{6})$");
    private static final Pattern INLINE_HEX_PATTERN = Pattern.compile("&#([0-9A-Fa-f]{6})");

    private ColorUtil() {
    }

    public static boolean isValidHex(String value) {
        return value != null && HEX_PATTERN.matcher(value).matches();
    }

    /**
     * Converts a "#RRGGBB" hex string into a Minecraft 1.16+ §x§R§R§G§G§B§B sequence.
     */
    public static String hexToSection(String hex) {
        Matcher matcher = HEX_PATTERN.matcher(hex);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Not a valid hex color: " + hex);
        }
        String digits = matcher.group(1).toUpperCase();
        StringBuilder out = new StringBuilder("§x");
        for (char c : digits.toCharArray()) {
            out.append('§').append(c);
        }
        return out.toString();
    }

    /**
     * Translates both "&#RRGGBB" inline hex codes and legacy "&" color codes into
     * their "§" equivalents, so config strings can use either style.
     */
    public static String colorize(String input) {
        if (input == null) return "";
        Matcher matcher = INLINE_HEX_PATTERN.matcher(input);
        StringBuilder buffer = new StringBuilder();
        while (matcher.find()) {
            matcher.appendReplacement(buffer, Matcher.quoteReplacement(hexToSection(matcher.group(1))));
        }
        matcher.appendTail(buffer);
        return ChatColor.translateAlternateColorCodes('&', buffer.toString());
    }
}
