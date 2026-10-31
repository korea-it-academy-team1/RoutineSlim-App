-- RoutineSlim 초기 스키마 (MySQL 8 / 로컬 H2 MODE=MySQL 공용)
-- 규칙
--   * 모든 PK 는 BIGINT AUTO_INCREMENT, PK 는 CREATE TABLE 안에서 선언 (Aiven: sql_require_primary_key)
--   * 참조당하는 테이블을 먼저 만든다 (FK 순서)
--   * enum 성격의 값은 VARCHAR 로 저장하고 허용 값은 COMMENT 에 적는다 (JPA @Enumerated(EnumType.STRING))
--   * created_at / updated_at 은 BaseTimeEntity 와 맞춰 NOT NULL

-- ───────────── 회원 ─────────────

CREATE TABLE `member` (
   `member_id`           BIGINT        NOT NULL AUTO_INCREMENT,
   `member_name`         VARCHAR(50)   NOT NULL COMMENT '로그인 아이디',
   `member_password`     VARCHAR(255)  NULL     COMMENT '소셜 로그인 회원은 NULL',
   `name`                VARCHAR(50)   NOT NULL,
   `email`               VARCHAR(255)  NULL,
   `phone`               VARCHAR(30)   NULL,
   `default_notify_days` TINYINT       NOT NULL DEFAULT 3,
   `notify_time`         TIME          NOT NULL DEFAULT '09:00:00',
   `monthly_budget`      INT           NULL     COMMENT '월 예산 (원)',
   `app_lock_enabled`    BOOLEAN       NOT NULL DEFAULT FALSE,
   `created_at`          DATETIME      NOT NULL,
   `updated_at`          DATETIME      NOT NULL,
   `deleted_at`          DATETIME      NULL,
   PRIMARY KEY (`member_id`),
   CONSTRAINT `UK_MEMBER_MEMBER_NAME` UNIQUE (`member_name`),
   CONSTRAINT `UK_MEMBER_EMAIL` UNIQUE (`email`)
);

