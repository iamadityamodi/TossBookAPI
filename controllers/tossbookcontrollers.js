import db from "../config/db.js";
import multer from "multer";
import path from "path";
import { DateTime } from "luxon";
import { ObjectId } from "bson";
import moment from "moment-timezone";
import { log } from "console";


const login = async (req, res) => {
    try {

        const { username, password } = req.body;

        if (!username) {
            return res.status(404).send({
                success: false,
                message: 'Please enter username',
            })
        } else if (!password) {
            return res.status(404).send({
                success: false,
                message: 'Please enter password',
            })
        }


        const [rows] = await db.query(
            'SELECT * FROM tblregistration WHERE user_name = ? AND password = ?',
            [username, password]
        );



        if (rows.length > 0) {
            const user = rows[0]; // get the first (and only) user
            return res.status(200).send({

                success: true,
                message: 'Successfully Logged In.',
                data: {
                    user_id: user.user_id,
                    fullname: user.fullname,
                    user_name: user.user_name,
                    password: user.password,
                    address: user.address,
                    mobile_no: user.mobile_no,
                    login_type_name: user.login_type_name,
                    ages: user.ages,
                    gender: user.gender,
                    country: user.country,
                    createdate: user.createdate
                }
            });
        } else {
            return res.status(200).send({
                success: false,
                message: 'Invalid username and password'
            });
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in login API',
            error
        })
    }
}


// dynamic dreams
// Ebizz
// B2B UNBOUND


const GetMatchcompletedstatus = async (req, res) => {

    try {


        const { matchId } = req.body;


        let query = "SELECT * FROM tblallmatchprofitloss";
        let params = [];

        if (matchId) {
            query += " WHERE Status = ?";
            params.push(matchId);
        }

        query += " ORDER BY id DESC";

        const [data] = await db.query(query, params);


        // data will always be an array, so check its length
        if (data.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No data found',
                data: []
            });
        }


        res.status(200).send({
            success: true,
            message: 'Success.',
            data: data,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Get All Student API',
            error
        })
    }

}



const getAllbetgetid = async (req, res) => {

    try {


        const { status } = req.body;

        let query = "SELECT * FROM tblallbetgetid";
        let params = [];

        if (status) {
            query += " WHERE Status = ?";
            params.push(status);
        }

        query += " ORDER BY id DESC";

        const [data] = await db.query(query, params);

        // data will always be an array, so check its length
        if (data.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No data found',
                data: []
            });
        }

        res.status(200).send({
            success: true,
            message: 'Success.',
            data: data,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Get All Student API',
            error
        })
    }

}



const getAllUser = async (req, res) => {

    try {


        const [data] = await db.query(" SELECT * FROM tblregistration")

        // const [loginType] = await db.query("SELECT LoginType tbllogintype")

        // data will always be an array, so check its length
        if (data.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No users found',
                data: []
            });
        }


        res.status(200).send({
            success: true,
            message: 'Success.',
            data: data,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Get All Student API',
            error
        })
    }

}


