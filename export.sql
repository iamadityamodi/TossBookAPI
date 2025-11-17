-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tossbookapi
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `allbets`
--

DROP TABLE IF EXISTS `allbets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allbets` (
  `id` char(24) NOT NULL,
  `teamAName` varchar(250) DEFAULT NULL,
  `teamBName` varchar(250) DEFAULT NULL,
  `leagueName` varchar(250) DEFAULT NULL,
  `sportType` varchar(250) DEFAULT NULL,
  `betStartTime` datetime DEFAULT NULL,
  `betEndTime` datetime DEFAULT NULL,
  `tossRate` int DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `hasBet` tinyint(1) NOT NULL,
  `betTeamName` varchar(250) DEFAULT NULL,
  `betAmount` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `isDelete` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allbets`
--

LOCK TABLES `allbets` WRITE;
/*!40000 ALTER TABLE `allbets` DISABLE KEYS */;
INSERT INTO `allbets` VALUES ('69122ec9adae63b3ce0eb6c9','Team 13','Team 14','ICC World Cup','Cricket','2025-11-10 23:58:25','2025-11-11 12:40:00',95,'/upload/allbetimages/1762799305269-ic_launcher.jpeg',1,'Team 14',50,1,0),('69135167d0c6356ea364ecfe','Team 13','Team 14','ICC World Cup','Cricket','2025-11-11 20:38:23','2025-11-12 12:40:00',95,'/upload/allbetimages/1762873703149-ic_launcher.jpeg',0,NULL,NULL,1,0),('6914b5af33fd100881ca26bc','Team 13','Team 14','ICC World Cup','Cricket','2025-11-12 21:58:31','2025-11-12 22:00:00',95,'/upload/allbetimages/1762964911366-ic_launcher.jpeg',1,'Team 14',689,1,0),('69173afbc887683275079cdd','Team 13','Team 14','ICC World Cup','Cricket','2025-11-14 19:51:47','2025-11-14 22:00:00',95,'/upload/allbetimages/1763130107777-ic_launcher.jpeg',0,NULL,NULL,1,0),('69173b9f922cd417914c68d4','Team 15','Team 16','ICC World Cup','Cricket','2025-11-14 19:54:32','2025-11-14 22:00:00',95,'/upload/allbetimages/1763130271986-ic_launcher.jpeg',0,NULL,NULL,1,0),('69173be2a39725623eff4672','Team 17','Team 18','ICC World Cup','Cricket','2025-11-14 19:55:38','2025-11-14 22:00:00',95,'/upload/allbetimages/1763130338195-ic_launcher.jpeg',0,NULL,NULL,1,0),('69173da96fc349d207ad9f95','Team 17','Team 18','ICC World Cup','Cricket','2025-11-14 20:03:13','2025-11-14 22:00:00',95,'/upload/allbetimages/1763130793807-ic_launcher.jpeg',0,NULL,NULL,1,0),('691774c8a3260e2cc16619c0','Team 17','Team 18','ICC World Cup','Cricket','2025-11-14 23:58:25','2025-11-15 22:00:00',95,'/upload/allbetimages/1763144904966-ic_launcher.jpeg',0,NULL,NULL,1,0),('6917e312c9cccb6c4943351b','Team 17','Team 18','ICC World Cup','Cricket','2025-11-15 07:48:58','2025-11-15 07:50:00',95,'/upload/allbetimages/1763173138848-ic_launcher.jpeg',1,'Team 17',50,1,0),('6917e37ac9cccb6c4943351d','Team 100','Team 200','ICC World Cup','Cricket','2025-11-15 07:50:42','2025-11-15 07:50:00',95,'/upload/allbetimages/1763173242173-ic_launcher.jpeg',0,NULL,NULL,0,0),('6917e38bc9cccb6c4943351e','Team 1001','Team 2002','ICC World Cup','Cricket','2025-11-15 07:50:59','2025-11-15 07:53:00',95,'/upload/allbetimages/1763173259621-ic_launcher.jpeg',1,'Team 2002',200,1,0),('6917e48ec9cccb6c49433521','Team 10011','Team 20022','ICC World Cup','Cricket','2025-11-15 07:55:18','2025-11-15 08:00:00',95,'/upload/allbetimages/1763173518791-ic_launcher.jpeg',1,'Team 10011',40,1,0),('6917e52444dc7a39cdb183dc','Team 100111','Team 200222','ICC World Cup','Cricket','2025-11-15 07:57:48','2025-11-15 08:01:00',95,'/upload/allbetimages/1763173668227-ic_launcher.jpeg',1,'Team 200222',80,1,0),('6918a0fe70d71a5aa1c9f09a','Team A','Team AA','ICC World Cup','Cricket','2025-11-15 21:19:18','2025-11-15 21:21:00',95,'/upload/allbetimages/1763221758585-ic_launcher.jpeg',1,'Team AA',50,1,0),('6918a3bc70d71a5aa1c9f09c','Team B','Team BB','ICC World Cup','Cricket','2025-11-15 21:31:00','2025-11-15 21:32:00',95,'/upload/allbetimages/1763222460206-ic_launcher.jpeg',1,'Team BB',10,1,0);
/*!40000 ALTER TABLE `allbets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tblallbetgetid`
--

DROP TABLE IF EXISTS `tblallbetgetid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblallbetgetid` (
  `id` char(24) NOT NULL,
  `DateTime` datetime DEFAULT NULL,
  `Status` varchar(45) DEFAULT NULL,
  `leagueName` varchar(45) DEFAULT NULL,
  `teamAandteamB` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tblallbetgetid`
--

LOCK TABLES `tblallbetgetid` WRITE;
/*!40000 ALTER TABLE `tblallbetgetid` DISABLE KEYS */;
INSERT INTO `tblallbetgetid` VALUES ('69173be2a39725623eff4672','2025-11-14 19:55:38','pending',NULL,NULL),('69173da96fc349d207ad9f95','2025-11-14 20:03:13','pending','ICC World Cup','Team 17 VS Team 18'),('691774c8a3260e2cc16619c0','2025-11-14 23:58:25','pending','ICC World Cup','Team 17 VS Team 18'),('6917e312c9cccb6c4943351b','2025-11-15 07:48:58','pending','ICC World Cup','Team 17 VS Team 18'),('6917e37ac9cccb6c4943351d','2025-11-15 07:50:42','pending','ICC World Cup','Team 100 VS Team 200'),('6917e38bc9cccb6c4943351e','2025-11-15 07:50:59','pending','ICC World Cup','Team 1001 VS Team 2002'),('6917e48ec9cccb6c49433521','2025-11-15 07:55:18','pending','ICC World Cup','Team 10011 VS Team 20022'),('6917e52444dc7a39cdb183dc','2025-11-15 07:57:48','pending','ICC World Cup','Team 100111 VS Team 200222'),('6918a0fe70d71a5aa1c9f09a','2025-11-15 21:19:18','pending','ICC World Cup','Team A VS Team AA'),('6918a3bc70d71a5aa1c9f09c','2025-11-15 21:31:00','pending','ICC World Cup','Team B VS Team BB');
/*!40000 ALTER TABLE `tblallbetgetid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tblbattranscation`
--

DROP TABLE IF EXISTS `tblbattranscation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblbattranscation` (
  `id` char(24) NOT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `betId` char(24) DEFAULT NULL,
  `batteamname` varchar(45) DEFAULT NULL,
  `amountOfBat` int DEFAULT NULL,
  `batStatus` varchar(45) DEFAULT NULL,
  `timeStamp` datetime DEFAULT NULL,
  `leagueName` varchar(250) DEFAULT NULL,
  `teamAname` varchar(45) DEFAULT NULL,
  `teamBname` varchar(45) DEFAULT NULL,
  `tossRate` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tblbattranscation`
--

LOCK TABLES `tblbattranscation` WRITE;
/*!40000 ALTER TABLE `tblbattranscation` DISABLE KEYS */;
INSERT INTO `tblbattranscation` VALUES ('69122f80adae63b3ce0eb6ca','amitpandey01','69122ec9adae63b3ce0eb6c9','Team 13',200,'win','2025-11-11 00:01:28','ICC World Cup','Team 13','Team 14',95),('69122f92adae63b3ce0eb6cb','adityamodi01','69122ec9adae63b3ce0eb6c9','Team 14',50,'loss','2025-11-11 00:01:46','ICC World Cup','Team 13','Team 14',95),('6914b5c233fd100881ca26bd','adityamodi01','6914b5af33fd100881ca26bc','Team 13',50,'win','2025-11-12 21:58:50','ICC World Cup','Team 13','Team 14',95),('6914b5d233fd100881ca26be','amitpandey01','6914b5af33fd100881ca26bc','Team 14',689,'loss','2025-11-12 21:59:06','ICC World Cup','Team 13','Team 14',95),('6917e332c9cccb6c4943351c','adityamodi01','6917e312c9cccb6c4943351b','Team 17',50,'pending','2025-11-15 07:49:30','ICC World Cup','Team 17','Team 18',95),('6917e3a7c9cccb6c4943351f','adityamodi01','6917e38bc9cccb6c4943351e','Team 1001',10,'win','2025-11-15 07:51:27','ICC World Cup','Team 1001','Team 2002',95),('6917e3b6c9cccb6c49433520','amitpandey01','6917e38bc9cccb6c4943351e','Team 2002',200,'loss','2025-11-15 07:51:42','ICC World Cup','Team 1001','Team 2002',95),('6917e4a2c9cccb6c49433522','amitpandey01','6917e48ec9cccb6c49433521','Team 10011',200,'win','2025-11-15 07:55:38','ICC World Cup','Team 10011','Team 20022',95),('6917e4bac9cccb6c49433523','adityamodi01','6917e48ec9cccb6c49433521','Team 10011',40,'win','2025-11-15 07:56:02','ICC World Cup','Team 10011','Team 20022',95),('6917e53244dc7a39cdb183dd','amitpandey01','6917e52444dc7a39cdb183dc','Team 100111',400,'loss','2025-11-15 07:58:02','ICC World Cup','Team 100111','Team 200222',95),('6917e53f44dc7a39cdb183de','adityamodi01','6917e52444dc7a39cdb183dc','Team 200222',80,'win','2025-11-15 07:58:15','ICC World Cup','Team 100111','Team 200222',95),('6918a10d70d71a5aa1c9f09b','adityamodi01','6918a0fe70d71a5aa1c9f09a','Team AA',50,'loss','2025-11-15 21:19:33','ICC World Cup','Team A','Team AA',95),('6918a3c770d71a5aa1c9f09d','adityamodi01','6918a3bc70d71a5aa1c9f09c','Team BB',10,'cancelled','2025-11-15 21:31:11','ICC World Cup','Team B','Team BB',95);
/*!40000 ALTER TABLE `tblbattranscation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tblcreatetwoteam`
--

DROP TABLE IF EXISTS `tblcreatetwoteam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblcreatetwoteam` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `team1` varchar(45) DEFAULT NULL,
  `team2` varchar(45) DEFAULT NULL,
  `matchvenue` varchar(45) DEFAULT NULL,
  `matchwinnertatus` tinyint(1) DEFAULT NULL,
  `matchimage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tblcreatetwoteam`
--

LOCK TABLES `tblcreatetwoteam` WRITE;
/*!40000 ALTER TABLE `tblcreatetwoteam` DISABLE KEYS */;
/*!40000 ALTER TABLE `tblcreatetwoteam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbllogintype`
--

DROP TABLE IF EXISTS `tbllogintype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbllogintype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `LoginType` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbllogintype`
--

LOCK TABLES `tbllogintype` WRITE;
/*!40000 ALTER TABLE `tbllogintype` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbllogintype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tblregistration`
--

DROP TABLE IF EXISTS `tblregistration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblregistration` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(50) DEFAULT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(45) DEFAULT NULL,
  `ages` int DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `createdate` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tblregistration`
--

LOCK TABLES `tblregistration` WRITE;
/*!40000 ALTER TABLE `tblregistration` DISABLE KEYS */;
INSERT INTO `tblregistration` VALUES (1,'Aditya modi','adityamodi01','123','','9999999999',NULL,'','','2025-11-10 23:55:41'),(2,'Amit Pandey','amitpandey01','123','','9999999999',NULL,'','','2025-11-11 00:00:43'),(3,'Rahul Lotwala','rahullotawala01','123','','9876543210',NULL,'','','2025-11-16 16:53:44'),(4,'MMM Lotwala','rahullotawala01','123','','9876543210',NULL,'','','2025-11-16 17:00:18'),(5,'MMM Lotwala','rahullotawala01','123','','9876543210',NULL,'','','2025-11-16 17:00:25'),(6,'SSSS Lotwala','rahullotawala01','123','','9876543210',NULL,'','','2025-11-16 17:05:17'),(7,'AAAA Lotwala','rahullotawala01','123','','9876543210',NULL,'','','2025-11-16 17:06:45'),(8,'AAAA Lotwala','stbaditya1','123','','9825128376',NULL,'','','2025-11-16 20:41:28');
/*!40000 ALTER TABLE `tblregistration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tblsattlement`
--

DROP TABLE IF EXISTS `tblsattlement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblsattlement` (
  `totaladdedamount` varchar(45) DEFAULT NULL,
  `totalwithrawalamoount` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tblsattlement`
--

LOCK TABLES `tblsattlement` WRITE;
/*!40000 ALTER TABLE `tblsattlement` DISABLE KEYS */;
/*!40000 ALTER TABLE `tblsattlement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tblwallet`
--

DROP TABLE IF EXISTS `tblwallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblwallet` (
  `wallet_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) DEFAULT NULL,
  `user_name` varchar(45) DEFAULT NULL,
  `tblWalletcol` decimal(12,2) DEFAULT '0.00',
  `totalamount` decimal(12,2) DEFAULT NULL,
  `exposure` decimal(12,2) DEFAULT '0.00',
  `mustChangePassword` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`wallet_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tblwallet`
--

LOCK TABLES `tblwallet` WRITE;
/*!40000 ALTER TABLE `tblwallet` DISABLE KEYS */;
INSERT INTO `tblwallet` VALUES (1,'1','adityamodi01',200.00,NULL,40.00,0,NULL,NULL),(2,'2','amitpandey01',81.00,NULL,0.00,0,NULL,NULL),(3,'3','rahullotawala01',500.00,NULL,0.00,0,NULL,NULL),(4,'4','rahullotawala01',900.00,NULL,0.00,0,NULL,NULL),(5,'5','rahullotawala01',100.00,NULL,0.00,0,NULL,NULL),(6,'6','rahullotawala01',0.00,NULL,0.00,0,NULL,NULL),(7,'7','rahullotawala01',600.00,600.00,0.00,0,NULL,NULL),(8,'8','stbaditya1',0.00,0.00,0.00,0,NULL,NULL);
/*!40000 ALTER TABLE `tblwallet` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-17 23:31:09
