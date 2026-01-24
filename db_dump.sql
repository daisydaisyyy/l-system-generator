-- Progettazione Web 
DROP DATABASE if exists lsys; 
CREATE DATABASE lsys; 
USE lsys; 
-- MySQL dump 10.13  Distrib 5.7.28, for Win64 (x86_64)
--
-- Host: localhost    Database: lsys
-- ------------------------------------------------------
-- Server version	5.7.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `drawing`
--

DROP TABLE IF EXISTS `drawing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `drawing` (
  `name` varchar(128) NOT NULL,
  `owner` varchar(64) NOT NULL,
  `axiom` varchar(255) NOT NULL,
  `depth` int(11) NOT NULL,
  `angle` double NOT NULL,
  `starting_rot` double DEFAULT '0',
  `line_width` double DEFAULT '1',
  `scale` double DEFAULT '1',
  `is_public` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`name`,`owner`),
  KEY `owner` (`owner`),
  CONSTRAINT `drawing_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `user` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drawing`
--

LOCK TABLES `drawing` WRITE;
/*!40000 ALTER TABLE `drawing` DISABLE KEYS */;
INSERT INTO `drawing` VALUES ('Fractal plant','admin','X',7,25,-90,3,0.2146039603960396,1),('Hexagonal Gosper curve','admin','F',3,60,0,2,3.3346153846153848,1),('Koch snowflake','admin','F--F--F',4,60,0,1,1.4820512820512821,1),('Penrose tiling','admin','[7]++[7]++[7]++[7]++[7]',2,36,0,1,8.383333333333335,1),('Pentigree','admin','1++2++3++4++5',4,36,0,2,1.5586516853932584,1),('Sierpinski carpet','admin','F+F+F+F+X',3,90,0,2,1.8281481481481483,1),('Sierpinski triangle','admin','F-G-G',5,120,-180,1,12.474820143884893,1);
/*!40000 ALTER TABLE `drawing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rule`
--

DROP TABLE IF EXISTS `rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `variable` varchar(8) NOT NULL,
  `drawing_name` varchar(128) NOT NULL,
  `owner` varchar(64) NOT NULL,
  `replacement` text NOT NULL,
  `movement_type` varchar(20) NOT NULL DEFAULT 'drawLine',
  `color` varchar(7) NOT NULL DEFAULT '#000000',
  PRIMARY KEY (`id`),
  KEY `fk_rule_drawing_owner` (`drawing_name`,`owner`),
  CONSTRAINT `fk_rule_drawing_owner` FOREIGN KEY (`drawing_name`, `owner`) REFERENCES `drawing` (`name`, `owner`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rule`
--

LOCK TABLES `rule` WRITE;
/*!40000 ALTER TABLE `rule` DISABLE KEYS */;
INSERT INTO `rule` VALUES (1,'1','Pentigree','admin','+1++1----1--1++1++1-','drawLine','#ff0000'),(2,'2','Pentigree','admin','+2++2----2--2++2++2-','drawLine','#f0a902'),(3,'3','Pentigree','admin','+3++3----3--3++3++3-','drawLine','#008000'),(4,'4','Pentigree','admin','+4++4----4--4++4++4-','drawLine','#0000ff'),(5,'5','Pentigree','admin','+5++5----5--5++5++5-','drawLine','#8000ff'),(6,'F','Koch snowflake','admin','F+F--F+F','drawLine','#4b7ade'),(7,'F','Sierpinski triangle','admin','F-G+F+G-F','drawLine','#ffbc40'),(8,'G','Sierpinski triangle','admin','GG','drawLine','#ff0000'),(9,'X','Fractal plant','admin','F+[[X]-X]-F[-FX]+X','noOp','#b4d256'),(10,'F','Fractal plant','admin','FF','drawLine','#008000'),(11,'F','Sierpinski carpet','admin','FFF','drawLine','#00ffff'),(12,'X','Sierpinski carpet','admin','XfXfX+fF++ff-f-fF++ff-f-f-XfFX++ff-f-XfXFX++ff+ff+','drawDot','#0000ff'),(13,'f','Sierpinski carpet','admin','fff','moveTo','#2a62fa'),(36,'F','Hexagonal Gosper curve','admin','F-G--G+F++FF+G-','drawLine','#00ff00'),(37,'G','Hexagonal Gosper curve','admin','+F-GG--G-F++F+G','drawLine','#563d8c'),(57,'7','Penrose tiling','admin','+8--9[---6--7]+','drawLine','#02f28b'),(58,'6','Penrose tiling','admin','8++9----7[-8----6]++','drawLine','#e346ac'),(59,'8','Penrose tiling','admin','-6++7[+++8++9]-','drawLine','#35ff35'),(60,'9','Penrose tiling','admin','--8++++6[+9++++7]--7','drawLine','#ff80c0');
/*!40000 ALTER TABLE `rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('admin','$2y$12$mcl2y6b/LdDftfmMqY04GeQGoCDaRNWXzRAiZSV3GyuctaYP5QVSy',1),('test','$2y$10$bxbecmco6Q/OhLRQh1hCSuhCDn1eAhGH5hRMpz6rUkK14QHolpBlO',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-24 13:50:14
