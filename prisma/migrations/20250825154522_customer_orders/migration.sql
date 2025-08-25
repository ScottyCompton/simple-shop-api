-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
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
    `shippingTypeId` INTEGER NOT NULL,
    `orderSubTotal` DOUBLE NOT NULL,
    `orderTax` DOUBLE NOT NULL,
    `orderShippingCost` DOUBLE NOT NULL,
    `paymentReference` VARCHAR(191) NULL,

    INDEX `orders_userId_idx`(`userId`),
    INDEX `orders_shippingTypeId_idx`(`shippingTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderProducts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,

    INDEX `orderProducts_orderId_idx`(`orderId`),
    INDEX `orderProducts_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shippingTypeId_fkey` FOREIGN KEY (`shippingTypeId`) REFERENCES `ShippingType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderProducts` ADD CONSTRAINT `orderProducts_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderProducts` ADD CONSTRAINT `orderProducts_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
