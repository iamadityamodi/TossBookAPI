import db from "../config/db.js";
import multer from "multer";
import path from "path";
import { DateTime } from "luxon";
import { ObjectId } from "bson";





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
    try {
        const { betId, winnerTeam } = req.body;

        if (!betId) {
            return res.status(400).send({ success: false, message: 'Please select winning team' });
        }

        const [totalBetData] = await db.query(
            "SELECT SUM(amountOfBat) AS totalBetAmount FROM tblbattranscation WHERE betId = ?",
            [betId]
        );

        const totalBetAmount = totalBetData[0].totalBetAmount || 0;


        // 🟡 CASE 1: MATCH CANCELLED
        if (winnerTeam.toLowerCase() === "cancel" || winnerTeam.toLowerCase() === "canceled") {
            // 1. Reset all batStatus to 'cancelled'
            await db.query(
                "UPDATE tblbattranscation SET batStatus = 'cancelled' WHERE betId = ?",
                [betId]
            );

            // 2. Refund all users their original bet amount (only coin refund)
            const [allBets] = await db.query(
                "SELECT user_name, amountOfBat FROM tblbattranscation WHERE betId = ?",
                [betId]
            );


            let totalRefund = 0;

            for (const bet of allBets) {
                const userName = bet.user_name.trim();
                const amountOfBat = parseFloat(bet.amountOfBat);
                totalRefund += amountOfBat;

                const [rows] = await db.query(
                    "SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?",
                    [userName]
                );

                if (rows.length > 0) {
                    const user = rows[0];
                    const updatedBalance = parseFloat(user.tblWalletcol) + amountOfBat;
                    const updatedExposure = parseFloat(user.exposure) - amountOfBat;

                    await db.query(
                        "UPDATE tblwallet SET tblWalletcol = ?, exposure = ? WHERE user_name = ?",
                        [updatedBalance, updatedExposure, userName]
                    );
                } else {
                    await db.query(
                        "INSERT INTO tblwallet (user_name, tblWalletcol, exposure) VALUES (?, ?, ?)",
                        [userName, amountOfBat, 0]
                    );
                }
            }

            return res.status(200).send({
                success: true,
                message: "Match cancelled — all bets refunded.",
                totalRefunded: totalRefund,
                totalUsers: allBets.length
            });
        }

        if (!winnerTeam) {
            return res.status(400).send({ success: false, message: 'Please select winning status' });
        }

        // 1. Update winners
        await db.query(
            "UPDATE tblbattranscation SET batStatus = 'win' WHERE betId = ? AND batteamname = ?",
            [betId, winnerTeam]
        );

        // 2. Update losers
        await db.query(
            "UPDATE tblbattranscation SET batStatus = 'loss' WHERE betId = ? AND batteamname != ?",
            [betId, winnerTeam]
        );

        // 3. Get winners & losers
        const [winners] = await db.query(
            "SELECT user_name, amountOfBat FROM tblbattranscation WHERE betId = ? AND batteamname = ?",
            [betId, winnerTeam]
        );

        const [losers] = await db.query(
            "SELECT user_name, amountOfBat FROM tblbattranscation WHERE betId = ? AND batteamname != ?",
            [betId, winnerTeam]
        );

        let totalWinners = 0;
        let totalAmount = 0;

        // 4. Loop winners & update wallet
        for (const winner of winners) {
            const userName = winner.user_name.trim();
            const amountOfBat = parseFloat(winner.amountOfBat);

            const [tossRate1] = await db.query(
                "SELECT tossRate FROM tblbattranscation WHERE betId = ?",
                [betId]
            );

            if (tossRate1.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No toss Rate found for this bet of ID"
                });
            }

            const rate = parseFloat(tossRate1[0].tossRate); // example: 95, 97, 100

            const winningAmount = amountOfBat + (amountOfBat * (rate / 100));
            totalWinners++;
            totalAmount += winningAmount;

            // Check if wallet exists
            const [rows] = await db.query(
                "SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?",
                [userName]
            );

            if (rows.length > 0) {
                const user = rows[0];
                const updatedBalance = parseFloat(user.tblWalletcol) + winningAmount;
                const updatedExposure = parseFloat(user.exposure) - amountOfBat;

                await db.query(
                    "UPDATE tblwallet SET tblWalletcol = ?, exposure = ? WHERE user_name = ?",
                    [updatedBalance, updatedExposure, userName]
                );
            } else {
                await db.query(
                    "INSERT INTO tblwallet (user_name, tblWalletcol, exposure) VALUES (?, ?, ?)",
                    [userName, winningAmount, 0]
                );
            }
        }

        // 5. Loop losers & reduce exposure
        for (const loser of losers) {
            const userName = loser.user_name.trim();
            const amountOfBat = parseFloat(loser.amountOfBat);

            // Only reduce exposure; no wallet balance increase
            const [rows] = await db.query(
                "SELECT tblWalletcol, exposure FROM tblwallet WHERE user_name = ?",
                [userName]
            );

            if (rows.length > 0) {
                const user = rows[0];
                const updatedExposure = parseFloat(user.exposure) - amountOfBat;

                await db.query(
                    "UPDATE tblwallet SET exposure = ? WHERE user_name = ?",
                    [updatedExposure, userName]
                );
            } else {
                // Insert new wallet record with exposure negative if user doesn't exist
                await db.query(
                    "INSERT INTO tblwallet (user_name, tblWalletcol, exposure) VALUES (?, ?, ?)",
                    [userName, 0, -amountOfBat]
                );
            }
        }

        // ⭐ FINAL: UPDATE tblallbetgetid status to "completed"
        await db.query(
            "UPDATE tblallbetgetid SET Status = 'completed' WHERE id = ?",
            [betId]
        );

        // 1. Get selected columns from tblmatch
        const [rows] = await db.query(
            `SELECT id, teamAname, teamBname, leagueName 
             FROM allbets 
             WHERE id = ?`,
            [betId]
        );

        if (rows.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Matches not found"
            });
        }

        const matchData = rows[0];
        const newId = new ObjectId().toString(); // "68f3c188b6ecebf82de1e767"

        // 2. Insert into another table tbldemo
        await db.query(
            `INSERT INTO tblallmatchprofitloss (id, matchId, totalBetAmount, totalWinningAmount, totalwinners, totallosers, teamAname, teamBname, leagueName)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newId,
                matchData.id,
                totalBetAmount,
                totalAmount,
                totalWinners,
                losers.length,
                matchData.teamAname,
                matchData.teamBname,
                matchData.leagueName
            ]
        );



        return res.status(200).send({
            success: true,
            message: "Match result updated & winnings/loss exposure applied",
            winners: totalWinners,
            totalBetAmount: totalBetAmount,
            totalWinningAmount: totalAmount,
            losers: losers.length
        });

    } catch (error) {
        console.error("Error in winningStatsuUpdate:", error);
        return res.status(500).send({
            success: false,
            message: 'Error updating winning status',
            error: error.message
        });
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

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
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
            `SELECT leagueName, teamAName, teamBName, tossRate, betEndTime  FROM allbets WHERE id = ?`,
            [betId]
        );

        if (betData.length === 0) {
            return res.status(404).json({ success: false, message: "Bet not found" });
        }

        const { leagueName, teamAName, teamBName, tossRate, betEndTime } = betData[0];

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

        console.log("updatedBalance", updatedBalance)
        console.log("updatedExposure", updatedExposure)

        await db.query(
            `UPDATE tblwallet SET tblWalletcol = ?, exposure = ? WHERE user_name = ?`,
            [updatedBalance, updatedExposure, userName]
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
            message: 'Error in add coin API',
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
            `UPDATE tblWallet 
     SET tblWalletcol = tblWalletcol + ?, totalamount = totalamount + ? 
     WHERE user_id = ?`,
            [coins, coins, user_id]
        );


        // 2️⃣ If no rows updated -> insert new row
        if (result.affectedRows === 0) {

            console.log("No existing wallet found → inserting new row");

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
            message: "Coins added successfully",
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
        const { fullname, user_name, password, address, mobile_no, ages, gender, country } = req.body
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
        }

        // 0️⃣ Check if username already exists
        const [existingUser] = await db.query(
            "SELECT user_id FROM tblregistration WHERE user_name = ?",
            [user_name]
        );

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
        const indiaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        // Format for MySQL
        const formattedDate = getIndianDateTime();

        const [data] = await db.query(
            `INSERT INTO tblregistration ( fullname , user_name, password, address, mobile_no, ages, gender, country, createdate )  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullname, user_name, password, address, mobile_no, ageValue, gender, country, formattedDate])

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

