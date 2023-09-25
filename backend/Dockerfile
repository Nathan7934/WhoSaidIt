FROM maven:3.8.6-eclipse-temurin-17 AS build
COPY src ./src
COPY pom.xml ./
RUN mvn -f ./pom.xml clean package -DskipTests

FROM amazoncorretto:17
COPY --from=build target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]