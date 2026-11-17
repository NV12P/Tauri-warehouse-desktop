-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 16, 2026 at 01:54 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `materials_warehouse`
--

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_10_26_042517_add_username_role_is_active_to_users_table', 1),
(5, '2026_10_26_042518_create_categories_table', 1),
(6, '2026_10_26_042520_create_products_table', 1),
(7, '2026_10_26_042521_create_stock_opnames_table', 1),
(8, '2026_10_26_042522_create_stock_transactions_table', 1),
(9, '2026_10_26_042523_create_stock_transaction_items_table', 1),
(10, '2026_10_26_042524_create_stock_opname_items_table', 1),
(11, '2026_10_26_042525_create_product_price_histories_table', 1),
(12, '2026_10_26_042526_create_stock_movements_table', 1),
(13, '2026_10_26_050240_create_personal_access_tokens_table', 1),
(14, '2026_10_27_090059_alter_stock_opname_items_physical_stock_nullable', 2),
(15, '2026_11_09_041715_create_sales_table', 2),
(16, '2026_11_09_041716_create_sale_items_table', 2);

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'api-token', '820b74254273685168bb02012187dac58ba9287cde731ea0712d4b50f04427d8', '[\"*\"]', NULL, '2026-11-10 06:58:56', '2026-11-09 22:58:56', '2026-11-09 22:58:56'),
(2, 'App\\Models\\User', 1, 'api-token', '516706031da422bb33b169982af594e76c774dc3a1ccd05e34aeba856e67409d', '[\"*\"]', '2026-11-09 23:23:26', '2026-11-10 07:12:43', '2026-11-09 23:12:43', '2026-11-09 23:23:26'),
(3, 'App\\Models\\User', 1, 'api-token', '2aa5da21cc1144e5629d0d4d7b5dfdcb3212ffca58287d865394399e55abc20a', '[\"*\"]', '2026-11-09 23:24:56', '2026-11-10 07:24:26', '2026-11-09 23:24:26', '2026-11-09 23:24:56'),
(4, 'App\\Models\\User', 1, 'api-token', 'a5fc26ed81603e91b55cc4a7aea66d4e1e97f89118cea4c721775d883d9bfb27', '[\"*\"]', '2026-11-10 21:35:34', '2026-11-11 05:08:35', '2026-11-10 21:08:35', '2026-11-10 21:35:34');

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin Gudang', 'AdminGudang', 'Admingudang@gmail.com', NULL, '$2y$12$7IbWxailKi6aWkMKMTiZKuL.FiAIOwDhs/GgvS5dj7JDIvVJA8rxi', 'admin_gudang', 1, NULL, NULL, NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
