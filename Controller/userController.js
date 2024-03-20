const db = require('../dbconfig/db_Setting');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: 'rahulsoni7982@gmail.com',
        pass: 'nyal xviw gtzd hsjr'
    }
});

const sendOTPByEmail = async (req, email, otp) => {
    try {
        // Assuming req.session is properly configured
        req.session.email = email;
        req.session.otp = otp;
        console.log(req.session)
        
        const mailOptions = {
            from: 'rahulsoni7982@gmail.com',
            to: email,
            subject: 'Your OTP for verification',
            text: `Your OTP (One-Time Password) for verification is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email or storing OTP:', error);
        throw error;
    }
};

const generateOTP = () => {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000);
};

const otpSend = async (req, res) => {
    const { email } = req.body;
    
    try {
        

        const otp = generateOTP();
        await sendOTPByEmail(req, email, otp);
        
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// verify otp
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const email = req.session.email;
        const sessionOTP = req.session.otp;

        console.log(email, sessionOTP, otp);

        if (!email || !sessionOTP) {
            return res.status(401).json({ error: 'Email or OTP not found in session' });
        }

        if (otp != sessionOTP) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        // If OTP is verified successfully, update the status in the database
        await db.insert('tblusers', { email, status: '1' });
        req.session.destroy();
        res.status(200).json({ message: 'OTP verification successful' });
    } catch (error) {
        console.error("Error verifying OTP and updating status:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// create user controller
const CreateUser = async (req, res) => {
    try {
        const tbl_name = 'tblusers';
        const { username, email, password, confirmPassword } = req.body;

        // Check if all fields are provided
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if the email already exists in the database
        const existingUser = await db.selectAll(tbl_name, '*', `email = '${email}'`);

        // If email exists, update the user data
        if (existingUser.length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.update(tbl_name, { username, password: hashedPassword }, `email = '${email}'`);

            if (result.status) {
                return res.status(200).json({
                    status: result.status,
                    affected_rows: result.affected_rows,
                    info: result.info,
                    message: "Data updated successfully"
                });
            } else {
                throw new Error("Failed to update data");
            }
        } else {
            return res.status(400).json({ message: 'User with this email does not exist / please verify your email first' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update data" });
    }
}
const getAllUser = async (req, res) => {
    try {
        const tbl_name = 'tblusers';
        const data = await db.selectAll(tbl_name, '*', '', '', true);
        res.status(200).json({
            message: "Data fetched successfully",
            data: data // Corrected this line to use the fetched data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch data"
        });
    }
}
const loginUser = async (req, res) => {
    const tbl_name = 'tblusers';
    const { email, password } = req.body;
    try {
        
        const userFound = await db.select(tbl_name, '*', `email = '${email}'`, true);

        if (!userFound) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        bcrypt.compare(password, userFound.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            } else if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: userFound.id, email: userFound.email }, '122324322',{ expiresIn: '1d'});

            // Send the token back to the client
            res.json({ message:"login successfully",token });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const SingleUser=async(req,res)=>{
   

}


module.exports={CreateUser,getAllUser,loginUser,SingleUser,otpSend,verifyOtp};