const getNewBet = async (req, res) => {
    try {
        const { userTimeZone } = req.body;
        const zone = userTimeZone || "Asia/Kolkata";

        const [rows] = await db.query("SELECT betEndTimeUTC FROM tblnewbets");

        const final = rows.map(row => {
            const value = row.betEndTimeUTC; // "2025-12-02 17:35:00"

            const dt = DateTime.fromSQL(value, { zone: "utc" });

            const local = dt.setZone(zone).toFormat("yyyy-MM-dd hh:mm a");

            return {
                betEndTimeUTC: value,
                betEndTimeLocal: local
            };
        });

        res.json({ success: true, data: final });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

const createNewBet = async (req, res) => {
    try {

        const { betEndTimeLocal } = req.body;
        const userZone = "Asia/Kolkata";


        const newId = new ObjectId().toString();

        // Example: "2025-12-02 11:05 PM"
        const userTime = DateTime.fromFormat(
            betEndTimeLocal,
            "yyyy-MM-dd hh:mm a",
            { zone: userZone }
        );

        if (!userTime.isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid date",
                detail: userTime.invalidExplanation
            });
        }

        // Convert → UTC → MySQL
        const mysqlUTC = userTime.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");

        await db.query(
            "INSERT INTO tblnewbets (id, betEndTimeUTC) VALUES (?, ?)",
            [newId, mysqlUTC]
        );

        res.json({ success: true, storedUTC: mysqlUTC });

        // const { betEndTimeLocal, userTimeZone } = req.body;

        // // Example:
        // // betEndTimeLocal = "2025-12-02 04:05 PM"
        // // userTimeZone = "Asia/Kolkata"

        // const newId = new ObjectId().toString();

        // const dt = DateTime.fromFormat(
        //     betEndTimeLocal,
        //     "yyyy-MM-dd hh:mm a",
        //     { zone: userTimeZone }
        // );

        // if (!dt.isValid) {
        //     console.log(dt.invalidExplanation);
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid datetime format",
        //         detail: dt.invalidExplanation
        //     });
        // }

        // // Convert to UTC MySQL DATETIME
        // const mysqlUTC = dt.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
        // await db.query(
        //     "INSERT INTO tblnewbets (id, betEndTimeUTC) VALUES (?, ?)",
        //     [newId, mysqlUTC]
        // );

        // res.json({ success: true, stored: mysqlUTC });
    } catch (err) {
        console.log("Error:", err);
        return res.status(500).json({ success: false, message: err.message, error: err });
    }
};




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

        // 4️⃣ Optional filtering
        const filteredData = enrichedData.filter((row) => {
            let match = true;
            if (id) match = match && row.id == id;
            if (bodyIsActive === "true" || bodyIsActive === "false")
                match = match && row.isActive === (bodyIsActive === "true");
            if (bodyIsDelete === "true" || bodyIsDelete === "false")
                match = match && row.isDelete === (bodyIsDelete === "true");
            return match;
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

const getAllBat = async (req, res) => {
    try {
        const { id, isActive: bodyIsActive, isDelete: bodyIsDelete, user_name } = req.body;

        console.log("🟩 Incoming Request:", { user_name });

        // 1️⃣ Fetch all bets
        const [allBets] = await db.query("SELECT * FROM allbets");
        if (!allBets || allBets.length === 0) {
            return res.status(404).json({ success: false, message: "No bets found" });
        }

        // 2️⃣ Fetch logged-in user's bet transactions
        let userBets = {};
        if (user_name) {
            const [userBetData] = await db.query(
                `SELECT betId, batteamname, amountOfBat, batStatus 
                 FROM tblbattranscation 
                 WHERE LOWER(user_name) = LOWER(?)`,
                [user_name]
            );

            console.log(`📗 User bets found: ${userBetData.length}`);

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

        // 3️⃣ Enrich all bets with user-specific & time-specific info
        const enrichedData = allBets.map((row) => {
            const nowUTC = DateTime.utc();
            let betEndUTC;

            // Normalize DB value (supports SQL, ISO, JS Date, Milliseconds)
            const raw = row.betEndTime;

            if (!raw) {
                row.isActive = false;
            } else if (raw instanceof Date) {
                betEndUTC = DateTime.fromJSDate(raw, { zone: "utc" });
            } else if (typeof raw === "string") {
                betEndUTC = raw.includes("T")
                    ? DateTime.fromISO(raw, { zone: "utc" })
                    : DateTime.fromSQL(raw, { zone: "utc" });
            } else if (typeof raw === "number") {
                betEndUTC = DateTime.fromMillis(raw, { zone: "utc" });
            }

            // Validate & determine isActive
            row.isActive = betEndUTC?.isValid ? nowUTC < betEndUTC : false;
            row.isDelete = !!row.isDelete;

            // Attach user bet details
            const betIdKey = row.id?.toString().trim();
            const userBet = userBets[betIdKey];

            if (userBet) {
                row.userHasBet = true;
                row.userBetTeam = userBet.teamName;
                row.userBetAmount = userBet.totalAmount;
                row.userBetStatus = userBet.status;
            } else {
                row.userHasBet = false;
                row.userBetTeam = null;
                row.userBetAmount = null;
                row.userBetStatus = null;
            }

            return row;
        });

        // 4️⃣ Apply optional filters
        const filteredData = enrichedData.filter((row) => {
            let ok = true;

            if (id) ok = ok && row.id == id;
            if (bodyIsActive === "true" || bodyIsActive === "false")
                ok = ok && row.isActive === (bodyIsActive === "true");
            if (bodyIsDelete === "true" || bodyIsDelete === "false")
                ok = ok && row.isDelete === (bodyIsDelete === "true");

            return ok;
        });

        // 5️⃣ Sort by bet end time (soonest first)
        filteredData.sort((a, b) => new Date(a.betEndTime) - new Date(b.betEndTime));

        // 6️⃣ Send result
        return res.status(200).json({
            success: true,
            message: "Fetched bets successfully",
            data: filteredData,
        });

    } catch (error) {
        console.error("❌ Error in getAllBat:", error);
        return res.status(500).json({
            success: false,
            message: "Error in Get All Bets API",
            error: error.message,
        });
    }
};

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
            .setZone("Asia/Kolkata")
            .toUTC()
            .toFormat("yyyy-MM-dd HH:mm:ss");

        // Bet end time from frontend (IST) → convert to UTC
        const betEndTimeUTC = DateTime.fromFormat(betEndTime, "yyyy-MM-dd HH:mm:ss", { zone: "Asia/Kolkata" })
            .toUTC()
            .toFormat("yyyy-MM-dd HH:mm:ss");

        // ----------- Check if bet is active (current IST time <= betEndTime) ------------
        const nowIST = DateTime.now().setZone("Asia/Kolkata");
        const betEndIST = DateTime.fromFormat(betEndTime, "yyyy-MM-dd HH:mm:ss", { zone: "Asia/Kolkata" });
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
        cb(null, Date.now() + "-" + file.originalname);
    },
});

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
        // ✅ multer parsed both file + text fields
        const { teamAName, teamBName, leagueName, sportType, betEndTime, tossRate } = req.body;

        if (!teamAName || !teamBName || !leagueName || !sportType || !betEndTime || !tossRate) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newId = new ObjectId().toString();

        const formatDateForMySQL = (date) => {
            const d = new Date(date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const hh = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            const ss = String(d.getSeconds()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        };

        const dt = DateTime.fromFormat(betEndTime, "yyyy-MM-dd HH:mm:ss", { zone: "Asia/Kolkata" });
        const betStartTime = DateTime.now().setZone("Asia/Kolkata").toFormat("yyyy-MM-dd HH:mm:ss");
        const betEndTimeNew = formatDateForMySQL(betEndTime);
        console.log("betEndTimeNew", betEndTimeNew);

        const now = DateTime.now().setZone("Asia/Kolkata");
        const isActive = now <= dt ? 1 : 0;

        let imageUrl = null;
        if (req.file) {
            imageUrl = `/upload/allbetimages/${req.file.filename}`;
        }

        await db.query(
            `INSERT INTO allbets (id, teamAName, teamBName, leagueName, sportType, betStartTime, betEndTime, tossRate, imageUrl, hasBet, betTeamName, betAmount, isActive, isDelete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, teamAName, teamBName, leagueName, sportType, betStartTime, betEndTimeNew, tossRate, imageUrl, false, null, null, isActive, 0]
        );

        // ⭐ NEW INSERT INTO tblallbetgetid ⭐
        const currentTime = DateTime.now().setZone("Asia/Kolkata").toFormat("yyyy-MM-dd HH:mm:ss");
        const mergedTeamName = `${teamAName} VS ${teamBName}`;


        await db.query(
            `INSERT INTO tblallbetgetid (id, DateTime, Status, leagueName, teamAandteamB) VALUES (?, ?, ?, ?, ?)`,
            [newId, currentTime, "pending", leagueName, mergedTeamName]
        );


        res.status(201).json({
            success: true,
            message: "Successfully inserted current bet",
            id: newId,
            fullUrl: `http://localhost:8080${imageUrl}`

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating bet with image",
            error: error.message,
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
    const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

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
    getAllbetgetid, createAllBetsWithImageUpdateStatus, createNewBet, getNewBet
}