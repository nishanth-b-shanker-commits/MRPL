# MRPL Learning Management System (LMS) - Proof of Concept (POC)

This is a premium, high-fidelity Learning Management System (LMS) Proof of Concept web application custom-designed for **Mangalore Refinery and Petrochemicals Limited (MRPL)**. 

Built using **React**, **Vite**, and styled with a clean, light corporate MRPL theme (Deep Navy Blue, Energy Green, and Amber Gold), it showcases five advanced LMS capabilities along with authentication and administration systems.

---

## 🌟 Key Capabilities & Features

### 1. 🔐 Role-Based Authentication & Session Management
- Login page separating access for **Administrators** and **Learners**.
- Demo quick login shortcuts to log in as default profiles instantly.
- Session persistence using browser local storage, complete with secure logouts.

### 2. 👥 Learner Login Management (Admin)
- Admin tool to view all registered learners.
- Create new learner accounts, configure job roles (mapped to competency targets), reset passwords, or suspend access (Disabling accounts blocks system entry).

### 3. 🎬 Admin Video Content Upload & Player
- Direct uploading of local `.mp4`/`.webm` files or streaming URLs.
- Input title, duration, category, description, and transcript text.
- **Auto-Indexing**: Newly uploaded video courses publish to the student catalog and are automatically processed into the AI Semantic Search database.
- Integrated HTML5 video streaming player with a transcript drawer for learners.

### 4. 📦 SCORM Course Integration & Playback (Module 1)
- Client-side unzipping of standard SCORM packages using `JSZip`.
- Parses `imsmanifest.xml` structure to identify course title and launch path.
- Standard-compliant runtime adapter exposing `window.API` (SCORM 1.2) and `window.API_1484_11` (SCORM 2004) to iframe courses.
- Live console log tracking parameters set by courses (location, score, status, session time).

### 5. 🧠 AI Question Generation & Review (Module 2)
- Auto-generates MCQ, True/False, and Short Answer questions from pasted text.
- Connects directly to the Gemini 1.5 Flash API with structured JSON schemas (falls back to a rule-based generator if no API key is set).
- Mapped difficulty distribution (30% Easy, 40% Medium, 30% Hard) and Bloom's Taxonomy classifications.
- Curation Review Board for editing, changing tags, and approving/rejecting questions.

### 6. 🔍 AI-Based Semantic Content Search (Module 3)
- Natural language queries (e.g. searching *"forgot office network access key"* resolves to *"Company Network Access Guide"* without requiring exact keywords).
- Calculates cosine similarity via Gemini Embeddings (`text-embedding-004`) with local synonym-mapping backup.
- Click-Through Rate (CTR) feedback loops boost clicked results dynamically.

### 7. 📊 Training Needs Identification (TNI) Engine (Module 4)
- Automated comparison of learner skills against role competency framework targets.
- Charts current vs required levels using horizontal comparative bars.
- Prescribes direct learning path course recommendations with 1-click enrollments.

### 8. 📶 Learner Web Portal (Module 5)
- Full-screen student web dashboard showing catalog, enrolled courses, and grades.
- **Connection Mode Switcher**: Toggling off internet disconnects the student portal, allowing them to download courses locally and take quizzes offline.
- **Sync Worker**: Reconnecting triggers a queue processor that uploads grades to the master gradebook.

---

## 🛠️ Installation & Local Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18.x or higher recommended).

### Setup Instructions
1. Clone this repository:
   ```bash
   git clone https://github.com/nishanth-b-shanker-commits/MRPL.git
   cd MRPL
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```
   *The application will spin up at: `http://localhost:5173/` (or `5174` if port 5173 is in use).*

4. Build for production compilation:
   ```bash
   npm run build
   ```

---

## 🧪 Demo Credentials

### Administrator
* **Username**: `admin`
* **Password**: `admin123`

### Learners (Password is `password` for all default users)
* `sarah.chen` (Software Engineer)
* `marcus.brody` (Customer Support Specialist)
* `elena.rostova` (Product Manager)
