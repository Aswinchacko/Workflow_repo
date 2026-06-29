// Central English string table. Single source of truth for UI copy so other
// languages (Arabic/RTL, Hindi/Urdu, etc.) can be added later without touching
// components -- just add another locale object keyed by the same keys.

export const t = {
  appName: "WorkSite Portal",
  // Navigation
  navHome: "Home",
  navDirectory: "Directory",
  navRequests: "Requests",
  navAttendance: "Attendance",
  navProfile: "Profile",
  // Auth
  signIn: "Sign In",
  signOut: "Sign Out",
  userId: "User ID",
  password: "Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  setPassword: "Set Password",
  resetTitle: "Create your password",
  resetSubtitle: "For your security, please set a new password before continuing.",
  invalidLogin: "Wrong User ID or password. Please try again.",
  // Status
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
  // Common actions
  approve: "Approve",
  reject: "Reject",
  markPaid: "Mark as Paid",
  submit: "Submit",
  cancel: "Cancel",
  save: "Save",
  back: "Back",
  // Procurement
  procurement: "Material Requests",
  newProcurement: "New Material Request",
  // Petty cash
  pettyCash: "Petty Cash",
  newClaim: "New Claim",
  // Attendance
  checkIn: "Check In",
  checkOut: "Check Out",
  checkedIn: "You are checked in",
  notCheckedIn: "You are not checked in",
  late: "Late",
  overtime: "Overtime",
} as const;

export type TranslationKey = keyof typeof t;
