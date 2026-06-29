import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { EmploymentType, Role } from "../src/lib/enums";
import { computeShift, isLateCheckIn, attendanceDayKey } from "../src/lib/attendance";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Welcome@123";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function at(date: Date, h: number, m: number): Date {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  console.log("Resetting data...");
  await prisma.attendance.deleteMany();
  await prisma.pettyCashClaim.deleteMany();
  await prisma.procurementRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  console.log("Creating departments...");
  const deptNames = [
    "Management",
    "Site Operations",
    "Procurement",
    "Finance",
    "Engineering",
  ];
  const depts: Record<string, string> = {};
  for (const name of deptNames) {
    const d = await prisma.department.create({ data: { name } });
    depts[name] = d.id;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  type Seed = {
    userId: string;
    name: string;
    role: Role;
    dept: string;
    jobTitle: string;
    type: EmploymentType;
    phone: string;
    site?: string;
    skills: string[];
    managerKey?: string; // userId of manager
    joining: Date;
  };

  const people: Seed[] = [
    {
      userId: "EMP1001",
      name: "Aisha Khan",
      role: "ADMIN_HR",
      dept: "Management",
      jobTitle: "HR Manager",
      type: "OFFICE",
      phone: "+971 50 111 1001",
      skills: ["Recruitment", "Payroll", "Compliance"],
      joining: new Date("2019-03-01"),
    },
    {
      userId: "EMP1002",
      name: "Rajesh Kumar",
      role: "MANAGER",
      dept: "Site Operations",
      jobTitle: "Site Manager",
      type: "SITE",
      phone: "+971 50 111 1002",
      site: "Marina Tower Project",
      skills: ["Site Supervision", "Safety (OSHA)", "Scheduling"],
      managerKey: "EMP1001",
      joining: new Date("2020-06-15"),
    },
    {
      userId: "EMP1003",
      name: "Mohammed Ali",
      role: "MANAGER",
      dept: "Procurement",
      jobTitle: "Procurement Manager",
      type: "OFFICE",
      phone: "+971 50 111 1003",
      skills: ["Vendor Management", "Negotiation", "Inventory"],
      managerKey: "EMP1001",
      joining: new Date("2020-01-20"),
    },
    {
      userId: "EMP1004",
      name: "Priya Nair",
      role: "FINANCE",
      dept: "Finance",
      jobTitle: "Finance Officer",
      type: "OFFICE",
      phone: "+971 50 111 1004",
      skills: ["Accounting", "Reimbursements", "Auditing"],
      managerKey: "EMP1001",
      joining: new Date("2021-02-10"),
    },
    {
      userId: "EMP1005",
      name: "Suresh Babu",
      role: "EMPLOYEE",
      dept: "Site Operations",
      jobTitle: "Mason",
      type: "SITE",
      phone: "+971 50 111 1005",
      site: "Marina Tower Project",
      skills: ["Masonry", "Concrete Work", "Plastering"],
      managerKey: "EMP1002",
      joining: new Date("2021-09-01"),
    },
    {
      userId: "EMP1006",
      name: "Abdul Rahman",
      role: "EMPLOYEE",
      dept: "Site Operations",
      jobTitle: "Electrician",
      type: "SITE",
      phone: "+971 50 111 1006",
      site: "Marina Tower Project",
      skills: ["Electrical Wiring", "Panel Installation", "Safety (OSHA)"],
      managerKey: "EMP1002",
      joining: new Date("2022-04-12"),
    },
    {
      userId: "EMP1007",
      name: "Ramesh Singh",
      role: "EMPLOYEE",
      dept: "Site Operations",
      jobTitle: "Carpenter",
      type: "SITE",
      phone: "+971 50 111 1007",
      site: "Business Bay Project",
      skills: ["Carpentry", "Formwork", "Finishing"],
      managerKey: "EMP1002",
      joining: new Date("2022-08-05"),
    },
    {
      userId: "EMP1008",
      name: "Lakshmi Menon",
      role: "EMPLOYEE",
      dept: "Engineering",
      jobTitle: "Civil Engineer",
      type: "OFFICE",
      phone: "+971 50 111 1008",
      skills: ["AutoCAD", "Structural Design", "QA/QC"],
      managerKey: "EMP1002",
      joining: new Date("2021-11-15"),
    },
    {
      userId: "EMP1009",
      name: "John David",
      role: "EMPLOYEE",
      dept: "Procurement",
      jobTitle: "Storekeeper",
      type: "OFFICE",
      phone: "+971 50 111 1009",
      skills: ["Inventory", "Logistics", "Record Keeping"],
      managerKey: "EMP1003",
      joining: new Date("2023-01-09"),
    },
    {
      userId: "EMP1010",
      name: "Bilal Ahmed",
      role: "EMPLOYEE",
      dept: "Site Operations",
      jobTitle: "Plumber",
      type: "SITE",
      phone: "+971 50 111 1010",
      site: "Business Bay Project",
      skills: ["Plumbing", "Pipe Fitting", "Maintenance"],
      managerKey: "EMP1002",
      joining: new Date("2023-05-22"),
    },
  ];

  console.log("Creating employees + users...");
  const empByUserId: Record<string, string> = {};

  // First pass: create employees (without manager links).
  for (const p of people) {
    const emp = await prisma.employee.create({
      data: {
        name: p.name,
        jobTitle: p.jobTitle,
        employmentType: p.type,
        phone: p.phone,
        siteAssignment: p.site,
        departmentId: depts[p.dept],
        skills: JSON.stringify(p.skills),
        joiningDate: p.joining,
        emergencyContact: "+971 50 999 0000",
        visaExpiry: new Date("2027-06-30"),
        laborCardExpiry: new Date("2027-06-30"),
      },
    });
    empByUserId[p.userId] = emp.id;

    await prisma.user.create({
      data: {
        userId: p.userId,
        passwordHash,
        mustResetPassword: true,
        role: p.role,
        employeeId: emp.id,
      },
    });
  }

  // Second pass: set manager links.
  for (const p of people) {
    if (p.managerKey) {
      await prisma.employee.update({
        where: { id: empByUserId[p.userId] },
        data: { managerId: empByUserId[p.managerKey] },
      });
    }
  }

  console.log("Creating procurement requests...");
  const procMgr = empByUserId["EMP1003"];
  await prisma.procurementRequest.createMany({
    data: [
      {
        project: "Marina Tower Project",
        item: "Portland Cement (50kg bags)",
        quantity: 200,
        unit: "bags",
        neededByDate: daysAgo(-3),
        reason: "Foundation work for Block B",
        estCost: 4500,
        status: "PENDING",
        requesterId: empByUserId["EMP1005"],
      },
      {
        project: "Marina Tower Project",
        item: "Electrical Conduit Pipes (25mm)",
        quantity: 500,
        unit: "meters",
        neededByDate: daysAgo(-5),
        reason: "Wiring for floors 3-5",
        estCost: 2750,
        status: "APPROVED",
        requesterId: empByUserId["EMP1006"],
        approverId: procMgr,
        decisionNote: "Approved. Order from usual supplier.",
        decidedAt: daysAgo(1),
      },
      {
        project: "Business Bay Project",
        item: "Imported Italian Marble",
        quantity: 50,
        unit: "sqm",
        neededByDate: daysAgo(-10),
        reason: "Lobby flooring upgrade",
        estCost: 35000,
        status: "REJECTED",
        requesterId: empByUserId["EMP1007"],
        approverId: procMgr,
        decisionNote: "Over budget. Use local marble instead.",
        decidedAt: daysAgo(2),
      },
    ],
  });

  console.log("Creating petty cash claims...");
  const finance = empByUserId["EMP1004"];
  await prisma.pettyCashClaim.createMany({
    data: [
      {
        amount: 120.5,
        category: "Transport",
        spentDate: daysAgo(2),
        description: "Taxi to supplier warehouse for urgent pickup",
        status: "PENDING",
        requesterId: empByUserId["EMP1005"],
      },
      {
        amount: 85,
        category: "Tools & Supplies",
        spentDate: daysAgo(4),
        description: "Replacement safety gloves for crew",
        status: "APPROVED",
        requesterId: empByUserId["EMP1006"],
        approverId: finance,
        decisionNote: "Approved.",
        decidedAt: daysAgo(3),
      },
      {
        amount: 240,
        category: "Site Refreshments",
        spentDate: daysAgo(7),
        description: "Water and refreshments for crew during heat wave",
        status: "PAID",
        requesterId: empByUserId["EMP1010"],
        approverId: finance,
        decisionNote: "Approved and reimbursed in cash.",
        decidedAt: daysAgo(6),
        paymentRef: "PC-2026-0042",
        paidAt: daysAgo(5),
      },
    ],
  });

  console.log("Creating attendance history...");
  // Last 5 days for every employee — site vs office shift rules from employment type.
  const attendanceRows: Parameters<typeof prisma.attendance.createMany>[0]["data"] = [];

  for (const p of people) {
    const employeeId = empByUserId[p.userId];
    for (let i = 1; i <= 5; i++) {
      const day = daysAgo(i);
      if (p.type === "SITE") {
        const checkIn = at(day, 7, i === 2 ? 30 : 0);
        const checkOut = at(day, 17, 30);
        const calc = computeShift(checkIn, checkOut, "SITE");
        attendanceRows.push({
          employeeId,
          date: attendanceDayKey(day),
          checkIn,
          checkOut,
          hoursWorked: calc.hoursWorked,
          overtimeHours: calc.overtimeHours,
          isLate: isLateCheckIn(checkIn, "SITE"),
          source: "SELF",
        });
      } else {
        const checkIn = at(day, 8, i === 4 ? 25 : 5);
        const checkOut = at(day, 18, 0);
        const calc = computeShift(checkIn, checkOut, "OFFICE");
        attendanceRows.push({
          employeeId,
          date: attendanceDayKey(day),
          checkIn,
          checkOut,
          hoursWorked: calc.hoursWorked,
          overtimeHours: calc.overtimeHours,
          isLate: isLateCheckIn(checkIn, "OFFICE"),
          source: "SELF",
        });
      }
    }
  }

  await prisma.attendance.createMany({ data: attendanceRows });

  console.log("\nSeed complete.");
  console.log("------------------------------------------");
  console.log("Login with any User ID below + password:");
  console.log(`  Password: ${DEFAULT_PASSWORD}`);
  console.log("  EMP1001  Aisha Khan      (Admin/HR)");
  console.log("  EMP1002  Rajesh Kumar    (Manager - Site)");
  console.log("  EMP1003  Mohammed Ali    (Manager - Procurement)");
  console.log("  EMP1004  Priya Nair      (Finance)");
  console.log("  EMP1005  Suresh Babu     (Employee - Site)");
  console.log("  ... up to EMP1010");
  console.log("First login forces a password reset.");
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
