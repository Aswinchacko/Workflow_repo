import { Home, Users, FileText, CalendarClock, User } from "lucide-react";
import { t } from "@/lib/i18n";

export const navTabs = [
  { href: "/", label: t.navHome, Icon: Home, exact: true },
  { href: "/directory", label: t.navDirectory, Icon: Users },
  { href: "/requests", label: t.navRequests, Icon: FileText },
  { href: "/attendance", label: t.navAttendance, Icon: CalendarClock },
  { href: "/profile", label: t.navProfile, Icon: User },
];
