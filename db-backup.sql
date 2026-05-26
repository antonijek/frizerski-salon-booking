-- MariaDB dump 10.19  Distrib 10.4.24-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: frizerski_salon
-- ------------------------------------------------------
-- Server version	10.4.24-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `service` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barber_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_appointment` (`date`,`time`,`barber_id`),
  KEY `barber_id` (`barber_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (9,'Ivan','065222222','ivan@ivan.com','2026-05-25','12:00:00','Pramenovi',2,'2026-05-23 09:23:44'),(12,'Stoja','062111333','stoja@yahoo.com','2026-05-25','13:30:00','Farbanje',4,'2026-05-23 10:29:02'),(13,'Peka','060000000','peka@peka.com','2026-05-25','17:30:00','Musko sisanje',1,'2026-05-23 10:41:10'),(14,'Knezevic','067551381','aantonijek@yahoo.com','2026-05-25','19:30:00','Musko sisanje',2,'2026-05-23 10:42:13'),(16,'nije Knez','067551388','alntonijek@yahoo.com','2026-05-28','20:30:00','Šišanje',1,'2026-05-23 11:18:55'),(17,'zevic','027551384','antoniljek@yahoo.com','2026-05-26','13:00:00','Peglanje kose',2,'2026-05-23 12:34:25'),(20,'evic','068551384','antkonijek@yahoo.com','2026-05-27','12:30:00','Musko sisanje',2,'2026-05-23 13:25:21'),(21,'Antonje Knezevic','067558384','antmonijek@yahoo.com','2026-05-27','12:00:00','Šišanje',2,'2026-05-24 12:13:18'),(28,'Test Ponedeljak','062222222',NULL,'2026-05-25','10:00:00','Sisanje',2,'2026-05-24 13:06:30'),(30,'Test Bez Email','062222222',NULL,'2026-05-25','11:00:00','Feniranje',2,'2026-05-24 13:28:45'),(31,'Test Duplikat','063333333','','2026-05-25','10:30:00','Šišanje',4,'2026-05-24 13:28:45'),(38,'Test Bez Email','062222222','','2026-05-25','15:30:00','Feniranje',2,'2026-05-24 13:30:57'),(50,'Test Sa Frizerom','065555555',NULL,'2026-05-25','12:00:00','Šišanje',4,'2026-05-24 14:38:51'),(60,'Test Sva Polja','069999994','sva.polja@test.com','2026-05-26','18:00:00','Balayage',1,'2026-05-24 14:38:52'),(68,'Ae Knezevic','06651384','antofnijek@yahoo.com','2026-05-26','11:00:00','Pramenovi',4,'2026-05-24 20:50:19'),(70,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-05-26','14:30:00','Šišanje i feniranje',1,'2026-05-24 21:27:01'),(73,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-05-26','20:00:00','Feniranje',1,'2026-05-24 22:48:11'),(74,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-06-23','08:00:00','Balayage',2,'2026-05-24 23:15:04'),(75,'Ana Jovanovic','0269289888','ana.jovanovic@coe.int','2026-05-28','10:00:00','Šišanje i feniranje',2,'2026-05-25 10:39:04'),(76,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-06-03','16:30:00','Balayage',1,'2026-05-25 12:52:14'),(77,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-06-24','12:00:00','Balayage',2,'2026-05-25 13:07:44'),(79,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-08-08','16:30:00','Musko sisanje',1,'2026-05-25 14:03:57'),(81,'Test Bez Email','062222222',NULL,'2026-05-25','11:00:00','Feniranje',3,'2026-05-25 14:41:48'),(82,'Test Duplikat','063333333',NULL,'2026-05-25','10:00:00','Šišanje',4,'2026-05-25 14:41:48'),(85,'Test Bez Email','062222222',NULL,'2026-05-25','11:00:00','Feniranje',4,'2026-05-25 14:42:58'),(91,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-05-26','15:30:00','Šišanje',1,'2026-05-26 12:14:18'),(92,'Antonije Knezevic','067551384','antonijek@yahoo.com','2026-05-26','17:30:00','Peglanje kose',1,'2026-05-26 12:15:34'),(93,'Anton','067551384','antonijek@yahoo.com','2026-05-26','17:30:00','Šišanje',4,'2026-05-26 12:25:11'),(97,'TestAllBusy','0999999997','test@test.com','2026-05-26','14:00:00','Balayage',2,'2026-05-26 13:39:24'),(98,'nije ','067551384','antonijek@yahoo.com','2026-05-26','17:00:00','Šišanje',1,'2026-05-26 13:58:09'),(99,'Test','061234567',NULL,'2026-05-27','10:00:00','Sisanje',2,'2026-05-26 14:02:37');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barbers`
--

DROP TABLE IF EXISTS `barbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `barbers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `work_days` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '1,2,3,4,5,6' COMMENT 'Dani u nedelji kada frizer radi (0=ned, 1=pon...)',
  `work_start` time DEFAULT '09:00:00',
  `work_end` time DEFAULT '17:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barbers`
--

LOCK TABLES `barbers` WRITE;
/*!40000 ALTER TABLE `barbers` DISABLE KEYS */;
INSERT INTO `barbers` VALUES (1,'Marko Peric','https://scontent-cdg4-2.xx.fbcdn.net/v/t39.30808-6/515509901_10233470619980973_3345442632780592906_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9eae26&_nc_ohc=u2Enq3_i3ksQ7kNvwFJS5D_&_nc_oc=AdqZr5WIf-B1CGrlErF50Xbq3NaboDuDBBLx0VE-4e98sMNiM1m64WWG2SS3svTINj0&_nc_zt=23&_nc_ht=scontent-cdg4-2.xx&_nc_gid=C1BxmK1UBHCqTtX_iNYVGA&_nc_ss=7b2a8&oh=00_Af41--ksmO8VXFvDFBzgzSyN-zyQrASft-I28IPweS-SCw&oe=6A190FB7','Majstor','Sa velikim iskustvom u inostranstvu, sad sisa i nas.',1,'2026-05-23 09:05:25','1,2,3,4,5,6','14:00:00','21:00:00'),(2,'Jovana Maric','https://scontent-fra3-2.xx.fbcdn.net/v/t39.30808-6/468305922_10160194540961290_7165060660573063890_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=VHayw7DPZosQ7kNvwEKPe3u&_nc_oc=AdqszmzgkrrxabIPK6_EvDYoaahPivCKo2bkrIjYFLQMbaXfgk9UMigXaaAbo8MKQuQ&_nc_zt=23&_nc_ht=scontent-fra3-2.xx&_nc_gid=P4rYwX1PFTdT3shQHi0pWQ&_nc_ss=7b2a8&oh=00_Af6rq-s1szea6w-czYGllbpdKck64HmnmzaaQLAAwgiihQ&oe=6A192566','Frizerka','Legenda u ovom poslu.',1,'2026-05-23 09:05:25','1,2,3,5,6,4','08:00:00','16:00:00'),(3,'Ana',NULL,NULL,NULL,0,'2026-05-23 09:05:25','1,2,3,4,5,6','09:00:00','17:00:00'),(4,'Cakana Kekic','https://scontent-fra5-2.xx.fbcdn.net/v/t39.30808-6/463892762_10230178210512794_5640272246422518099_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=gh5lp-qL_mEQ7kNvwE10Xx6&_nc_oc=AdoDBUtyZf6zS2Lcv8LUDYUNQ_Mpth1y2taR3eAvJrdmVobTF9xFYPGix_qcBSxL6VI&_nc_zt=23&_nc_ht=scontent-fra5-2.xx&_nc_gid=KyGqtiO66emEoo3-Ze7ABw&_nc_ss=7b2a8&oh=00_Af52-giuve44duIqyXZ7epdlNO8neYN8RC9wCmPfy1uOMQ&oe=6A192BBC','Frizer','Preko 10 godina iskustva i hiljade zadovoljnih korisnika...',1,'2026-05-23 13:19:42','1,2,5,3,4','10:00:00','18:00:00');
/*!40000 ALTER TABLE `barbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery_images`
--

DROP TABLE IF EXISTS `gallery_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gallery_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `src` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery_images`
--

LOCK TABLES `gallery_images` WRITE;
/*!40000 ALTER TABLE `gallery_images` DISABLE KEYS */;
INSERT INTO `gallery_images` VALUES (1,'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop','Frizura 1',1,'2026-05-24 16:20:13'),(2,'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop','Frizura 2',2,'2026-05-24 16:20:13'),(3,'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop','Frizura 3',3,'2026-05-24 16:20:13'),(4,'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop','Frizura 4',4,'2026-05-24 16:20:13'),(5,'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop','Frizura 5',5,'2026-05-24 16:20:13'),(12,'/uploads/gallery-1779643157245-250738601.jpg','ja',6,'2026-05-24 17:19:17'),(13,'https://scontent-fra5-1.xx.fbcdn.net/v/t39.30808-6/589898660_10163332739728672_532817799140286078_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=pwUV6uxhA1UQ7kNvwF58yD8&_nc_oc=AdpA84ZZ0YENvkhb3gLVrOtRmAeiE76ebhxeI6TdIVlTBxp4gl1aWG2QUNJAYaoJQ_8&_nc_zt=23&_nc_ht=scontent-fra5-1.xx&_nc_gid=6Rq57OdVVo72eAdPB6ki5Q&_nc_ss=7b2a8&oh=00_Af43OXy_Z69goGCBzSS4M3T1u4aRbvGlLp-gNdCe8I4diQ&oe=6A190CB7','Andrijana',7,'2026-05-24 18:31:55'),(14,'https://scontent-cdg4-2.xx.fbcdn.net/v/t39.30808-6/515509901_10233470619980973_3345442632780592906_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9eae26&_nc_ohc=u2Enq3_i3ksQ7kNvwFJS5D_&_nc_oc=AdqZr5WIf-B1CGrlErF50Xbq3NaboDuDBBLx0VE-4e98sMNiM1m64WWG2SS3svTINj0&_nc_zt=23&_nc_ht=scontent-cdg4-2.xx&_nc_gid=C1BxmK1UBHCqTtX_iNYVGA&_nc_ss=7b2a8&oh=00_Af41--ksmO8VXFvDFBzgzSyN-zyQrASft-I28IPweS-SCw&oe=6A190FB7','kapa',8,'2026-05-24 19:53:37');
/*!40000 ALTER TABLE `gallery_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Trajanje u minutama',
  `price` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '✂️',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (7,'Šišanje',30,10.00,'Šišanje po želji','✂️'),(8,'Šišanje i feniranje',45,20.00,'Šišanje sa feniranjem','💇'),(9,'Farbanje',90,30.00,'Farbanje cele kose','🎨'),(10,'Balayage',120,40.00,'Tehnika balayage','✨'),(11,'Pramenovi',90,30.00,'Pramenovi na foliju','🌟'),(12,'Feniranje',30,10.00,'Samo feniranje','💨'),(13,'Peglanje kose',30,10.00,'Peglanje kose','🔧'),(14,'Šišanje brade',20,5.00,'Sređivanje brade','🧔'),(15,'Musko sisanje',15,8.00,'','✂️');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'Antonije Knezevic','antonijek@yahoo.com','$2b$10$QP82z9RMQXnSosm7xdncFOSNml1Eld64tnkESzcuEcuOmgmorUbgy','067551384',1,'2026-05-21 22:50:17'),(4,'Ivan','ivan@ivan.com','$2b$10$drgGvXDrRIrXCcXzeCHfveE2ZDcfmAHBrvqi16LSDXagRoLdKUg5.','065222222',0,'2026-05-22 21:11:06'),(5,'Admin','admin@salon.com','$2b$10$3/A9LZ63r2rkkX/gg/d9ReckQYhsTnSvo4QumCTi.U1pu5o7zpia.','0600000000',1,'2026-05-23 12:16:26'),(13,'Test','test@test.com','$2b$10$Pc9CfEGl2/icE2.4Ra1vpOqS1F69vP9.5Vyap92gbm6j0y7oLtWOq','+38111111111',0,'2026-05-25 13:33:04'),(15,'Test Korisnik','test_1779720114632@example.com','$2b$10$N/SVGHKBRINK/2TURhtBk.73calLanAJhaMF7vfrlYCFGf9DAfeeC',NULL,0,'2026-05-25 14:41:54'),(17,'Anto','anto@yahoo.com','$2b$10$pcv7yZKw9wvx7emXJIiYhuQX3FLsJJ9XAjiXnuDxA5PaytW9bhzkG','0665300735',0,'2026-05-26 12:02:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-26 16:27:46
