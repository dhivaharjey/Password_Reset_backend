export const generateOTP = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    const value = Math.round(Math.random() * 9);
    otp += value;
  }
  return otp;
};