const closeBetTransaction = async (req, res) => {
    try {
        const { betId, user_name } = req.body;

        if (!betId || !user_name) {
            return res.status(400).json({
                success: false,
                message: "betId and user_name are required"
            });
        }

        // 1️⃣ Get ALL PENDING bets for this user & betId
        const [betRows] = await db.query(
            `
      SELECT amountOfBat
      FROM tblbattranscation
      WHERE betId = ?
        AND user_name = ?
        AND batStatus = 'pending'
      `,
            [betId, user_name]
        );

        // ❌ No pending bets → nothing to cancel
        if (betRows.length === 0) {
            return res.json({
                success: false,
                message: "No pending bet found to cancel"
            });
        }

        // 2️⃣ Calculate TOTAL refund amount
        const totalRefund = betRows.reduce(
            (sum, row) => sum + Number(row.amountOfBat || 0),
            0
        );

        // 3️⃣ Cancel ALL pending bets
        await db.query(
            `
      UPDATE tblbattranscation
      SET batStatus = 'cancelled'
      WHERE betId = ?
        AND user_name = ?
        AND batStatus = 'pending'
      `,
            [betId, user_name]
        );

        // 4️⃣ Update wallet
        const [walletRows] = await db.query(
            `SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?`,
            [user_name]
        );

        if (walletRows.length > 0) {
            const wallet = walletRows[0];

            const updatedBalance =
                Number(wallet.tblWalletcol) + totalRefund;

            const updatedExposure =
                Math.max(0, Number(wallet.exposure) - totalRefund);

            await db.query(
                `
        UPDATE tblwallet
        SET tblWalletcol = ?, exposure = ?
        WHERE user_name = ?
        `,
                [updatedBalance, updatedExposure, user_name]
            );
        } else {
            // Wallet not exists → create
            await db.query(
                `
        INSERT INTO tblwallet (user_name, tblWalletcol, exposure)
        VALUES (?, ?, ?)
        `,
                [user_name, totalRefund, 0]
            );
        }

        // 5️⃣ Reset allbets (optional, depends on your design)
        await db.query(
            `
      UPDATE allbets
      SET hasBet = 0,
          betAmount = 0,
          betTeamName = NULL
      WHERE id = ?
      `,
            [betId]
        );


        //  const [betData] = await db.query(
        //     `SELECT leagueName, teamAName, teamBName, tossRate, betEndTime, isActive  FROM allbets WHERE id = ?`,
        //     [betId]
        // );

        // if (betData.length === 0) {
        //     return res.status(404).json({ success: false, message: "Bet not found" });
        // }

        // const { leagueName, teamAName, teamBName, tossRate, betEndTime, isActive } = betData[0];

        // const mergedTeamName = `Bet on ${leagueName} ${teamAName} VS ${teamBName}`;

        // await db.query(
        //     `INSERT INTO tblpassbook 
        // (id, userName, transactionDescription, transactionType, transactionAmount, balance, betTeamName, timeStamp)
        // VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        //     [new ObjectId().toString(),
        //         user_name,
        //         mergedTeamName,
        //         "credit",
        //         amountOfBet,
        //     getWalletCoin[0].tblWalletcol,
        //         betTeamName,
        //         betStartUTC]
        // );




        //Get Waller balance
        const [getWalletCoin] = await db.query(
            "SELECT tblWalletcol FROM tblwallet WHERE user_name = ?",
            [user_name]
        );

        // Time Current
        const betStartUTC = DateTime.utc().toSQL({ includeOffset: false });


        /// Get Bet Data
        const [betData] = await db.query(
            `SELECT leagueName, teamAName, teamBName, tossRate, betEndTime, isActive  FROM allbets WHERE id = ?`,
            [betId]
        );

        if (betData.length === 0) {
            return res.status(404).json({ success: false, message: "Bet not found" });
        }
        const { leagueName, teamAName, teamBName, tossRate, betEndTime, isActive } = betData[0];
        const mergedTeamName = `Cancelled Bet on ${leagueName} ${teamAName} VS ${teamBName}`;

        await db.query(
            `INSERT INTO tblpassbook 
        (id, userName, transactionDescription, transactionType, transactionAmount, balance, betTeamName, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [new ObjectId().toString(),
                user_name,
                mergedTeamName,
                "credit",
                totalRefund,
            getWalletCoin[0].tblWalletcol,
                "",
                betStartUTC]
        );



        // ✅ Final response
        return res.json({
            success: true,
            message: "All pending bets cancelled and amount refunded",
            refundedAmount: totalRefund
        });

    } catch (error) {
        console.error("❌ closeBetTransaction error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



const getBetTransaction = async (req, res) => {
    try {
        const { betId, user_name } = req.body;

        const [data] = await db.query("SELECT * FROM tblbattranscation ORDER BY timeStamp DESC");


        const filteredData = data.filter(row => {
            let match = true;


            // Filter only if id has a value
            if (betId) {
                match = match && row.betId == betId;
            }

            // Filter only if id has a value
            if (user_name) {
                match = match && row.user_name == user_name;
            }


            return match;
        });



        if (filteredData.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No data found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Success.',
            data: filteredData,
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Error in Get Bet Transaction API",
            error: error.message,
        });
    }
};


const getTotalWalletAmount = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT SUM(totalamount) AS totalAmount FROM tblwallet"
        );

        const total = rows[0].totalAmount || 0;

        res.status(200).send({
            success: true,
            totalAmount: total
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error fetching total wallet amount",
            error: error.message
        });
    }
};




const winningStatsuUpdate = async (req, res) => {

    const connection = await db.getConnection();

    try {

        const { betId, winnerTeam } = req.body;

        if (!betId || !winnerTeam) {
            return res.status(400).json({
                success: false,
                message: "betId and winnerTeam are required"
            });
        }

        // ================= TRANSACTION START =================
        await connection.beginTransaction();

        // ✅ Check if already completed
        const [checkStatus] = await connection.query(
            "SELECT Status FROM tblallbetgetid WHERE id = ?",
            [betId]
        );

        if (checkStatus.length > 0 && checkStatus[0].Status === "completed") {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Result already declared"
            });
        }

        // ================= MATCH CANCEL CASE =================
        if (winnerTeam.toLowerCase() === "cancel") {

            // Get pending bets
            const [allBets] = await connection.query(
                `SELECT user_name, amountOfBat 
                 FROM tblbattranscation 
                 WHERE betId = ? AND batStatus = 'pending'`,
                [betId]
            );

            // Update status
            await connection.query(
                `UPDATE tblbattranscation 
                 SET batStatus = 'cancelled' 
                 WHERE betId = ? AND batStatus = 'pending'`,
                [betId]
            );

            

            let totalRefund = 0;

            for (const bet of allBets) {

                const userName = bet.user_name.trim();
                const amount = parseFloat(bet.amountOfBat);

                totalRefund += amount;

                const [wallet] = await connection.query(
                    "SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?",
                    [userName]
                );

                if (wallet.length > 0) {

                    const newBal =
                        parseFloat(wallet[0].tblWalletcol) + amount;

                    const newExp =
                        parseFloat(wallet[0].exposure) - amount;

                    await connection.query(
                        `UPDATE tblwallet 
                         SET tblWalletcol = ?, exposure = ?
                         WHERE user_name = ?`,
                        [newBal, newExp, userName]
                    );

                } else {

                    await connection.query(
                        `INSERT INTO tblwallet(user_name, tblWalletcol, exposure)
                         VALUES(?,?,?)`,
                        [userName, amount, 0]
                    );
                }
            }

            await connection.query(
                "UPDATE tblallbetgetid SET Status = 'cancelled' WHERE id = ?",
                [betId]
            );

            await connection.commit();

            return res.json({
                success: true,
                message: "Match cancelled and refunded",
                totalRefund,
                users: allBets.length
            });
        }

        // ================= UPDATE WINNERS =================
        await connection.query(
            `UPDATE tblbattranscation 
             SET batStatus = 'win' 
             WHERE betId = ?
             AND batteamname = ?
             AND batStatus = 'pending'`,
            [betId, winnerTeam]
        );

        // ================= UPDATE LOSERS =================
        await connection.query(
            `UPDATE tblbattranscation 
             SET batStatus = 'loss' 
             WHERE betId = ?
             AND batteamname != ?
             AND batStatus = 'pending'`,
            [betId, winnerTeam]
        );

        // ================= GET WINNERS =================
        const [winners] = await connection.query(
            `SELECT user_name, leagueName, teamAname, teamBname, amountOfBat, tossRate
             FROM tblbattranscation
             WHERE betId = ?
             AND batteamname = ?
             AND batStatus = 'win'`,
            [betId, winnerTeam]
        );

        // ================= GET LOSERS =================
        const [losers] = await connection.query(
            `SELECT user_name, leagueName, teamAname, teamBname, amountOfBat
             FROM tblbattranscation
             WHERE betId = ?
             AND batteamname != ?
             AND batStatus = 'loss'`,
            [betId, winnerTeam]
        );

        let totalWinners = 0;
        let totalWinningAmount = 0;

        // ================= PAY WINNERS =================
        for (const winner of winners) {

            const userName = winner.user_name.trim();
            console.log(winner.leagueName + " " + userName);
            const amount = parseFloat(winner.amountOfBat);
            const rate = parseFloat(winner.tossRate);

            const winAmount =
                amount + (amount * rate / 100);

            totalWinners++;
            totalWinningAmount += winAmount;

            const [wallet] = await connection.query(
                "SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?",
                [userName]
            );

            if (wallet.length > 0) {

                const newBal =
                    parseFloat(wallet[0].tblWalletcol) + winAmount;

                const newExp =
                    parseFloat(wallet[0].exposure) - amount;

                await connection.query(
                    `UPDATE tblwallet 
                     SET tblWalletcol = ?, exposure = ?
                     WHERE user_name = ?`,
                    [newBal, newExp, userName]
                );



                // Time Current
                const betStartUTC = DateTime.utc().toSQL({ includeOffset: false });

                console.log("winner " + winner.leagueName);

                const leagueName = winner.leagueName.trim();
                const teamAname = winner.teamAname.trim();
                const teamBname = winner.teamBname.trim();


                const mergedTeamName = `Win bet on ${leagueName} ${teamAname} VS ${teamBname}`;

                await db.query(
                    `INSERT INTO tblpassbook 
        (id, userName, transactionDescription, transactionType, transactionAmount, balance, betTeamName, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [new ObjectId().toString(),
                        userName,
                        mergedTeamName,
                        "credit",
                        winAmount,
                        newBal,
                    winner.batteamname,
                        betStartUTC]
                );



            } else {

                await connection.query(
                    `INSERT INTO tblwallet(user_name, tblWalletcol, exposure)
                     VALUES(?,?,?)`,
                    [userName, winAmount, 0]
                );
            }
        }

        // ================= UPDATE LOSERS EXPOSURE =================
        for (const loser of losers) {

            const userName = loser.user_name.trim();
            const amount = parseFloat(loser.amountOfBat);

            const [wallet] = await connection.query(
                "SELECT exposure FROM tblwallet WHERE user_name = ?",
                [userName]
            );

            if (wallet.length > 0) {

                const newExp =
                    parseFloat(wallet[0].exposure) - amount;

                await connection.query(
                    "UPDATE tblwallet SET exposure = ? WHERE user_name = ?",
                    [newExp, userName]
                );

            } else {

                await connection.query(
                    `INSERT INTO tblwallet(user_name, tblWalletcol, exposure)
                     VALUES(?,?,?)`,
                    [userName, 0, -amount]
                );
            }
        }

        // ================= TOTAL BET =================
        const [totalBet] = await connection.query(
            "SELECT SUM(amountOfBat) AS total FROM tblbattranscation WHERE betId = ? AND batStatus IN ('win', 'loss')",
            [betId]
        );

        const totalBetAmount = totalBet[0].total || 0;

        // ================= COMPLETE MATCH =================
        await connection.query(
            "UPDATE tblallbetgetid SET Status = 'completed' WHERE id = ?",
            [betId]
        );

        // ================= SAVE PROFIT LOSS =================
        const [match] = await connection.query(
            `SELECT id, teamAname, teamBname, leagueName
             FROM allbets WHERE id = ?`,
            [betId]
        );

        const newId = new ObjectId().toString();

        await connection.query(
            `INSERT INTO tblallmatchprofitloss
            (id, matchId, totalBetAmount, totalWinningAmount,
             totalwinners, totallosers, teamAname, teamBname, leagueName)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [
                newId,
                betId,
                totalBetAmount,
                totalWinningAmount,
                totalWinners,
                losers.length,
                match[0].teamAname,
                match[0].teamBname,
                match[0].leagueName
            ]
        );


        // ================= COMMIT =================
        await connection.commit();

        return res.json({
            success: true,
            message: "Result declared successfully",
            winners: totalWinners,
            losers: losers.length,
            totalBetAmount,
            totalWinningAmount
        });

    } catch (error) {

        await connection.rollback();

        console.error("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    } finally {
        connection.release();
    }
};


const placebet = async (req, res) => {
    try {
        const { userName, betId, betTeamName, amountOfBet } = req.body;

        if (!userName) {
            return res.status(500).send({
                success: false,
                message: 'Please your name'
            })
        } else if (!betId) {
            return res.status(500).send({
                success: false,
                message: 'Please enter bet id'
            })
        } else if (!betTeamName) {
            return res.status(500).send({
                success: false,
                message: 'Please select team name'
            })
        } else if (!amountOfBet) {
            return res.status(500).send({
                success: false,
                message: 'Please enter amount'
            })
        }


        const [user] = await db.query(
            `SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?`,
            [userName]
        );

        console.log("user", user);


        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User data is not found" });
        }


        const currentBalance = parseFloat(user[0].tblWalletcol);
        const betAmount = parseFloat(amountOfBet);

        // ❌ Block bet if insufficient balance
        if (currentBalance <= 0) {
            return res.status(400).json({
                success: false,
                message: "Wallet balance is zero. Please add funds to place a bet.",
            });
        }

        if (betAmount > currentBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. You have ₹${currentBalance}, but tried to bet ₹${betAmount}.`,
            });
        }


        const newId = new ObjectId().toString(); // "68f3c188b6ecebf82de1e767"

        const formatDateForMySQL = (date) => {
            const d = new Date(date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        };

        const betStartTime = formatDateForMySQL(new Date());


        // 🧩 3️⃣ Fetch bet details from `allbets`
        const [betData] = await db.query(
            `SELECT leagueName, teamAName, teamBName, tossRate, betEndTime, isActive  FROM allbets WHERE id = ?`,
            [betId]
        );

        if (betData.length === 0) {
            return res.status(404).json({ success: false, message: "Bet not found" });
        }

        const { leagueName, teamAName, teamBName, tossRate, betEndTime, isActive } = betData[0];

        if (!isActive) {
            return res.status(400).json({
                success: false,
                message: "Bet is not active"
            });
        }

        const now = new Date();
        const endTime = new Date(betEndTime);


        if (now > endTime) {
            return res.status(400).json({
                success: false,
                message: "Bet is closed. The betting window has ended.",
            });
        }

        // current time
        await db.query(
            `INSERT INTO tblbattranscation 
            (id, user_name, betId, batteamname, amountOfBat, batStatus, timeStamp,leagueName,teamAname,teamBname,tossRate) 
            VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?)`,
            [newId, userName, betId, betTeamName, amountOfBet, 'pending', betStartTime, leagueName, teamAName, teamBName, tossRate]
        );

        const betTransaction = {
            newId, // or use a UUID if your table uses CHAR(24)
            userName,
            betId,
            betTeamName,
            amountOfBet,
            betStatus: 'pending',
            timeStamp: betStartTime
        };



        const updatedBalance = parseFloat(user[0].tblWalletcol) - amountOfBet;
        const updatedExposure = parseFloat(user[0].exposure) + amountOfBet;


        await db.query(
            `UPDATE tblwallet SET tblWalletcol = ?, exposure = ? WHERE user_name = ?`,
            [updatedBalance, updatedExposure, userName]
        );


        const [getWalletCoin] = await db.query(
            "SELECT tblWalletcol FROM tblwallet WHERE user_name = ?",
            [userName]
        );

        const betStartUTC = DateTime.utc().toSQL({ includeOffset: false });
        const mergedTeamName = `Bet on ${leagueName} ${teamAName} VS ${teamBName}`;

        await db.query(
            `INSERT INTO tblpassbook 
        (id, userName, transactionDescription, transactionType, transactionAmount, balance, betTeamName, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [new ObjectId().toString(),
                userName,
                mergedTeamName,
                "debit",
                amountOfBet,
            getWalletCoin[0].tblWalletcol,
                betTeamName,
                betStartUTC]
        );


        // ✅ Step 4 — Update allbets table → hasBet = 1
        await db.query(
            `UPDATE allbets 
             SET hasBet = 1, betTeamName = ?, betAmount = ? 
             WHERE id = ?`,
            [betTeamName, amountOfBet, betId]
        );


        // await db.commit

        res.json({
            success: true,
            message: "Bet Place successfully",
            data: {
                betTransaction,
                userBalance: updatedBalance,
                userExposure: updatedExposure
            }
        });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in place bat API',
            error
        })
    }
}

const GetWallet = async (req, res) => {

    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(500).send({
                success: false,
                message: 'Please insert user id'
            })
        }
        const [data] = await db.query("SELECT * FROM tblwallet");

        const filteredData = data.filter(row => {
            let match = true;

            // Filter only if id has a value
            if (user_id) {
                match = match && row.user_id == user_id;
            }
            return match;
        });

        if (filteredData.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No data found'
            });
        }

        res.json({
            success: true,
            message: "Success.",
            data: filteredData
        });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in add coin API',
            error
        })
    }

}


const WithdrawalMoney = async (req, res) => {

    try {

        const { user_id, coins } = req.body;

        if (!user_id) {
            return res.status(400).send({
                success: false,
                message: "Please provide user_id",
            });
        }

        if (!coins || coins <= 0) {
            return res.status(400).send({
                success: false,
                message: "Please provide a valid withdrawal amount",
            });
        }

        // 1️⃣ Get user details
        const [userData] = await db.query(
            "SELECT user_name FROM tblregistration WHERE user_id = ?",
            [user_id]
        );

        if (userData.length === 0) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const user_name = userData[0].user_name;

        // 2️⃣ Get current wallet balance
        const [walletData] = await db.query(
            "SELECT tblWalletcol FROM tblwallet WHERE user_id = ?",
            [user_id]
        );

        let currentBalance = 0;
        if (walletData.length > 0) {
            currentBalance = parseFloat(walletData[0].tblWalletcol);
        }

        // 3️⃣ Check sufficient balance
        if (currentBalance < coins) {
            return res.status(400).send({
                success: false,
                message: "Insufficient balance for withdrawal",
            });
        }

        // 4️⃣ Deduct the amount
        const updatedBalance = currentBalance - coins;

        console.log("updatedBalance", updatedBalance);


        // 5️⃣ Update wallet balance in DB
        const [updateResult] = await db.query(
            "UPDATE tblwallet SET tblWalletcol = ? WHERE user_id = ?",
            [updatedBalance, user_id]
        );


        const [getWalletCoin] = await db.query(
            "SELECT tblWalletcol FROM tblwallet WHERE user_id = ?",
            [user_id]
        );

        const newId = new ObjectId().toString(); // "68f3c188b6ecebf82de1e767"
        const betStartUTC = DateTime.utc().toSQL({ includeOffset: false });

        await db.query(
            `INSERT INTO tblpassbook 
        (id, userName, transactionDescription, transactionType, transactionAmount, balance, betTeamName, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId,
                user_name,
                "Money withdrawn from wallet",
                "debit",
                coins,
                getWalletCoin[0].tblWalletcol,
                "",
                betStartUTC]
        );

        if (updateResult.affectedRows === 0) {
            // If wallet doesn’t exist, create it (edge case)
            await db.query(
                "INSERT INTO tblwallet (user_id, user_name, tblWalletcol) VALUES (?, ?, ?)",
                [user_id, user_name, updatedBalance]
            );
        }

        // 6️⃣ Send success response
        res.status(200).json({
            success: true,
            message: "Withdrawal successful",
            data: {
                user_id,
                user_name,
                withdrawn: coins,
                remaining_balance: updatedBalance,
            },
        });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in add coin API Data',
            error
        })
    }

}

