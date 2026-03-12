# Nurse Employment Experience App (Rate My Hospitals)

A platform for nurses to rate and review their workplace experiences in Southern California healthcare facilities. This application allows nurses to share insights on staffing, safety, pay, culture, and management.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Language:** TypeScript

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Node.js 18.17 or later
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
   Open **PowerShell** or **Command Prompt** and run:
   ```powershell
   git clone <repository-url>
   cd "Rate My Hospitals\nurse-app"
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Run the development server**
   ```powershell
   npm run dev
   ```

4. **Open the application**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app`: App Router pages and layouts
- `/src/components`: Reusable UI components
- `/src/lib`: Utility functions and mock data
- `/public`: Static assets

## Current Status

The application is currently running with **mock data** for demonstration purposes. No database connection is required to run the initial development version.

- **Employer Directory:** Browse hospitals.
- **Employer Details:** View ratings, reviews, salaries, and interview insights.
- **Comparison Tool:** Compare two hospitals side-by-side at `/compare`.
- **Review Submission:** Mock form for submitting reviews.

