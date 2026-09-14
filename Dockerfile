# Estágio de Build (Compilação)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
# Baixa as dependências do Maven (otimiza o cache do Docker)
RUN mvn dependency:go-offline

COPY src ./src
# Compila o projeto ignorando os testes
RUN mvn clean package -DskipTests

# Estágio de Execução (Produção)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia apenas o arquivo .jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta que o Render vai usar
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]