const insert_CoinInWallet = async (req, res) => {

    try {
        const { user_id, coins } = req.body;

        if (!user_id) {
            return res.status(500).send({
                success: false,
                message: 'Please select name'
            })
        } else if (!coins) {
            return res.status(500).send({
                success: false,
                message: 'Please amount'
            })
        }

        const [getUserName] = await db.query(
            "SELECT user_name FROM tblregistration WHERE user_id = ?",
            [user_id]
        );



        console.log("getUserName", getUserName);


        // 1️⃣ Try update
        const [result] = await db.query(
            `UPDATE tblwallet 
     SET tblWalletcol = tblWalletcol + ?, totalamount = totalamount + ? 
     WHERE user_id = ?`,
            [coins, coins, user_id]
        );

        const [getWalletCoin] = await db.query(
            "SELECT tblWalletcol FROM tblwallet WHERE user_id = ?",
            [user_id]
        );

        const newId = new ObjectId().toString(); // "68f3c188b6ecebf82de1e767"
        const betStartUTC = DateTime.utc().toSQL({ includeOffset: false });

        await db.query(
            `INSERT INTO tblpassbook 
        (id, userName, transactionDescription, transactionType, transactionAmount, balance, betTeamName, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId,
                getUserName[0].user_name,
                "Points added to wallet",
                "credit",
                coins,
                getWalletCoin[0].tblWalletcol,
                "",
                betStartUTC]
        );



        // 2️⃣ If no rows updated -> insert new row
        if (result.affectedRows === 0) {


            await db.query(
                `INSERT INTO tblWallet 
        (user_id, user_name, tblWalletcol, totalamount)
        VALUES (?, ?, ?, ?)`,
                [user_id, getUserName[0].user_name, coins, coins]
            );
        }
        // Fetch updated coins
        const [rows] = await db.query(
            "SELECT user_id, fullname FROM tblregistration WHERE user_id = ?",
            [user_id]
        );

        res.json({
            success: true,
            message: "Coins added successfully.",
            data: rows[0]
        });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in add coin API',
            error
        })
    }

}


const createUser = async (req, res) => {
    try {
        const { fullname, user_name, password, address, mobile_no, logintype, ages, gender, country } = req.body
        if (!fullname) {
            return res.status(500).send({
                success: false,
                message: 'Please full name'
            })
        } else if (!user_name) {
            return res.status(500).send({
                success: false,
                message: 'Please username'
            })
        } else if (!password) {
            return res.status(500).send({
                success: false,
                message: 'Please password'
            })
        } else if (!mobile_no) {
            return res.status(500).send({
                success: false,
                message: 'Please mobile no'
            })
        } else if (!mobile_no) {
            return res.status(500).send({
                success: false,
                message: 'Please select login type'
            })
        }

        // 0️⃣ Check if username already exists
        const [existingUser] = await db.query(
            "SELECT user_id FROM tblregistration WHERE user_name = ?",
            [user_name]
        );

        const [logintypename] = await db.query("SELECT LoginType FROM tbllogintype WHERE id = ?",
            [logintype]
        );

        let loginTypeName = null;

        if (logintypename.length > 0) {
            loginTypeName = logintypename[0].LoginType;
        }

        console.log("Login Type:", loginTypeName);

        if (existingUser.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Username already exists, please enter another one."
            });
        }

        // 1️⃣ Check if mobile number already exists
        const [existingMobile] = await db.query(
            "SELECT user_id FROM tblregistration WHERE mobile_no = ?",
            [mobile_no]
        );

        if (existingMobile.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Mobile number already exists, please enter another number."
            });
        }


        const ageValue = ages === '' ? null : Number(ages);
        const date = new Date();

        // Convert to India time
        const indiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));

        // Format for MySQL
        const formattedDate = getIndianDateTime();

        const [data] = await db.query(
            `INSERT INTO tblregistration ( fullname , user_name, password, address, mobile_no, login_type_id, login_type_name,  ages, gender, country, createdate )  
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullname, user_name, password, address, mobile_no, logintype, loginTypeName, ageValue, gender, country, formattedDate])

        const userId = data.insertId; // newly created user's ID
        const userIdName = user_name;

        if (!userId) {
            return res.status(500).send({ success: false, message: 'Error creating user' });
        }

        // 2️⃣ Create wallet automatically with balance=0 and exposure=0
        await db.query(
            "INSERT INTO tblwallet (user_id, user_name, tblWalletcol, totalamount, exposure) VALUES (?, ?, 0, 0, 0)",
            [userId, userIdName]
        );

        if (!data) {
            return res.status(404).send({
                success: false,
                message: 'Error in insert query'
            })
        }
        res.set('Cache-Control', 'no-store');
        res.status(202).send({
            success: true,
            message: 'Successfully user created.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create student API',
            error
        })
    }
}

