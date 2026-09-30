import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "admin123";
        String hash = encoder.encode(raw);
        System.out.println("New Hash for admin123: " + hash);
        System.out.println("Matches old: " + encoder.matches("admin123", "$2a$10$Rz4t.bB2T9tW4O7R4Z/E.Ouq1XpS6l9G8nZ1kP5Jj/gUaG6yK8kKO"));
    }
}
