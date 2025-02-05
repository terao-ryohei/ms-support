ALTER TABLE `payment`
ADD `from` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `payment`
ADD `to` integer NOT NULL DEFAULT 0;
-- 既存のcontractテーブルからpaymentテーブルへデータを移行
UPDATE payment
SET "from" = (
        SELECT c."from"
        FROM contract c
            INNER JOIN workers_relation wr ON wr.contract_id = c.id
        WHERE wr.payment_id = payment.id
    ),
    "to" = (
        SELECT c."to"
        FROM contract c
            INNER JOIN workers_relation wr ON wr.contract_id = c.id
        WHERE wr.payment_id = payment.id
    )
WHERE EXISTS (
        SELECT 1
        FROM workers_relation wr
            INNER JOIN contract c ON c.id = wr.contract_id
        WHERE wr.payment_id = payment.id
    );