const getloginType = async (req, res) => {
    try {

        const [data] = await db.query(" SELECT * FROM tbllogintype")

        // data will always be an array, so check its length
        if (data.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No Login Type Available',
                data: []
            });
        }


        res.status(200).send({
            success: true,
            message: 'Success.',
            data: data,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in Get All Student API',
            error
        })
    }
}

const loginType = async (req, res) => {
    try {
        const { LoginType } = req.body
        if (!LoginType) {
            return res.status(500).send({
                success: false,
                message: 'Please full login type'
            })
        }



        const data = await db.query(
            `INSERT INTO tbllogintype ( LoginType )  VALUES (?)`,
            [LoginType])
        if (!data) {
            return res.status(404).send({
                success: false,
                message: 'Error in insert query'
            })
        }
        res.set('Cache-Control', 'no-store');
        res.status(202).send({
            success: true,
            message: 'Successfully Inserted.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create Login Type API',
            error
        })
    }
}




const getAllBatForStatusUpdate = async (req, res) => {
    try {
        const { id, isActive: bodyIsActive, isDelete: bodyIsDelete, user_name } = req.body;

        console.log("🟩 Incoming Request:", { user_name });

        // 1️⃣ Fetch all bets
        const [allBets] = await db.query("SELECT * FROM allbets");
        if (!allBets || allBets.length === 0) {
            return res.status(404).json({ success: false, message: "No bets found" });
        }

        // 2️⃣ Fetch ONLY the logged-in user’s bet transactions
        let userBets = {};
        if (user_name) {
            const [userBetData] = await db.query(
                `SELECT betId, batteamname, amountOfBat, batStatus 
         FROM tblbattranscation 
         WHERE LOWER(user_name) = LOWER(?)`,
                [user_name]
            );

            console.log(`📗 Bets found for user: ${user_name} =>`, userBetData.length);

            // Create a lookup map (only this user’s bets)
            userBetData.forEach((bet) => {
                const betId = bet.betId?.toString().trim();
                if (!userBets[betId]) {
                    userBets[betId] = {
                        totalAmount: 0,
                        teamName: bet.batteamname,
                        status: bet.batStatus,
                    };
                }
                userBets[betId].totalAmount += Number(bet.amountOfBat) || 0;
            });
        }

        // 3️⃣ Enrich allBets with user-specific info
        const enrichedData = allBets.map((row) => {
            const now = DateTime.utc();
            let betEnd;
            const rawValue = row.betEndTime;

            if (!rawValue) row.isActive = false;
            else if (rawValue instanceof Date)
                betEnd = DateTime.fromJSDate(rawValue, { zone: "utc" });
            else if (typeof rawValue === "string")
                betEnd = rawValue.includes("T")
                    ? DateTime.fromISO(rawValue, { zone: "utc" })
                    : DateTime.fromSQL(rawValue, { zone: "utc" });
            else if (typeof rawValue === "number")
                betEnd = DateTime.fromMillis(rawValue, { zone: "utc" });

            row.isActive = betEnd?.isValid ? now < betEnd : false;
            row.isDelete = !!row.isDelete;

            const betIdKey = row.id?.toString().trim();
            const userBet = userBets[betIdKey];

            if (userBet) {
                console.log(`📗 if Bets found for user: ${user_name} =>`, userBet);
                row.userHasBet = true;
                row.userBetTeam = userBet.teamName;
                row.userBetAmount = userBet.totalAmount;
                row.userBetStatus = userBet.status;
            } else {
                console.log(`📗 else Bets found for user: ${user_name} => `, userBet);
                row.userHasBet = false;
                row.userBetTeam = null;
                row.userBetAmount = null;
                row.userBetStatus = null;
            }

            return row;
        });

        const filteredData = enrichedData.filter(row => {
            let ok = true;
            if (id) ok = ok && row.id == id;
            if (bodyIsActive === "true" || bodyIsActive === "false") {
                const shouldBeActive = bodyIsActive === "true";
                ok = ok && row.isActive === shouldBeActive;
            }
            if (bodyIsDelete === "true" || bodyIsDelete === "false")
                ok = ok && row.isDelete === (bodyIsDelete === "true");
            return ok;
        });


        // 5️⃣ Sort by end time ascending
        filteredData.sort((a, b) => new Date(a.betEndTime) - new Date(b.betEndTime));

        // 6️⃣ Send Response
        return res.status(200).json({
            success: true,
            message: "Fetched bets successfully",
            data: filteredData,
        });
    } catch (error) {
        console.error("❌ Error in getAllBat:", error);
        res.status(500).json({
            success: false,
            message: "Error in Get All Bets API",
            error: error.message,
        });
    }
};