CREATE TABLE `social_account` (
   `social_id`        BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`        BIGINT        NOT NULL,
   `provider`         VARCHAR(20)   NOT NULL COMMENT 'KAKAO, GOOGLE, APPLE',
   `provider_user_id` VARCHAR(255)  NOT NULL,
   PRIMARY KEY (`social_id`),
   CONSTRAINT `UK_SOCIAL_ACCOUNT_PROVIDER_USER` UNIQUE (`provider`, `provider_user_id`),
   CONSTRAINT `FK_SOCIAL_ACCOUNT_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

CREATE TABLE `refresh_token` (
   `token_id`   BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`  BIGINT        NOT NULL,
   `token_hash` VARCHAR(255)  NOT NULL,
   `expires_at` DATETIME      NOT NULL,
   `created_at` DATETIME      NOT NULL,
   `revoked_at` DATETIME      NULL,
   PRIMARY KEY (`token_id`),
   CONSTRAINT `UK_REFRESH_TOKEN_HASH` UNIQUE (`token_hash`),
   CONSTRAINT `FK_REFRESH_TOKEN_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

CREATE TABLE `device` (
   `device_id`            BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`            BIGINT        NOT NULL,
   `fcm_token`            VARCHAR(512)  NOT NULL,
   `notification_enabled` BOOLEAN       NOT NULL DEFAULT TRUE,
   PRIMARY KEY (`device_id`),
   CONSTRAINT `UK_DEVICE_FCM_TOKEN` UNIQUE (`fcm_token`),
   CONSTRAINT `FK_DEVICE_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

-- ───────────── 서비스 목록 (catalog) ─────────────

CREATE TABLE `subscription_category` (
   `sub_ctg_id`    BIGINT       NOT NULL AUTO_INCREMENT,
   `category_name` VARCHAR(50)  NOT NULL,
   PRIMARY KEY (`sub_ctg_id`),
   CONSTRAINT `UK_SUBSCRIPTION_CATEGORY_NAME` UNIQUE (`category_name`)
);

CREATE TABLE `service_preset` (
   `preset_id`    BIGINT        NOT NULL AUTO_INCREMENT,
   `sub_ctg_id`   BIGINT        NOT NULL,
   `service_name` VARCHAR(100)  NOT NULL,
   `logo_url`     VARCHAR(500)  NULL,
   PRIMARY KEY (`preset_id`),
   CONSTRAINT `UK_SERVICE_PRESET_NAME` UNIQUE (`service_name`),
   CONSTRAINT `FK_SERVICE_PRESET_CATEGORY` FOREIGN KEY (`sub_ctg_id`) REFERENCES `subscription_category` (`sub_ctg_id`)
);

-- ───────────── 결제 수단 ─────────────

CREATE TABLE `card` (
   `card_id`     BIGINT       NOT NULL AUTO_INCREMENT,
   `member_id`   BIGINT       NOT NULL,
   `card_name`   VARCHAR(50)  NULL     COMMENT '예: 현대카드',
   `card_last4`  CHAR(4)      NULL     COMMENT '카드 번호 끝 4자리',
   `payment_day` TINYINT      NOT NULL COMMENT '카드 대금 결제일 (매월 1~31)',
   PRIMARY KEY (`card_id`),
   CONSTRAINT `FK_CARD_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

-- ───────────── 내 구독 ─────────────

CREATE TABLE `subscription` (
   `sub_id`             BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`          BIGINT        NOT NULL,
   `sub_ctg_id`         BIGINT        NOT NULL,
   `card_id`            BIGINT        NULL     COMMENT '결제 수단 (미지정 가능)',
   `name`               VARCHAR(100)  NOT NULL,
   `plan`               VARCHAR(50)   NULL     COMMENT '요금제 이름 (예: 프리미엄)',
   `amount`             INT           NOT NULL,
   `currency`           CHAR(3)       NOT NULL DEFAULT 'KRW',
   `billing_cycle`      VARCHAR(10)   NOT NULL COMMENT 'MONTHLY, YEARLY',
   `cycle_interval`     SMALLINT      NOT NULL DEFAULT 1,
   `start_date`         DATE          NOT NULL,
   `billing_day`        TINYINT       NOT NULL COMMENT '매월 1~31',
   `next_billing_date`  DATE          NOT NULL,
   `status`             VARCHAR(10)   NOT NULL COMMENT 'ACTIVE, PAUSED, CANCELED',
   `trial_end_date`     DATE          NULL,
   `notify_enabled`     BOOLEAN       NOT NULL DEFAULT TRUE,
   `notify_days_before` TINYINT       NULL     COMMENT 'NULL 이면 member.default_notify_days',
   `memo`               TEXT          NULL,
   `canceled_at`        DATETIME      NULL,
   `created_at`         DATETIME      NOT NULL,
   `updated_at`         DATETIME      NOT NULL,
   `deleted_at`         DATETIME      NULL,
   PRIMARY KEY (`sub_id`),
   CONSTRAINT `FK_SUBSCRIPTION_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
   CONSTRAINT `FK_SUBSCRIPTION_CATEGORY` FOREIGN KEY (`sub_ctg_id`) REFERENCES `subscription_category` (`sub_ctg_id`),
   CONSTRAINT `FK_SUBSCRIPTION_CARD` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`)
);

CREATE TABLE `recommendation` (
   `rec_id`        BIGINT        NOT NULL AUTO_INCREMENT,
   `sub_id`        BIGINT        NOT NULL,
   `member_id`     BIGINT        NOT NULL,
   `title`         VARCHAR(255)  NOT NULL,
   `rule_code`     VARCHAR(50)   NOT NULL,
   `saving_amount` INT           NOT NULL COMMENT '예상 절약액 (원)',
   `status`        VARCHAR(20)   NOT NULL COMMENT 'PENDING, ACCEPTED, DISMISSED',
   `created_at`    DATETIME      NOT NULL,
   PRIMARY KEY (`rec_id`),
   CONSTRAINT `FK_RECOMMENDATION_SUBSCRIPTION` FOREIGN KEY (`sub_id`) REFERENCES `subscription` (`sub_id`),
   CONSTRAINT `FK_RECOMMENDATION_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

-- ───────────── 지출 / 일정 ─────────────

CREATE TABLE `expense_method` (
   `expense_method_id` BIGINT       NOT NULL AUTO_INCREMENT,
   `method_name`       VARCHAR(30)  NOT NULL,
   PRIMARY KEY (`expense_method_id`),
   CONSTRAINT `UK_EXPENSE_METHOD_NAME` UNIQUE (`method_name`)
);

CREATE TABLE `categories` (
   `categories_id` BIGINT       NOT NULL AUTO_INCREMENT,
   `member_id`     BIGINT       NOT NULL,
   `name`          VARCHAR(50)  NOT NULL,
   `color`         CHAR(7)      NULL     COMMENT '#RRGGBB',
   `icon`          VARCHAR(50)  NULL,
   `sort_order`    SMALLINT     NOT NULL DEFAULT 0,
   PRIMARY KEY (`categories_id`),
   CONSTRAINT `FK_CATEGORIES_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

CREATE TABLE `expense` (
   `expense_id`        BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`         BIGINT        NOT NULL,
   `expense_method_id` BIGINT        NOT NULL,
   `card_id`           BIGINT        NULL,
   `categories_id`     BIGINT        NOT NULL,
   `amount`            INT           NOT NULL,
   `description`       VARCHAR(250)  NULL,
   `expense_date`      DATE          NOT NULL,
   PRIMARY KEY (`expense_id`),
   CONSTRAINT `FK_EXPENSE_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
   CONSTRAINT `FK_EXPENSE_METHOD` FOREIGN KEY (`expense_method_id`) REFERENCES `expense_method` (`expense_method_id`),
   CONSTRAINT `FK_EXPENSE_CARD` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`),
   CONSTRAINT `FK_EXPENSE_CATEGORIES` FOREIGN KEY (`categories_id`) REFERENCES `categories` (`categories_id`)
);

CREATE TABLE `schedule` (
   `schedule_id`    BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`      BIGINT        NOT NULL,
   `title`          VARCHAR(100)  NOT NULL,
   `amount`         INT           NOT NULL,
   `category`       VARCHAR(30)   NOT NULL,
   `payment_date`   DATETIME      NOT NULL,
   `description`    TEXT          NULL,
   `repeat_type`    VARCHAR(20)   NOT NULL DEFAULT 'NONE'    COMMENT 'NONE, MONTHLY, YEARLY',
   `payment_status` VARCHAR(20)   NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, COMPLETED, CANCELED',
   `end_date`       DATE          NULL,
   `created_at`     DATETIME      NOT NULL,
   `updated_at`     DATETIME      NOT NULL,
   PRIMARY KEY (`schedule_id`),
   CONSTRAINT `FK_SCHEDULE_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);

-- ───────────── 커뮤니티 ─────────────

CREATE TABLE `post` (
   `post_id`          BIGINT        NOT NULL AUTO_INCREMENT,
   `member_id`        BIGINT        NOT NULL,
   `board`            VARCHAR(10)   NOT NULL COMMENT 'PARTY, REVIEW, FREE',
   `title`            VARCHAR(200)  NOT NULL,
   `content`          TEXT          NOT NULL,
   `view_count`       INT           NOT NULL DEFAULT 0,
   -- 아래는 PARTY(파티 모집) 글에서만 사용
   `preset_id`        BIGINT        NULL     COMMENT '함께할 구독 서비스',
   `party_status`     VARCHAR(10)   NULL     COMMENT 'RECRUITING, CLOSED',
   `current_members`  TINYINT       NULL,
   `max_members`      TINYINT       NULL,
   `total_price`      INT           NULL     COMMENT '서비스 전체 월 요금',
   `price_per_member` INT           NULL     COMMENT '1인당 월 분담금',
   `settlement_day`   TINYINT       NULL     COMMENT '매월 정산일 (1~31)',
   `created_at`       DATETIME      NOT NULL,
   `updated_at`       DATETIME      NOT NULL,
   PRIMARY KEY (`post_id`),
   CONSTRAINT `FK_POST_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`),
   CONSTRAINT `FK_POST_SERVICE_PRESET` FOREIGN KEY (`preset_id`) REFERENCES `service_preset` (`preset_id`)
);

CREATE TABLE `comment` (
   `comment_id` BIGINT    NOT NULL AUTO_INCREMENT,
   `post_id`    BIGINT    NOT NULL,
   `member_id`  BIGINT    NOT NULL,
   `content`    TEXT      NOT NULL,
   `created_at` DATETIME  NOT NULL,
   `updated_at` DATETIME  NOT NULL,
   PRIMARY KEY (`comment_id`),
   CONSTRAINT `FK_COMMENT_POST` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
   CONSTRAINT `FK_COMMENT_MEMBER` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`)
);
