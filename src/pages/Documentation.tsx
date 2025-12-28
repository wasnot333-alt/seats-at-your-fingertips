import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft, FileText, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Documentation = () => {
  const navigate = useNavigate();

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    const addTitle = (text: string, size: number = 16) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(size);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin, yPos);
      yPos += size * 0.5 + 5;
    };

    const addSubtitle = (text: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin, yPos);
      yPos += 8;
    };

    const addText = (text: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 3;
    };

    const addBullet = (text: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, contentWidth - 10);
      doc.text("•", margin, yPos);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 2;
    };

    const addSpace = (space: number = 5) => {
      yPos += space;
    };

    // Cover Page
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("MEDITATION SEAT BOOKING SYSTEM", pageWidth / 2, 80, { align: "center" });
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Complete Technical Documentation", pageWidth / 2, 95, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 110, { align: "center" });
    doc.text("Version 1.0 - Single Level Booking System", pageWidth / 2, 120, { align: "center" });

    // Section 1: App Overview
    doc.addPage();
    yPos = 20;
    addTitle("1. APP OVERVIEW", 18);
    addSpace();

    addSubtitle("App Purpose");
    addText("A seat booking system for meditation events where attendees receive invitation codes to reserve specific seats.");
    addSpace();

    addSubtitle("Core Problem");
    addText("Manage controlled access to limited meditation hall seats using unique invitation codes that ensure fair and orderly seat allocation.");
    addSpace();

    addSubtitle("User Roles");
    addBullet("Guest User: Can enter invitation code, select seat, complete booking");
    addBullet("Admin: Can manage invitation codes, view bookings, create/delete codes");
    addSpace();

    addSubtitle("Key Constraints");
    addBullet("One invitation code = One booking only");
    addBullet("One seat per booking");
    addBullet("180 total seats (Rows A-R, Columns 1-10)");
    addBullet("Codes expire after single use");
    addBullet("No user authentication required for guests");

    // Section 2: User Flows
    doc.addPage();
    yPos = 20;
    addTitle("2. USER FLOWS & BUSINESS LOGIC", 18);
    addSpace();

    addSubtitle("Guest Booking Flow");
    addBullet("Step 1: User visits homepage → clicks 'Book Your Seat'");
    addBullet("Step 2: Enter Invitation Code → System validates via Edge Function");
    addBullet("Step 3: If valid → Navigate to seat selection");
    addBullet("Step 4: Select one available seat from 180-seat layout");
    addBullet("Step 5: Enter user details (name, email, mobile)");
    addBullet("Step 6: Confirm booking → System creates booking record");
    addBullet("Step 7: View success ticket with QR code");
    addSpace();

    addSubtitle("Validation Rules");
    addBullet("Code must exist in invitation_codes table");
    addBullet("Code status must be 'active'");
    addBullet("Code current_usage must be 0");
    addBullet("Code must not be expired (expires_at > now or null)");
    addBullet("Selected seat status must be 'available'");
    addSpace();

    addSubtitle("Admin Flow");
    addBullet("Login with email/password via Supabase Auth");
    addBullet("Must have 'admin' role in user_roles table");
    addBullet("Can create, activate, deactivate, delete invitation codes");
    addBullet("Can view all bookings with seat and user details");
    addBullet("Can bulk import codes via Excel file");

    // Section 3: Database Design
    doc.addPage();
    yPos = 20;
    addTitle("3. DATABASE DESIGN", 18);
    addSpace();

    addSubtitle("Table: invitation_codes");
    autoTable(doc, {
      startY: yPos,
      head: [["Column", "Type", "Constraints", "Default"]],
      body: [
        ["id", "UUID", "PRIMARY KEY", "gen_random_uuid()"],
        ["code", "TEXT", "NOT NULL, UNIQUE", "-"],
        ["participant_name", "TEXT", "NULLABLE", "NULL"],
        ["status", "ENUM", "active|disabled|expired", "active"],
        ["current_usage", "INTEGER", "NOT NULL", "0"],
        ["max_usage", "INTEGER", "NULLABLE", "1"],
        ["expires_at", "TIMESTAMPTZ", "NULLABLE", "NULL"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL", "now()"],
        ["updated_at", "TIMESTAMPTZ", "NOT NULL", "now()"],
        ["created_by", "UUID", "FK to auth.users", "NULL"],
      ],
      margin: { left: margin },
      styles: { fontSize: 8 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    addSubtitle("Table: bookings");
    autoTable(doc, {
      startY: yPos,
      head: [["Column", "Type", "Constraints", "Default"]],
      body: [
        ["id", "UUID", "PRIMARY KEY", "gen_random_uuid()"],
        ["customer_name", "TEXT", "NOT NULL", "-"],
        ["email", "TEXT", "NOT NULL", "-"],
        ["mobile_number", "TEXT", "NOT NULL", "-"],
        ["seat_id", "TEXT", "NOT NULL, FK to seats", "-"],
        ["invitation_code_used", "TEXT", "NOT NULL", "-"],
        ["status", "TEXT", "NOT NULL", "confirmed"],
        ["booking_time", "TIMESTAMPTZ", "NOT NULL", "now()"],
      ],
      margin: { left: margin },
      styles: { fontSize: 8 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    addSubtitle("Table: seats");
    autoTable(doc, {
      startY: yPos,
      head: [["Column", "Type", "Constraints", "Default"]],
      body: [
        ["id", "UUID", "PRIMARY KEY", "gen_random_uuid()"],
        ["seat_id", "TEXT", "NOT NULL, UNIQUE", "-"],
        ["row", "TEXT", "NOT NULL (A-R)", "-"],
        ["number", "INTEGER", "NOT NULL (1-10)", "-"],
        ["status", "TEXT", "NOT NULL", "available"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL", "now()"],
      ],
      margin: { left: margin },
      styles: { fontSize: 8 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    addSubtitle("Table: user_roles");
    autoTable(doc, {
      startY: yPos,
      head: [["Column", "Type", "Constraints", "Default"]],
      body: [
        ["id", "UUID", "PRIMARY KEY", "gen_random_uuid()"],
        ["user_id", "UUID", "NOT NULL, FK to auth.users", "-"],
        ["role", "ENUM", "admin|user", "-"],
        ["created_at", "TIMESTAMPTZ", "NOT NULL", "now()"],
      ],
      margin: { left: margin },
      styles: { fontSize: 8 },
    });

    // Section 4: Backend Logic
    doc.addPage();
    yPos = 20;
    addTitle("4. BACKEND LOGIC (Edge Functions)", 18);
    addSpace();

    addSubtitle("Function: validate-code");
    addText("Purpose: Validates invitation code before seat selection");
    addBullet("Input: { code: string }");
    addBullet("Checks: code exists, status='active', current_usage=0, not expired");
    addBullet("Output: { valid: true, codeId: string, participantName: string }");
    addBullet("On failure: { valid: false, error: string }");
    addSpace();

    addSubtitle("Function: confirm-booking");
    addText("Purpose: Creates booking and marks code as used");
    addBullet("Input: { code, seatId, customerName, email, mobileNumber }");
    addBullet("Transaction: Updates seat status, creates booking, expires code");
    addBullet("Output: { success: true, bookingId: string }");
    addBullet("Atomicity: All operations succeed or all fail");
    addSpace();

    addSubtitle("Function: get-booking");
    addText("Purpose: Retrieves booking details for success page");
    addBullet("Input: { bookingId: string }");
    addBullet("Output: Complete booking object with seat details");

    // Section 5: Security
    doc.addPage();
    yPos = 20;
    addTitle("5. SECURITY & DATA INTEGRITY", 18);
    addSpace();

    addSubtitle("Row Level Security (RLS)");
    addBullet("invitation_codes: Public read (for validation), Admin write");
    addBullet("bookings: Public insert (for creating), Admin read all");
    addBullet("seats: Public read (for display), System update via functions");
    addBullet("user_roles: Admin only access");
    addSpace();

    addSubtitle("Double Booking Prevention");
    addBullet("Database: UNIQUE constraint on invitation_code_used in bookings");
    addBullet("Application: Check current_usage before allowing booking");
    addBullet("Transaction: Atomic update of code usage + booking creation");
    addSpace();

    addSubtitle("One-Time Code Enforcement");
    addBullet("current_usage column tracks usage (0 = unused, 1 = used)");
    addBullet("After booking: status set to 'expired', current_usage set to 1");
    addBullet("Validation rejects codes where current_usage >= 1");

    // Section 6: One-Time Code Logic
    doc.addPage();
    yPos = 20;
    addTitle("6. ONE-TIME CODE LOGIC (DETAILED)", 18);
    addSpace();

    addSubtitle("Code Generation");
    addBullet("Admin creates codes manually or via bulk import");
    addBullet("Code format: Any alphanumeric string (e.g., 'GURU2025-001')");
    addBullet("Must be unique across system");
    addSpace();

    addSubtitle("Code Validation Process");
    addText("1. User enters code on /enter-code page");
    addText("2. Frontend calls validate-code Edge Function");
    addText("3. Function queries: SELECT * FROM invitation_codes WHERE code = ?");
    addText("4. Checks: status='active' AND current_usage=0 AND (expires_at IS NULL OR expires_at > now())");
    addText("5. If valid: Returns success, frontend navigates to seat selection");
    addText("6. If invalid: Returns error message");
    addSpace();

    addSubtitle("Code Usage Marking");
    addText("On successful booking, confirm-booking function:");
    addBullet("Sets current_usage = 1");
    addBullet("Sets status = 'expired'");
    addBullet("Sets updated_at = now()");
    addSpace();

    addSubtitle("Re-use Prevention");
    addBullet("Application layer: validate-code checks current_usage < 1");
    addBullet("Database layer: Can add CHECK constraint current_usage <= max_usage");
    addBullet("If used code entered: Returns 'Code already used' error");

    // Section 7: Frontend Logic
    doc.addPage();
    yPos = 20;
    addTitle("7. FRONTEND LOGIC", 18);
    addSpace();

    addSubtitle("Pages & Routes");
    autoTable(doc, {
      startY: yPos,
      head: [["Route", "Page", "Purpose"]],
      body: [
        ["/", "Index.tsx", "Homepage with booking CTA"],
        ["/enter-code", "EnterCode.tsx", "Invitation code input"],
        ["/select-seat", "SelectSeat.tsx", "Seat map & selection"],
        ["/user-details", "UserDetails.tsx", "User info form"],
        ["/success", "Success.tsx", "Booking confirmation & ticket"],
        ["/admin-login", "AdminLogin.tsx", "Admin authentication"],
        ["/admin", "Admin.tsx", "Admin dashboard"],
      ],
      margin: { left: margin },
      styles: { fontSize: 9 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    addSubtitle("State Management");
    addBullet("BookingContext: Stores code, selectedSeat, userDetails, confirmedBooking");
    addBullet("AuthContext: Stores admin session and user info");
    addBullet("React Query: Handles server state for seats and bookings");
    addSpace();

    addSubtitle("Key Components");
    addBullet("SeatLayout: Renders 180 seats in grid format");
    addBullet("Seat: Individual seat with click handler and status styling");
    addBullet("BookingTicket: Displays confirmed booking with QR code");
    addBullet("InvitationCodesManager: Admin CRUD for codes");

    // Section 8: Edge Cases
    doc.addPage();
    yPos = 20;
    addTitle("8. EDGE CASES & BUG PREVENTION", 18);
    addSpace();

    addSubtitle("Known Edge Cases");
    autoTable(doc, {
      startY: yPos,
      head: [["Edge Case", "Prevention"]],
      body: [
        ["Same code used twice simultaneously", "Database transaction + unique constraint"],
        ["User refreshes during booking", "Context state persists, re-validation on load"],
        ["Seat booked by another user mid-flow", "Real-time seat status check before confirm"],
        ["Expired code entered", "expires_at check in validation"],
        ["Invalid code format", "Frontend validation before API call"],
        ["Network failure during booking", "Error handling with retry option"],
        ["Admin deletes code mid-booking", "Transaction rollback on failure"],
      ],
      margin: { left: margin },
      styles: { fontSize: 9 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    addSubtitle("Recommended Improvements");
    addBullet("Add database trigger to auto-expire codes after booking");
    addBullet("Implement seat locking during selection (5-min timeout)");
    addBullet("Add booking confirmation email");
    addBullet("Add QR code scanning for entry verification");

    // Section 9: Rebuild Instructions
    doc.addPage();
    yPos = 20;
    addTitle("9. REBUILD INSTRUCTIONS", 18);
    addSpace();

    addSubtitle("Tech Stack");
    addBullet("Frontend: React 18 + TypeScript + Vite");
    addBullet("Styling: Tailwind CSS + shadcn/ui components");
    addBullet("Backend: Supabase (PostgreSQL + Edge Functions)");
    addBullet("State: React Context + TanStack React Query");
    addBullet("Routing: React Router v6");
    addSpace();

    addSubtitle("Rebuild Order");
    addText("Phase 1 - Database (CRITICAL):");
    addBullet("1. Create seats table with 180 rows (A1-R10)");
    addBullet("2. Create invitation_codes table with status enum");
    addBullet("3. Create bookings table with foreign keys");
    addBullet("4. Create user_roles table");
    addBullet("5. Enable RLS on all tables");
    addSpace();

    addText("Phase 2 - Edge Functions:");
    addBullet("1. validate-code function");
    addBullet("2. confirm-booking function");
    addBullet("3. get-booking function");
    addSpace();

    addText("Phase 3 - Frontend:");
    addBullet("1. Setup React + Vite + Tailwind");
    addBullet("2. Create BookingContext");
    addBullet("3. Build pages in flow order");
    addBullet("4. Add admin authentication");

    // Section 10: Final Summary
    doc.addPage();
    yPos = 20;
    addTitle("10. FINAL SUMMARY", 18);
    addSpace();

    addSubtitle("Critical Rules - NEVER BREAK");
    addBullet("ONE code = ONE booking (no exceptions)");
    addBullet("ONE seat per booking");
    addBullet("Codes must expire immediately after use");
    addBullet("Seat status must update atomically with booking");
    addBullet("All booking operations must be transactional");
    addSpace();

    addSubtitle("Most Important Database Constraints");
    addBullet("invitation_codes.code: UNIQUE");
    addBullet("seats.seat_id: UNIQUE");
    addBullet("bookings.invitation_code_used: Should be UNIQUE");
    addBullet("bookings.seat_id: Foreign key to seats.seat_id");
    addSpace();

    addSubtitle("Most Important Backend Rules");
    addBullet("Always validate code before showing seats");
    addBullet("Always check seat availability before booking");
    addBullet("Always use transactions for booking operations");
    addBullet("Always expire code after successful booking");
    addBullet("Never allow booking with already-used code");
    addSpace();

    addSubtitle("System Summary");
    addText("This is a single-seat, single-use invitation code booking system for meditation events. Each invitation code can only be used once to book exactly one seat. The system has 180 seats arranged in rows A through R with 10 seats each. Admins can create and manage invitation codes, while guests use these codes to complete bookings through a simple 4-step flow: enter code → select seat → enter details → view ticket.");

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Meditation Seat Booking System - Technical Documentation | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save("Meditation-Seat-Booking-System-Documentation.pdf");
  };

  const generateSelfHostingGuidePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    const addTitle = (text: string, size: number = 16) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(size);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin, yPos);
      yPos += size * 0.5 + 5;
    };

    const addSubtitle = (text: string) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin, yPos);
      yPos += 8;
    };

    const addText = (text: string) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 3;
    };

    const addStep = (num: string, text: string) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(num, margin, yPos);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, contentWidth - 15);
      doc.text(lines, margin + 12, yPos);
      yPos += lines.length * 5 + 4;
    };

    const addSpace = (space: number = 5) => { yPos += space; };

    // Cover Page
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("SELF-HOSTING GUIDE", pageWidth / 2, 60, { align: "center" });
    doc.setFontSize(16);
    doc.text("Meditation Seat Booking System", pageWidth / 2, 75, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Complete Step-by-Step Migration Guide", pageWidth / 2, 90, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 105, { align: "center" });
    doc.setFontSize(10);
    doc.text("Frontend: Hostinger | Backend: Supabase Free Tier", pageWidth / 2, 120, { align: "center" });

    // PART 1: GitHub Export
    doc.addPage();
    yPos = 20;
    addTitle("PART 1: EXPORT CODE TO GITHUB", 18);
    addText("First, save your code to GitHub while you still have Lovable access.");
    addSpace();

    addSubtitle("Step 1: Connect GitHub to Lovable");
    addStep("1.1", "In Lovable editor, click the GitHub icon in the left sidebar");
    addStep("1.2", "Click 'Connect to GitHub' button");
    addStep("1.3", "A popup will open - click 'Authorize Lovable' on GitHub");
    addStep("1.4", "Select your GitHub account (personal or organization)");
    addStep("1.5", "Click 'Install & Authorize'");
    addSpace();

    addSubtitle("Step 2: Create Repository");
    addStep("2.1", "Back in Lovable, click 'Create Repository'");
    addStep("2.2", "Enter repository name: 'meditation-booking-system'");
    addStep("2.3", "Choose 'Private' for visibility");
    addStep("2.4", "Click 'Create Repository'");
    addStep("2.5", "Wait for sync - your code is now on GitHub!");
    addSpace();

    addSubtitle("Step 3: Clone to Your Computer (Optional)");
    addStep("3.1", "Go to github.com and open your new repository");
    addStep("3.2", "Click green 'Code' button - Copy the HTTPS URL");
    addStep("3.3", "Open terminal/command prompt on your computer");
    addStep("3.4", "Run: git clone [paste-url-here]");
    addStep("3.5", "Run: cd meditation-booking-system");
    addStep("3.6", "Run: npm install");

    // PART 2: Supabase Setup
    doc.addPage();
    yPos = 20;
    addTitle("PART 2: SETUP FREE SUPABASE ACCOUNT", 18);
    addText("Create your own Supabase project to host the database and backend.");
    addSpace();

    addSubtitle("Step 1: Create Supabase Account");
    addStep("1.1", "Go to: https://supabase.com");
    addStep("1.2", "Click 'Start your project' (green button)");
    addStep("1.3", "Sign up with GitHub (recommended) or email");
    addStep("1.4", "Verify your email if required");
    addSpace();

    addSubtitle("Step 2: Create New Project");
    addStep("2.1", "Click 'New Project' button");
    addStep("2.2", "Select organization (or create one named 'Personal')");
    addStep("2.3", "Project name: 'meditation-booking'");
    addStep("2.4", "Database password: Create a STRONG password (SAVE THIS!)");
    addStep("2.5", "Region: Choose closest to your users");
    addStep("2.6", "Click 'Create new project'");
    addStep("2.7", "Wait 2-3 minutes for project to be ready");
    addSpace();

    addSubtitle("Step 3: Get Your API Keys");
    addStep("3.1", "In Supabase dashboard, go to Settings - API");
    addStep("3.2", "Copy 'Project URL' (looks like: https://xxxxx.supabase.co)");
    addStep("3.3", "Copy 'anon public' key (long string starting with 'eyJ...')");
    addStep("3.4", "Save both in a safe place - you'll need these later!");

    // PART 3: Database Creation
    doc.addPage();
    yPos = 20;
    addTitle("PART 3: CREATE DATABASE TABLES", 18);
    addText("Run these SQL commands in Supabase SQL Editor to create your database.");
    addSpace();

    addSubtitle("Step 1: Open SQL Editor");
    addStep("1.1", "In Supabase dashboard, click 'SQL Editor' in left sidebar");
    addStep("1.2", "Click '+ New query' button");
    addSpace();

    addSubtitle("Step 2: Create Enum Types");
    addText("Copy and paste this SQL, then click 'Run':");
    addSpace();
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text("CREATE TYPE invitation_code_status AS ENUM ('active', 'disabled', 'expired');", margin, yPos);
    yPos += 5;
    doc.text("CREATE TYPE app_role AS ENUM ('admin', 'user');", margin, yPos);
    yPos += 10;

    addSubtitle("Step 3: Create Tables (Run Each Separately)");
    addText("See the Technical Documentation PDF for complete SQL schemas.");
    addText("Tables needed: invitation_codes, seats, bookings, user_roles");

    // PART 4: Hostinger Setup
    doc.addPage();
    yPos = 20;
    addTitle("PART 4: DEPLOY TO HOSTINGER", 18);
    addText("Host your frontend on Hostinger web hosting.");
    addSpace();

    addSubtitle("Step 1: Build Your Project");
    addStep("1.1", "Open terminal in your project folder");
    addStep("1.2", "Create .env file with your Supabase credentials:");
    addText("   VITE_SUPABASE_URL=https://your-project.supabase.co");
    addText("   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key");
    addStep("1.3", "Run: npm run build");
    addStep("1.4", "A 'dist' folder will be created with your built files");
    addSpace();

    addSubtitle("Step 2: Upload to Hostinger");
    addStep("2.1", "Login to hPanel at hpanel.hostinger.com");
    addStep("2.2", "Click 'File Manager'");
    addStep("2.3", "Navigate to 'public_html' folder");
    addStep("2.4", "Delete existing files");
    addStep("2.5", "Click 'Upload' and select ALL files from 'dist' folder");
    addSpace();

    addSubtitle("Step 3: Create .htaccess File");
    addStep("3.1", "In public_html, click 'New File'");
    addStep("3.2", "Name it: .htaccess");
    addStep("3.3", "Add this content:");
    addSpace();
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text("<IfModule mod_rewrite.c>", margin, yPos); yPos += 4;
    doc.text("  RewriteEngine On", margin, yPos); yPos += 4;
    doc.text("  RewriteBase /", margin, yPos); yPos += 4;
    doc.text("  RewriteRule ^index\\.html$ - [L]", margin, yPos); yPos += 4;
    doc.text("  RewriteCond %{REQUEST_FILENAME} !-f", margin, yPos); yPos += 4;
    doc.text("  RewriteCond %{REQUEST_FILENAME} !-d", margin, yPos); yPos += 4;
    doc.text("  RewriteRule . /index.html [L]", margin, yPos); yPos += 4;
    doc.text("</IfModule>", margin, yPos); yPos += 10;

    addSubtitle("Step 4: Enable SSL");
    addStep("4.1", "In hPanel, go to 'SSL' section");
    addStep("4.2", "Click 'Setup' and select 'Free SSL'");
    addStep("4.3", "Enable 'Force HTTPS'");

    // PART 5: Admin Setup
    doc.addPage();
    yPos = 20;
    addTitle("PART 5: CREATE ADMIN USER", 18);
    addSpace();

    addSubtitle("Step 1: Create User in Supabase");
    addStep("1.1", "Go to Supabase Dashboard - Authentication - Users");
    addStep("1.2", "Click 'Add User' - 'Create New User'");
    addStep("1.3", "Enter email and password");
    addStep("1.4", "Toggle 'Auto Confirm User' ON");
    addStep("1.5", "Click 'Create User'");
    addStep("1.6", "Copy the User UUID");
    addSpace();

    addSubtitle("Step 2: Assign Admin Role");
    addStep("2.1", "Go to SQL Editor");
    addStep("2.2", "Run:");
    addSpace();
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    doc.text("INSERT INTO user_roles (user_id, role)", margin, yPos); yPos += 5;
    doc.text("VALUES ('YOUR-USER-UUID-HERE', 'admin');", margin, yPos); yPos += 10;

    doc.setFont("helvetica", "normal");
    addText("You can now login at yourdomain.com/admin-login");

    // Summary
    doc.addPage();
    yPos = 20;
    addTitle("SUMMARY: COST BREAKDOWN", 18);
    addSpace();

    autoTable(doc, {
      startY: yPos,
      head: [["Component", "Service", "Monthly Cost"]],
      body: [
        ["Frontend", "Hostinger", "Your existing plan"],
        ["Database", "Supabase Free", "$0"],
        ["Edge Functions", "Supabase Free", "$0"],
        ["Auth", "Supabase Free", "$0"],
        ["SSL", "Hostinger", "Included"],
      ],
      margin: { left: margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;

    addSubtitle("Supabase Free Tier Limits");
    addText("500 MB database | 500K function calls/month | Unlimited users");
    addSpace();

    addTitle("You're all set!", 14);
    addText("Your app is now self-hosted and runs independently of Lovable!");

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Self-Hosting Guide | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save("Self-Hosting-Guide-Hostinger-Supabase.pdf");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <FileText className="w-16 h-16 text-primary" />
              </div>
              <CardTitle className="text-2xl">Technical Documentation</CardTitle>
              <p className="text-muted-foreground mt-2">
                Complete system documentation for rebuilding from scratch
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Includes:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Database Design & Schema</li>
                  <li>• User Flows & Business Logic</li>
                  <li>• Backend Edge Functions</li>
                  <li>• Security & RLS Policies</li>
                  <li>• Frontend Structure</li>
                </ul>
              </div>

              <Button onClick={generatePDF} className="w-full" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download Technical Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Server className="w-16 h-16 text-primary" />
              </div>
              <CardTitle className="text-2xl">Self-Hosting Guide</CardTitle>
              <p className="text-muted-foreground mt-2">
                Step-by-step guide to host on Hostinger + Supabase (Free)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Covers:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Export code to GitHub</li>
                  <li>• Setup free Supabase account</li>
                  <li>• Create database tables</li>
                  <li>• Deploy to Hostinger</li>
                  <li>• Configure .htaccess for SPA</li>
                  <li>• Create admin user</li>
                </ul>
              </div>

              <Button onClick={generateSelfHostingGuidePDF} className="w-full" size="lg" variant="outline">
                <Download className="w-5 h-5 mr-2" />
                Download Self-Hosting Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