const getAllBatTest = async (req, res) => {
    try {
        const {
            id,
            isActive: bodyIsActive,
            isDelete: bodyIsDelete,
            user_name,
            timezone = "America/New_York" // user timezone
        } = req.body;

        // Ensure DB works in UTC
        await db.query("SET time_zone = '+00:00'");

        const query = `
            SELECT * FROM allbets
            WHERE isDelete = ? AND isActive = ?
        `;

        const params = [bodyIsDelete, bodyIsActive];
        const [rows] = await db.query(query, params);

        // Convert each date column from UTC → User timezone
        const converted = rows.map(row => ({
            ...row,

            // existing
            startTime: row.startTime
                ? moment.utc(row.startTime).tz(timezone).format("YYYY-MM-DD HH:mm:ss")
                : null,

            endTime: row.endTime
                ? moment.utc(row.endTime).tz(timezone).format("YYYY-MM-DD HH:mm:ss")
                : null,

            noBallTime: row.noBallTime
                ? moment.utc(row.noBallTime).tz(timezone).format("YYYY-MM-DD HH:mm:ss")
                : null,

            // new fix
            betStartTime: row.betStartTime
                ? moment.utc(row.betStartTime).tz(timezone).format("YYYY-MM-DD HH:mm:ss")
                : null,

            betEndTime: row.betEndTime
                ? moment.utc(row.betEndTime).tz(timezone).format("YYYY-MM-DD HH:mm:ss")
                : null,
        }));


        return res.json({
            success: true,
            message: "Fetched bets successfully",
            timezone,
            data: converted
        });

    } catch (err) {
        console.error("GetAllBat Error:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getFutureEvents = async (req, res) => {
    try {
        const { timezone = "America/New_York" } = req.body;

        // Fetch future events (UTC comparison)
        const [rows] = await db.query(`
      SELECT *
      FROM events
      WHERE event_time_utc > UTC_TIMESTAMP()
      ORDER BY event_time_utc ASC
    `);

        // Convert UTC → User Timezone
        const data = rows.map(e => ({
            id: e.id,
            title: e.title,
            eventTime: moment
                .utc(e.event_time_utc)
                .tz(timezone)
                .format("YYYY-MM-DD HH:mm:ss")
        }));

        res.json({
            success: true,
            timezone,
            data
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getEventWorldTime = async (req, res) => {
    try {

        const { timezone } = req.body;

        // User display timezone
        // const timezone = req.query.timezone || "America/New_York";

        const [rows] = await db.query(`SELECT * FROM tblevents`);

        const data = rows.map(event => ({
            id: event.id,
            title: event.title,

            // UTC (from DB)
            eventTimeUTC: event.event_time_utc,

            // Converted to user timezone
            eventTimeLocal: moment
                .utc(event.event_time_utc)
                .tz(timezone)
                .format("YYYY-MM-DD HH:mm:ss"),

            timezone
        }));

        res.json({ data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const createEventNew = async (req, res) => {
    try {
        const { title, eventTime, timezone } = req.body;

        if (!title || !eventTime || !timezone) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // Convert user local time → UTC
        const eventTimeUTC = moment
            .tz(eventTime, "YYYY-MM-DD HH:mm:ss", timezone)
            .format("YYYY-MM-DD HH:mm:ss");

        await db.query(
            `INSERT INTO tblevents (title, event_time_utc, created_timezone)
             VALUES (?, ?, ?)`,
            [title, eventTimeUTC, timezone]
        );

        res.status(201).json({
            message: "Event created",
            storedUTC: eventTimeUTC
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}


const createEvent = async (req, res) => {
    try {
        const { title, eventTime, timezone = "America/New_York" } = req.body;

        // Convert user time → UTC
        const utcTime = moment
            .tz(eventTime, timezone)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");

        await db.query(
            `INSERT INTO events (title, event_time_utc)
       VALUES (?, ?)`,
            [title, utcTime]
        );

        res.json({
            success: true,
            message: "Event stored in UTC",
            storedUTC: utcTime
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getAllBat2 = async (req, res) => {
    try {
        const { id, user_name } = req.body;

        // 🌍 User timezone for display
        const timezone = req.headers["x-timezone"] || "America/New_York";

        // 1️⃣ Build SQL query for future bets (UTC-safe)
        let sql = `
      SELECT *
      FROM allbets
      WHERE (isDelete IS NULL OR isDelete = 0)
        AND betEndTime IS NOT NULL
        AND betEndTime > UTC_TIMESTAMP()
    `;
        const params = [];

        if (id) {
            sql += " AND id = ?";
            params.push(id);
        }

        sql += " ORDER BY betEndTime ASC";

        const [rows] = await db.query(sql, params);

        // 2️⃣ Optional: fetch user bets
        const userBets = {};
        if (user_name) {
            const [userBetData] = await db.query(
                `SELECT betId, batteamname, amountOfBat, batStatus
         FROM tblbattranscation
         WHERE LOWER(user_name) = LOWER(?)`,
                [user_name]
            );

            for (const bet of userBetData) {
                const betId = bet.betId?.toString().trim();
                if (!betId) continue;

                if (!userBets[betId]) {
                    userBets[betId] = {
                        totalAmount: 0,
                        teamName: bet.batteamname,
                        status: bet.batStatus
                    };
                }

                userBets[betId].totalAmount += Number(bet.amountOfBat) || 0;
            }
        }

        // 3️⃣ Convert UTC → User timezone safely
        const data = rows.map(row => {
            let betStartUTC, betEndUTC;

            if (row.betStartTime instanceof Date) {
                betStartUTC = DateTime.fromJSDate(row.betStartTime, { zone: "utc" });
            } else {
                betStartUTC = DateTime.fromSQL(row.betStartTime, { zone: "utc" });
            }

            if (row.betEndTime instanceof Date) {
                betEndUTC = DateTime.fromJSDate(row.betEndTime, { zone: "utc" });
            } else {
                betEndUTC = DateTime.fromSQL(row.betEndTime, { zone: "utc" });
            }

            return {
                id: row.id,
                teamAName: row.teamAName,
                teamBName: row.teamBName,
                leagueName: row.leagueName,
                sportType: row.sportType,

                // UTC times (for countdown / logic)
                // ISO string in UTC (Z format, uses T separator)
                betStartTime: row.betStartTime instanceof Date
                    ? row.betStartTime.toISOString()
                    : new Date(row.betStartTime).toISOString(),

                betEndTime: row.betEndTime instanceof Date
                    ? row.betEndTime.toISOString()
                    : new Date(row.betEndTime).toISOString(),



                tossRate: row.tossRate,
                imageUrl: row.imageUrl,

                userHasBet: !!userBets[row.id],
                userBetTeam: userBets[row.id]?.teamName || null,
                userBetAmount: userBets[row.id]?.totalAmount || null,
                userBetStatus: userBets[row.id]?.status || null
            };
        });

        // 4️⃣ Send response
        return res.json({
            success: true,
            timezone,
            currentTimeUTC: DateTime.utc().toISO(),
            data
        });

    } catch (error) {
        console.error("❌ getAllBat:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }

};

const updateBetStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;

        // ❌ Validation
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Bet ID is required"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false"
            });
        }

        // ✅ Update query
        const [result] = await db.query(
            `
            UPDATE allbets
            SET isActive = ?
            WHERE id = ?
              AND (isDelete IS NULL OR isDelete = 0)
            `,
            [isActive ? 1 : 0, id]
        );

        // ❌ No row updated
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Bet not found or already deleted"
            });
        }

        return res.json({
            success: true,
            message: `Bet is now ${isActive ? "ACTIVE" : "INACTIVE"}`,
            data: {
                id,
                isActive
            }
        });

    } catch (error) {
        console.error("❌ updateBetStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};




const getAllBat = async (req, res) => {
    try {
        const { id, user_name, isActive, userZone } = req.body;

        const timezone = userZone || "Asia/Kolkata";

        // 1️⃣ Get all active bets
        let sql = `
      SELECT *
      FROM allbets
      WHERE (isDelete IS NULL OR isDelete = 0)
        AND betEndTime IS NOT NULL
        AND betEndTime > UTC_TIMESTAMP()
    `;
        const params = [];

        if (id) {
            sql += " AND id = ?";
            params.push(id);
        }

        if (typeof isActive === "boolean") {
            sql += " AND isActive = ?";
            params.push(isActive ? 1 : 0);
        }

        sql += " ORDER BY betEndTime ASC";

        const [rows] = await db.query(sql, params);

        // 2️⃣ Build user pending bets map
        const userBets = {};

        if (user_name) {
            const [bets] = await db.query(
                `
        SELECT betId, batteamname, amountOfBat, batStatus, leagueName
        FROM tblbattranscation
        WHERE LOWER(user_name) = LOWER(?)
          AND batStatus = 'pending'
        `,
                [user_name]
            );

            for (const b of bets) {
                const betId = b.betId?.toString();
                if (!betId) continue;

                // ✅ init once
                if (!userBets[betId]) {
                    userBets[betId] = {
                        totalAmount: 0,
                        teamName: b.batteamname,
                        leagueName: b.leagueName,
                        status: "pending"
                    };
                }

                // ✅ add amount correctly
                userBets[betId].totalAmount += Number(b.amountOfBat || 0);
            }
        }

        // 3️⃣ Map response
        const data = rows.map(row => {
            const rowId = row.id.toString(); // 🔥 FIX

            const betStartUTC = DateTime.fromJSDate(row.betStartTime, { zone: "utc" });
            const betEndUTC = DateTime.fromJSDate(row.betEndTime, { zone: "utc" });

            return {
                id: row.id,
                teamAName: row.teamAName,
                teamBName: row.teamBName,
                leagueName: row.leagueName,
                sportType: row.sportType,
                isActive: !!row.isActive,

                betStartTimeUTC: betStartUTC.toISO(),
                betEndTimeUTC: betEndUTC.toISO(),

                betStartTime: betStartUTC
                    .setZone(timezone)
                    .toFormat("yyyy-MM-dd HH:mm:ss"),
                betEndTime: betEndUTC
                    .setZone(timezone)
                    .toFormat("yyyy-MM-dd HH:mm:ss"),

                tossRate: row.tossRate,
                imageUrl: row.imageUrl,

                // ✅ ONLY PENDING BET DATA
                userHasBet: !!userBets[rowId],
                userBetTeam: userBets[rowId]?.teamName || null,
                userBetAmount: userBets[rowId]?.totalAmount || null,
                userBetStatus: userBets[rowId]?.status || null
            };
        });

        return res.json({
            success: true,
            timezone,
            serverTimeUTC: DateTime.utc().toISO(),
            data
        });

    } catch (err) {
        console.error("❌ getAllBat error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
};

export default getAllBat;

const getEvent = async (req, res) => {
    try {
        const { id, user_name } = req.body;

        // 1️⃣ User timezone (default to America/New_York)
        const timezone = req.headers["x-timezone"] || "America/New_York";

        // 2️⃣ Fetch ONLY FUTURE bets
        let sql = `
      SELECT *
      FROM allbets
      WHERE betEndTime > UTC_TIMESTAMP()
        AND (isDelete IS NULL OR isDelete = 0)
    `;
        const params = [];

        if (id) {
            sql += " AND id = ?";
            params.push(id);
        }

        sql += " ORDER BY betEndTime ASC";

        const [allBets] = await db.query(sql, params);

        if (!allBets.length) {
            return res.status(200).json({
                success: true,
                message: "No future bets found",
                timezone,
                data: []
            });
        }

        // 3️⃣ Fetch user bets (if user_name provided)
        const userBets = {};
        if (user_name) {
            const [userBetData] = await db.query(
                `SELECT betId, batteamname, amountOfBat, batStatus
         FROM tblbattranscation
         WHERE LOWER(user_name) = LOWER(?)`,
                [user_name]
            );

            userBetData.forEach(bet => {
                const betId = bet.betId?.toString().trim();
                if (!userBets[betId]) {
                    userBets[betId] = {
                        totalAmount: 0,
                        teamName: bet.batteamname,
                        status: bet.batStatus
                    };
                }
                userBets[betId].totalAmount += Number(bet.amountOfBat) || 0;
            });
        }

        // 4️⃣ Enrich bets with user info & timezone conversion
        const data = allBets.map(row => {
            const betEndUTC = DateTime.fromJSDate(row.betEndTime, { zone: "utc" });

            return {
                id: row.id,
                teamAName: row.teamAName,
                teamBName: row.teamBName,
                leagueName: row.leagueName,
                sportType: row.sportType,
                isActive: true, // guaranteed future
                betEndTimeUTC: betEndUTC.toISO(),
                betEndTimeLocal: betEndUTC.setZone(timezone).toFormat("yyyy-MM-dd HH:mm:ss"),

                userHasBet: !!userBets[row.id],
                userBetTeam: userBets[row.id]?.teamName || null,
                userBetAmount: userBets[row.id]?.totalAmount || null,
                userBetStatus: userBets[row.id]?.status || null
            };
        });

        // 5️⃣ Response
        return res.status(200).json({
            success: true,
            message: "Future bets fetched successfully",
            timezone,
            currentTimeUTC: DateTime.utc().toISO(),
            data
        });

    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error in Get All Bets API",
            error: error.message
        });
    }
}

const addEvent = async (req, res) => {
    try {
        const { title, eventTime } = req.body;

        if (!title || !eventTime) {
            return res.status(400).json({ success: false, message: 'Title and eventTime are required' });
        }

        // Convert to UTC
        const utcTime = moment(eventTime).utc().format('YYYY-MM-DD HH:mm:ss');

        await db.query(
            'INSERT INTO tblinsertdatetime (title, event_time) VALUES (?, ?)',
            [title, utcTime]
        );

        res.json({ success: true, message: 'Event stored in UTC', utcTime });
    } catch (err) {
        console.error("DB ERROR:", err);  // <--- log full error
        res.status(500).json({ success: false, message: 'Error storing event', error: err.message });
    }
}

const createAllBets = async (req, res) => {
    try {
        const { teamAName, teamBName, leagueName, sportType, betEndTime, tossRate } = req.body

        if (!teamAName) {
            return res.status(500).send({
                success: false,
                message: 'Please enter team A name'
            })
        } else if (!teamBName) {
            return res.status(500).send({
                success: false,
                message: 'Please enter team B name'
            })
        } else if (!leagueName) {
            return res.status(500).send({
                success: false,
                message: 'Please enter leangue name'
            })
        } else if (!sportType) {
            return res.status(500).send({
                success: false,
                message: 'Please enter sportType'
            })
        } else if (!betEndTime) {
            return res.status(500).send({
                success: false,
                message: 'Please end time'
            })
        } else if (!tossRate) {
            return res.status(500).send({
                success: false,
                message: 'Please enter toss rate'
            })
        }



        const newId = new ObjectId().toString(); // "68f3c188b6ecebf82de1e767"


        // ----------- Convert times to UTC ------------
        // Bet start time (now) in IST → convert to UTC
        const betStartTimeUTC = DateTime.now()
            .setZone("America/New_York")
            .toUTC()
            .toFormat("yyyy-MM-dd HH:mm:ss");

        // Bet end time from frontend (IST) → convert to UTC
        const betEndTimeUTC = DateTime.fromFormat(betEndTime, "yyyy-MM-dd HH:mm:ss", { zone: "America/New_York" })
            .toUTC()
            .toFormat("yyyy-MM-dd HH:mm:ss");

        // ----------- Check if bet is active (current IST time <= betEndTime) ------------
        const nowIST = DateTime.now().setZone("America/New_York");
        const betEndIST = DateTime.fromFormat(betEndTime, "yyyy-MM-dd HH:mm:ss", { zone: "America/New_York" });
        const isActive = nowIST <= betEndIST ? 1 : 0;




        const data = await db.query(
            `INSERT INTO allbets ( id, teamAName, teamBName, leagueName, sportType , betStartTime, betEndTime, tossRate, imageUrl, hasBet, betTeamName, betAmount, isActive, isDelete)  VALUES
             (?, ?, ?, ?, ?, ?,?, ?, ?,?, ?,?, ?,?)`,
            [newId, teamAName, teamBName, leagueName, sportType, betStartTime, betEndTimeNew, tossRate, null, false, null, null, isActive, 0])

        if (!data) {
            return res.status(404).send({
                success: false,
                message: 'Error in insert query'
            })
        }

        res.status(202).send({
            success: true,
            message: 'Successfully Inserted Current Bet'
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create bet API',
            error
        })
    }
}
// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/allbetimages/");
    },
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/\s+/g, "_");
        cb(null, Date.now() + "-" + cleanName);
    },
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "upload/allbetimages"));
//   },
//   filename: (req, file, cb) => {
//     const cleanName = file.originalname.replace(/\s+/g, "_");
//     cb(null, Date.now() + "-" + cleanName);
//   },
// });

// Only image files allowed
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files allowed!"), false);
    }
};

// Initialize multer middleware
const upload = multer({ storage, fileFilter });




const createAllBetsWithImage = async (req, res) => {


    try {
        const {
            teamAName,
            teamBName,
            leagueName,
            sportType,
            betEndTime,   // "2026-01-03 21:55:00"
            tossRate,
            userZone     // "Asia/Kolkata"
        } = req.body;

        if (!teamAName || !teamBName || !leagueName || !sportType || !betEndTime || !tossRate) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 🌍 User timezone (India default)
        const zone = userZone || "Asia/Kolkata";


        const formats = [
            "YYYY-MM-DD HH:mm:ss",
            "YYYY-MM-DDTHH:mm:ss",
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
        ];

        const betEndUser = moment.tz(betEndTime, formats, zone);



        // 1️⃣ Parse user input time in user's timezone
        // const betEndUser = moment
        //   .tz(betEndTime, "YYYY-MM-DD HH:mm:ss", zone)
        //   .utc()
        //   .format("YYYY-MM-DD HH:mm:ss");

        if (!betEndUser.isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD HH:mm:ss"
            });
        }

        // 2️⃣ Convert to UTC
        const betEndUTC = betEndUser.utc().format("YYYY-MM-DD HH:mm:ss");
        const betStartUTC = DateTime.utc().toSQL({ includeOffset: false });





        // 🖼 Image upload
        let imageUrl = null;
        if (req.file) {

            const cleanName = req.file.filename.replace(/\s+/g, "_");

            console.log("req.file.filename", req.file.filename);
            console.log("req.file.filename cleanName ", cleanName);

            imageUrl = `${cleanName}`;
        }

        const newId = new ObjectId().toString();

        // 3️⃣ Insert into allbets (UTC ONLY)
        await db.query(
            `INSERT INTO allbets
       (id, teamAName, teamBName, leagueName, sportType,
        betStartTime, betEndTime, tossRate, imageUrl,
        hasBet, betTeamName, betAmount, isActive, isDelete)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId,
                teamAName,
                teamBName,
                leagueName,
                sportType,
                betStartUTC,
                betEndUTC,
                tossRate,
                imageUrl,
                0,
                null,
                0,
                1,
                0
            ]
        );

        // 4️⃣ Tracking table
        const mergedTeamName = `${teamAName} VS ${teamBName}`;
        await db.query(
            `INSERT INTO tblallbetgetid
       (id, DateTime, Status, leagueName, teamAandteamB)
       VALUES (?, ?, ?, ?, ?)`,
            [
                newId,
                betStartUTC,
                "pending",
                leagueName,
                mergedTeamName
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Bet created successfully",
            id: newId,
            imageUrl: imageUrl ? `http://localhost:8080${imageUrl}` : null
        });

    } catch (error) {
        console.error("❌ createAllBetsWithImage:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating bet",
            error: error.message
        });
    }

};



const createAllBetsWithImageUpdateStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;

        if (!id || isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: "id and isActive are required",
            });
        }

        // SQL Update
        const [result] = await db.query(
            "UPDATE allbets SET isActive = ? WHERE id = ?",
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "No record found with given id",
            });
        }

        return res.json({
            success: true,
            message: "Status updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

const createTwoTeamMatch = async (req, res) => {
    try {
        const { Team1, Team2, MatchVenue, Matchwinnertatus, matchimage } = req.body
        if (!Team1) {
            return res.status(500).send({
                success: false,
                message: 'Please enter team 1 name'
            })
        } else if (!Team2) {
            return res.status(500).send({
                success: false,
                message: 'Please enter team 2 name'
            })
        } else if (!MatchVenue) {
            return res.status(500).send({
                success: false,
                message: 'Please enter match venue'
            })
        }




        const winnerValue = (Matchwinnertatus === '' || Matchwinnertatus === undefined || Matchwinnertatus === null)
            ? null
            : Matchwinnertatus;

        let imageFile = null;
        if (req.file) {
            imageFile = req.file.filename; // store filename in DB
        }

        const data = await db.query(
            `INSERT INTO tblcreatetwoteam ( team1, team2, matchvenue, matchwinnertatus , matchimage)  VALUES (?, ?, ?, ?, ?)`,
            [Team1, Team2, MatchVenue, winnerValue, matchimage])
        if (!data) {
            return res.status(404).send({
                success: false,
                message: 'Error in insert query'
            })
        }
        res.set('Cache-Control', 'no-store');
        res.status(202).send({
            success: true,
            message: 'Successfully Inserted.'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in create Match team API',
            error
        })
    }
}



function getIndianDateTime() {
    const now = new Date();

    // Convert to India time zone
    const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    // Format: YYYY-MM-DD HH:mm:ss
    const year = indiaTime.getFullYear();
    const month = String(indiaTime.getMonth() + 1).padStart(2, '0');
    const day = String(indiaTime.getDate()).padStart(2, '0');
    const hours = String(indiaTime.getHours()).padStart(2, '0');
    const minutes = String(indiaTime.getMinutes()).padStart(2, '0');
    const seconds = String(indiaTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export {
    upload, createUser, loginType, createTwoTeamMatch, createAllBets, getAllUser,
    insert_CoinInWallet, placebet, winningStatsuUpdate, getAllBat, login, GetWallet,
    createAllBetsWithImage, getBetTransaction, WithdrawalMoney, GetMatchcompletedstatus,
    getAllbetgetid, createAllBetsWithImageUpdateStatus, getAllBatTest, addEvent, getEvent,
    createEvent, getFutureEvents, createEventNew, getEventWorldTime, getAllBat2, updateBetStatus, closeBetTransaction, getloginType
}