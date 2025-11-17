const express = require('express')
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
app.use(express.json()); // Important to parse JSON body


 

const {
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

} = require('../controllers/tossbookcontrollers')

const router = express.Router();

router.post('/createuser', createUser);

router.post('/login', login);

router.post('/loginType', loginType);

router.post('/bets', createAllBets);

router.post('/betsImage', upload.single("image"), createAllBetsWithImage);

router.post('/getAllBats', getAllBat);

router.get('/getAllUser', getAllUser);

router.post('/getBetTransaction', getBetTransaction);


router.post('/insertCointInWallet', insert_CoinInWallet);

router.post('/WithdrawalMoney', WithdrawalMoney);

router.post('/wallet', GetWallet);

router.post('/place_bet', placebet);

router.post('/winningStatsuUpdate', winningStatsuUpdate);

router.post('/createTwoTeamMatch', upload.single('matchimage'), createTwoTeamMatch);





export default router