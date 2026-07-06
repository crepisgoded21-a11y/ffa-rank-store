package net.effectsffa.rankshop;

import org.bukkit.configuration.file.FileConfiguration;

import java.util.List;
import java.util.regex.Pattern;

public class NicknameValidator {

    public static final class Result {
        private final boolean valid;
        private final String reason;

        private Result(boolean valid, String reason) {
            this.valid = valid;
            this.reason = reason;
        }

        public boolean isValid() { return valid; }
        public String getReason() { return reason; }

        static Result ok() { return new Result(true, null); }
        static Result fail(String reason) { return new Result(false, reason); }
    }

    private int minLength;
    private int maxLength;
    private Pattern allowedPattern;
    private List<String> blacklist;

    public NicknameValidator(FileConfiguration config) {
        reload(config);
    }

    public void reload(FileConfiguration config) {
        this.minLength = config.getInt("nickname.min-length", 3);
        this.maxLength = config.getInt("nickname.max-length", 16);
        this.allowedPattern = Pattern.compile(config.getString("nickname.allowed-pattern", "^[A-Za-z0-9_ ]+$"));
        this.blacklist = config.getStringList("nickname.blacklist");
    }

    public Result validate(String nickname) {
        if (nickname == null || nickname.isEmpty()) {
            return Result.fail("Nickname must not be empty.");
        }
        if (nickname.length() < minLength || nickname.length() > maxLength) {
            return Result.fail("Nickname must be " + minLength + "-" + maxLength + " characters.");
        }
        if (!allowedPattern.matcher(nickname).matches()) {
            return Result.fail("Nickname contains disallowed characters.");
        }
        String lower = nickname.toLowerCase();
        for (String word : blacklist) {
            if (word != null && !word.isEmpty() && lower.contains(word.toLowerCase())) {
                return Result.fail("Nickname contains a blocked word.");
            }
        }
        return Result.ok();
    }
}
