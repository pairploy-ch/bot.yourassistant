// ./src/app/providers.js
import React from "react";

export default function SessionWrapper({ children }) {
  // สมมติ wrapper ไว้จัดการ context/session
  return <>{children}</>;
}
