const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const pwdBtn = '<button className="w-full flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors group">';
const newPwdBtn = '<button onClick={async () => { if (auth.currentUser?.email) { try { const { sendPasswordResetEmail } = await import("firebase/auth"); await sendPasswordResetEmail(auth, auth.currentUser.email); triggerToast("Password reset email sent", "success"); } catch (e) { triggerToast("Failed to send reset email", "error"); } } else { triggerToast("No email associated with account", "error"); } }} className="w-full flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors group">';

code = code.replace(pwdBtn, newPwdBtn);

fs.writeFileSync('src/App.tsx', code);
