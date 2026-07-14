Maven Wrapper 파일(mvnw, mvnw.cmd, .mvn/wrapper/maven-wrapper.properties)은
네트워크 제약으로 이 스캐폴딩에는 포함하지 못했습니다.

로컬에서 아래 명령으로 생성하세요 (Maven이 설치되어 있다면):
  mvn -N io.takari:maven:wrapper -Dmaven=3.9.6

또는 mvnw 없이 시스템에 설치된 mvn을 바로 사용해도 됩니다:
  mvn spring-boot:run
