/*
  Warnings:

  - You are about to drop the column `user_id` on the `project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_id]` on the table `chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner_id` to the `chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `project_user_id_fkey`;

-- DropIndex
DROP INDEX `project_user_id_idx` ON `project`;

-- AlterTable
ALTER TABLE `chat` ADD COLUMN `owner_id` INTEGER NOT NULL,
    ADD COLUMN `public_id` VARCHAR(32) NOT NULL;

-- AlterTable
ALTER TABLE `message` ADD COLUMN `sequence` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `user_id`,
    ADD COLUMN `owner_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `chat_public_id_key` ON `chat`(`public_id`);

-- CreateIndex
CREATE INDEX `chat_owner_id_idx` ON `chat`(`owner_id`);

-- CreateIndex
CREATE INDEX `chat_public_id_idx` ON `chat`(`public_id`);

-- CreateIndex
CREATE INDEX `message_chat_id_sequence_idx` ON `message`(`chat_id`, `sequence`);

-- CreateIndex
CREATE INDEX `project_owner_id_idx` ON `project`(`owner_id`);

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat` ADD CONSTRAINT `chat_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
