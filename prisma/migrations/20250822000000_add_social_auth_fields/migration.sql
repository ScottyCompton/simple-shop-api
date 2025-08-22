-- AlterTable
ALTER TABLE `users` ADD COLUMN `authProvider` VARCHAR(191) NULL,
                   ADD COLUMN `authProviderId` VARCHAR(191) NULL,
                   ADD COLUMN `avatar` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_authProviderId_key` ON `users`(`authProviderId`);
