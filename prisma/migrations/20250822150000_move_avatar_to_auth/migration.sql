-- Move avatar field from User to Auth table
-- First add the avatar field to the Auth table
ALTER TABLE `auth` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- Remove avatar field from User table
ALTER TABLE `users` DROP COLUMN `avatar`;
