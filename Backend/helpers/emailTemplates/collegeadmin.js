const sendAdminCreationEmail = (Adminname, CollegeName, AdminEmail, Password, LoginURL) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Infy Event Hub - Admin Account Created</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:30px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h1 style="margin:0;color:#111;font-size:26px;">Infy Event Hub</h1>
              <p style="margin:5px 0;color:#666;font-size:14px;">College Event Management Platform</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="color:#333;font-size:15px;line-height:1.6;">
              Hello <strong>${AdminName}</strong>,
              <br /><br />
              Your administrator account for <strong>${CollegeName}</strong> has been successfully created on <strong>Infy Event Hub</strong>.
            </td>
          </tr>

          <!-- Account Details -->
          <tr>
            <td style="padding-top:20px;">
              <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">
                <tr style="background:#fafafa;">
                  <td style="font-weight:bold;">Application</td>
                  <td>Infy Event Hub</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;">Role</td>
                  <td>College Admin</td>
                </tr>
                <tr style="background:#fafafa;">
                  <td style="font-weight:bold;">Email</td>
                  <td>${AdminEmail}</td>
                </tr>
                <tr>
                  <td style="font-weight:bold;">Temporary Password</td>
                  <td>${Password}$</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Login Button -->
          <tr>
            <td align="center" style="padding:30px 0;">
              <a href="${LoginURL}$" 
                 style="background:#000;color:#fff;text-decoration:none;padding:12px 25px;border-radius:6px;font-size:14px;font-weight:bold;">
                Login to Infy Event Hub
              </a>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="font-size:14px;color:#555;line-height:1.6;">
              For security reasons, please <strong>change your password immediately after logging in</strong>.
              <br /><br />
              Once logged in, you can begin managing events, clubs, and participants for your institution.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:30px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;">
              © 2026 Infy Event Hub. All rights reserved.
              <br />
              If you did not expect this email, please ignore it.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`

module.exports = sendAdminCreationEmail;