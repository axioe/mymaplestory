-- MyMaplestory 프로젝트 최초 DB 세팅 스크립트.
-- MySQL Workbench나 mysql 커맨드라인에서 이 파일을 그대로 실행하면 된다.
--
-- 테이블(boss_selections, skip_records 등)은 이 스크립트에서 안 만든다 -
-- application.yml의 spring.jpa.hibernate.ddl-auto: update 설정 덕분에,
-- 백엔드를 처음 실행할 때 Hibernate가 엔티티(BossSelectionEntity 등)를 보고
-- 알아서 테이블을 만들어준다. 여기서는 그 테이블들이 들어갈 "데이터베이스" 자체만
-- 미리 만들어두면 된다 (MySQL은 데이터베이스가 미리 존재해야 접속이 된다).

CREATE DATABASE IF NOT EXISTS mymaplestory
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 확인용 (선택) - 잘 만들어졌는지 보고 싶으면 아래 두 줄도 같이 실행해보면 된다.
-- SHOW DATABASES;
-- USE mymaplestory;
