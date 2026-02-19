const forgotPasswordTemplate = (otp) => `
<body style="margin:0; padding:0; background:#ffffff; font-family: Arial, sans-serif; color:#000;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:500px; border:4px solid #000; box-shadow:12px 12px 0 #000;">
          
          <tr>
            <td style="padding:24px; background:#ff6b6b; border-bottom:4px solid #000;">
              <h1 style="margin:0; font-weight:800;">CAMPUS EVENT HUB</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px; font-weight:800;">RESET PASSWORD</h2>
              <p>Use the OTP below to reset your password.</p>

              <div style="margin:24px 0; padding:24px; border:4px solid #000; background:#ffd6d6; text-align:center;">
                <div style="font-size:42px; font-weight:900; letter-spacing:8px;">
                  ${otp}
                </div>
              </div>

              <p style="font-size:13px;"><b>Expires in 10 minutes</b></p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px; border-top:4px solid #000; font-size:12px;">
              If you didn’t request this, ignore this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
`;

module.exports = forgotPasswordTemplate;
