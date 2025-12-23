import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Import all controller functions using ES Modules
import {
  createUser,
  loginType,
  createTwoTeamMatch,
  createAllBets,
  getAllUser,
  insert_CoinInWallet,
  placebet,
  getAllBat,
  winningStatsuUpdate,
  login,
  GetWallet,
  createAllBetsWithImage,
  upload,
  getBetTransaction,
  WithdrawalMoney,
  GetMatchcompletedstatus,
  getAllbetgetid,
  createAllBetsWithImageUpdateStatus,
  getAllBatTest,
  addEvent,
  getEvent,
  createEvent,
  getFutureEvents,
  createEventNew,
  getEventWorldTime,
  getAllBat2
  
 } from "../controllers/tossbookcontrollers.js";

const router = express.Router();

// Routes
router.post("/createuser", createUser);

router.post("/login", login);

router.post("/loginType", loginType);

router.post("/bets", createAllBets);

router.post("/betsImage", upload.single("image"), createAllBetsWithImage);

router.post("/betsImageUpdateStatus", createAllBetsWithImageUpdateStatus);

 
 
router.post("/getAllBats", getAllBat);
router.post("/getAllBat2", getAllBat2);

router.post("/createEvent",createEvent);

router.post("/createEventNew",createEventNew);
router.post("/getEventWorldTime",getEventWorldTime );

router.post("/getFutureEvents",getFutureEvents);

router.post("/getAllBatsTest", getAllBatTest);

router.get("/getAllUser", getAllUser);

router.post("/getAllbetgetid", getAllbetgetid);

router.post("/addEvent", addEvent);

router.post("/getEvent", getEvent);



router.post("/getBetTransaction", getBetTransaction);

router.post("/insertCointInWallet", insert_CoinInWallet);

router.post("/WithdrawalMoney", WithdrawalMoney);

router.post("/wallet", GetWallet);

router.post("/matchcompletedstatus", GetMatchcompletedstatus);

router.post("/place_bet", placebet);

router.post("/winningStatsuUpdate",winningStatsuUpdate);

// router.post("/allsattlement",allsattlement);

router.post("/createTwoTeamMatch",upload.single("matchimage"),createTwoTeamMatch);

export default router;
