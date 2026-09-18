import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        // Tenta carregar o .env local (desenvolvimento), mas ignora se não existir (produção/Render)
        try {
            Dotenv dotenv = Dotenv.load();
            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        } catch (Exception e) {
            System.out.println("Arquivo .env não encontrado. Usando variáveis de ambiente do sistema/Render.");
        }

        SpringApplication.run(DemoApplication.class, args);
    }
}