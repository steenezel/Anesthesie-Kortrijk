import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: "aso" | "staff" | "supervisor" | "kiosk" | "admin";
};
