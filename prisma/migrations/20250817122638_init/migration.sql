-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `inStock` BOOLEAN NOT NULL DEFAULT true,
    `shortDesc` TEXT NOT NULL,
    `imgUrl` TEXT NOT NULL,
    `mfgName` VARCHAR(191) NOT NULL,
    `longDesc` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `billingFirstName` VARCHAR(191) NOT NULL,
    `billingLastName` VARCHAR(191) NOT NULL,
    `billingAddress1` VARCHAR(191) NOT NULL,
    `billingAddress2` VARCHAR(191) NULL,
    `billingCity` VARCHAR(191) NOT NULL,
    `billingState` VARCHAR(191) NOT NULL,
    `billingZip` VARCHAR(191) NOT NULL,
    `billingPhone` VARCHAR(191) NOT NULL,
    `shippingFirstName` VARCHAR(191) NOT NULL,
    `shippingLastName` VARCHAR(191) NOT NULL,
    `shippingAddress1` VARCHAR(191) NOT NULL,
    `shippingAddress2` VARCHAR(191) NULL,
    `shippingCity` VARCHAR(191) NOT NULL,
    `shippingState` VARCHAR(191) NOT NULL,
    `shippingZip` VARCHAR(191) NOT NULL,
    `shippingPhone` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `states` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `abbr` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `states_abbr_key`(`abbr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
