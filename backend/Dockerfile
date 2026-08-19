# 1단계: Maven 빌드 (mvnw 래퍼가 없어서 이미지에 내장된 mvn을 바로 사용)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# 2단계: JRE만 있는 가벼운 이미지로 실행 (빌드 도구는 최종 이미지에 안 남김)
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
