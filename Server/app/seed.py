"""Idempotent defaults: content is only inserted when a table is empty, the admin only when none exists."""
from __future__ import annotations

import logging

from sqlmodel import Session, select

from .core.config import settings
from .core.security import hash_password
from .db.session import engine
from .models import (
    AboutContent, ActivityItem, AdminUser, Certification, EducationItem, ExperienceItem,
    InterestItem, JourneyMilestone, Project, SiteSettings, SkillCategory,
)

log = logging.getLogger(__name__)

DEFAULT_THEME = {
    "preset": "petrol",
    "accent": "#0B5C7F",
    "accent2": "#4FB3D9",
    "radius": 16,
    "dark": {"bg": "#0A1014", "surface": "#101820", "surface2": "#16222B", "fg": "#EAF2F5", "muted": "#8FA3AD", "line": "#1E2E38"},
    "light": {"bg": "#F5F9FB", "surface": "#FFFFFF", "surface2": "#E9F1F5", "fg": "#0E1A21", "muted": "#5C7280", "line": "#D6E3EA"},
    "default_mode": "dark",
}
DEFAULT_FONTS = {"display": "Sora", "body": "Manrope", "mono": "JetBrains Mono"}
DEFAULT_EFFECTS = {"preloader": True, "cursor_glow": True, "grain": True, "particles": True, "marquee": True, "walker": True, "smooth_reveal": True}

SECTIONS = [
    {"key": "hero", "label": "Home", "visible": True},
    {"key": "about", "label": "About", "visible": True},
    {"key": "journey", "label": "Journey", "visible": True},
    {"key": "experience", "label": "Experience", "visible": True},
    {"key": "skills", "label": "Skills", "visible": True},
    {"key": "projects", "label": "Projects", "visible": True},
    {"key": "education", "label": "Education", "visible": True},
    {"key": "activities", "label": "Life", "visible": True},
    {"key": "interests", "label": "Interests", "visible": True},
    {"key": "hire", "label": "Hire me", "visible": True},
    {"key": "contact", "label": "Contact", "visible": True},
]
SECTION_TITLES = {
    "about": {"label": "about", "title": "Who I am", "subtitle": ""},
    "journey": {"label": "journey", "title": "Walk through my story", "subtitle": "Scroll to travel from the first line of code to today."},
    "experience": {"label": "experience", "title": "Where I have worked", "subtitle": "Roles across government, fintech, health and education."},
    "skills": {"label": "skills", "title": "What I work with", "subtitle": "Pick a category — proficiency plus the real projects where each skill was applied."},
    "projects": {"label": "projects", "title": "Things I have built", "subtitle": "Production systems, research work and open source."},
    "education": {"label": "education", "title": "Education & certifications", "subtitle": ""},
    "activities": {"label": "life beyond code", "title": "Outside work", "subtitle": "Engineering is what I do, not all I am."},
    "interests": {"label": "interests", "title": "What I think about", "subtitle": "The domains I read, research and build toward."},
    "hire": {"label": "work with me", "title": "Have a role or a project in mind?", "subtitle": "Send an offer — a job, contract, research collaboration or freelance project. You get a reply by email within a few days."},
    "contact": {"label": "contact", "title": "Let us build something", "subtitle": "Open to research collaborations, engineering roles and MSc Cybersecurity programmes."},
}


def _site_settings() -> SiteSettings:
    return SiteSettings(
        id=1,
        site_name="Loue Sauveur Christian",
        logo_text="lsc",
        seo_title="Loue Sauveur Christian | lscblack | Senior Software Engineer · Cybersecurity · ML · Rwanda",
        seo_description="Senior Software Engineer specialising in cybersecurity, machine learning and full-stack development. Building secure, intelligent systems for Africa's digital future from Kigali, Rwanda.",
        seo_keywords="Loue Sauveur Christian, lscblack, software engineer Rwanda, cybersecurity engineer Kigali, machine learning Rwanda, FastAPI, React, Flutter",
        canonical_url="https://lscblack.tech",
        og_image="https://avatars.githubusercontent.com/u/141139366?v=4",
        hero_kicker="Senior Software Engineer · Kigali, Rwanda",
        hero_phrases=["Building secure, scalable systems.", "Full-stack · AI/ML · security-first.", "Protecting 14M+ citizen records.", "Turning complex problems into clean code."],
        hero_intro="Software engineer specialising in secure full-stack systems, AI/ML integration and government-grade infrastructure. Currently building at Nexventures and protecting citizen data at the National Land Authority.",
        hero_primary_label="View my work", hero_primary_href="#projects",
        hero_secondary_label="Download CV", hero_secondary_href="/resume.pdf",
        resume_url="/resume.pdf",
        availability_text="Available for opportunities", available=True,
        metrics=[
            {"value": "3+", "label": "Years", "sub": "shipping production code"},
            {"value": "15+", "label": "Systems", "sub": "delivered end to end"},
            {"value": "4", "label": "Gov platforms", "sub": "secured nationwide"},
            {"value": "107+", "label": "Repositories", "sub": "on GitHub"},
        ],
        marquee=["FastAPI", "React", "TypeScript", "PostgreSQL", "Flutter", "Docker", "TensorFlow", "Linux", "Redis", "Hyperledger", "OWASP", "JWT", "Python", "Go"],
        live_sites=[{"label": "amakuru.lands.rw", "url": "https://amakuru.lands.rw"}, {"label": "safeland.rw", "url": "https://safeland.rw"}, {"label": "pro-rw.netlify.app", "url": "https://pro-rw.netlify.app/"}],
        social_links=[
            {"label": "GitHub", "url": "https://github.com/lscblack", "icon": "Github"},
            {"label": "LinkedIn", "url": "https://www.linkedin.com/in/christian-loue-sauveur/", "icon": "Linkedin"},
            {"label": "Email", "url": "mailto:louesauveur18@gmail.com", "icon": "Mail"},
        ],
        sections=SECTIONS, section_titles=SECTION_TITLES,
        contact_intro="Have a project, a research idea or a role in mind? Send a message and I will get back to you within a couple of days.",
        footer_text="Designed and engineered in Kigali, Rwanda.",
        theme=DEFAULT_THEME, fonts=DEFAULT_FONTS, effects=DEFAULT_EFFECTS,
    )


def _about() -> AboutContent:
    return AboutContent(
        id=1,
        name="Loue Sauveur Christian", role="Senior Software Engineer",
        headline="Building systems that protect people, not just data.",
        headline_highlight="protect people",
        bio=[
            "I am a software engineer with 3+ years building production systems across Rwanda's government, fintech and health sectors. I have encrypted national land registry data protecting millions of citizens, integrated AI models into mobile health apps and shipped payment infrastructure across borders — always with security designed in, not bolted on.",
            "I hold a B.Sc. in Software Engineering with a Machine Learning specialisation from the African Leadership University, awarded with First Class Honours (graduation 17 July 2027), earned while holding three parallel roles. Next: an MSc in Cybersecurity — driven by the conviction that defending digital infrastructure is the next frontier for Africa.",
        ],
        quote="Africa's digital future needs engineers who build things that are not only functional, but secure and trusted.",
        email="louesauveur18@gmail.com", phone="+250 790 110 231", location="Kigali, Rwanda",
        avatar_url="https://avatars.githubusercontent.com/u/141139366?v=4",
        gallery=["https://avatars.githubusercontent.com/u/141139366?v=4"],
        open_to=["MSc Cybersecurity programmes", "Research collaborations", "Engineering roles"],
        currently=[
            {"role": "Senior Software Engineer", "org": "Nexventures Ltd", "url": "https://nexventures.rw"},
            {"role": "Software Engineer Intern", "org": "National Land Authority", "url": "https://amakuru.lands.rw"},
            {"role": "Head Residential Advisor", "org": "African Leadership University", "url": "https://alueducation.com"},
        ],
        languages=["English", "French", "Kinyarwanda"],
        facts=[{"label": "Based in", "value": "Kigali, Rwanda"}, {"label": "Focus", "value": "Security · ML · Full-stack"}, {"label": "Degree", "value": "B.Sc. Software Engineering (ML) · First Class Honours"}],
    )


JOURNEY = [
    dict(year="2020", title="First lines of code", subtitle="A2 Computer Science & Mathematics", kind="education", icon="Terminal", location="Rwanda", description="Started the advanced-level programme in Computer Science and Mathematics and wrote my first real programs in C++ and Python.", tags=["C++", "Python", "Algorithms"]),
    dict(year="2022", title="A2 National Diploma", subtitle="Rwanda Education Board", kind="award", icon="GraduationCap", location="Kigali", description="Graduated with the top secondary qualification in Rwanda, already building small web apps for classmates and local businesses.", tags=["Mathematics", "Databases"]),
    dict(year="Nov 2022", title="Full-Stack Developer", subtitle="Grobal Growth Company", kind="work", icon="Briefcase", location="Kigali", description="Built Youth Home, a publishing and monetisation platform for African creators, integrated KPay and shipped an Android app to the Play Store.", tags=["PHP", "MySQL", "Android", "Payments"]),
    dict(year="Jan 2023", title="Web Development Coach", subtitle="CODEJIKA", kind="work", icon="Users", location="Kigali", description="Taught HTML, CSS, PHP and MySQL to young Rwandans — discovered how much I enjoy multiplying impact through teaching.", tags=["Teaching", "HTML", "CSS"]),
    dict(year="2023", title="Started B.Sc. Software Engineering", subtitle="African Leadership University", kind="education", icon="BookOpen", location="Kigali", description="Joined ALU for a Software Engineering degree with a Machine Learning specialisation.", tags=["ML", "Linux", "Security"]),
    dict(year="Jan 2024", title="Head Residential Advisor", subtitle="African Leadership University", kind="life", icon="Home", location="Kigali", description="Led a large residential community — crisis management, welfare programmes and strict handling of sensitive student data.", tags=["Leadership", "Data privacy"]),
    dict(year="Mar 2024", title="Software Engineer Intern", subtitle="National Land Authority", kind="work", icon="ShieldCheck", location="Kigali", link="https://amakuru.lands.rw", description="Architected end-to-end TLS and TOTP MFA for the national land information portal — now protecting 14M+ citizen records at amakuru.lands.rw.", tags=["React", "TLS", "MFA", "Linux"]),
    dict(year="2024", title="SafeLand Rwanda", subtitle="Blockchain land marketplace", kind="project", icon="Landmark", location="Kigali", link="https://safeland.rw", description="Designed a blockchain-backed real-estate marketplace integrated with LAIS, RDB, RRA and Irembo, with ML-powered valuation and fraud detection.", tags=["Hyperledger", "FastAPI", "Go", "ML"]),
    dict(year="Apr 2025", title="MERN & MySQL Trainer", subtitle="Church of God TTS", kind="work", icon="Presentation", location="Kigali", description="Delivered secure-coding focused MERN training: environment secrets, input sanitisation and SQL-injection prevention.", tags=["MERN", "Secure coding"]),
    dict(year="May 2025", title="Senior Software Engineer", subtitle="Nexventures Ltd", kind="work", icon="Rocket", location="Kigali", link="https://nexventures.rw", description="Leading web and mobile delivery with FastAPI, PostgreSQL, React and Flutter; secure APIs, CI/CD with security gates, AI/ML integration and IoT.", tags=["FastAPI", "Flutter", "AI/ML", "IoT"]),
    dict(year="Jul 2027", title="B.Sc. with First Class Honours", subtitle="African Leadership University", kind="award", icon="GraduationCap", location="Kigali", description="Graduating on 17 July 2027 with a B.Sc. in Software Engineering (Machine Learning specialisation), First Class Honours — and applying for MSc Cybersecurity programmes.", tags=["First Class Honours", "Machine Learning", "Cybersecurity"]),
]

EXPERIENCE = [
    dict(title="Senior Software Engineer", company="Nexventures Ltd", company_url="https://nexventures.rw", location="Kigali, Rwanda", period="May 2025 – Present", job_type="Full-time", current=True, bullets=["Led web and mobile app development using FastAPI, PostgreSQL, React and Flutter", "Designed secure RESTful APIs with JWT auth, input validation and rate limiting", "Integrated AI/ML models into production pipelines; evaluated adversarial robustness", "Implemented CI/CD pipelines with security gates and automated testing", "Contributed to IoT embedded systems (Arduino) with device authentication", "Mentored junior engineers on secure coding practices and OWASP Top 10"], tags=["FastAPI", "React", "Flutter", "PostgreSQL", "Docker", "AI/ML", "IoT"]),
    dict(title="Software Engineer Intern", company="National Land Authority (NLA)", company_url="https://amakuru.lands.rw", location="Kigali, Rwanda", period="Mar 2024 – Apr 2026", job_type="Internship", current=True, bullets=["Architected end-to-end TLS encryption protecting sensitive citizen land data nationwide", "Integrated Google Authenticator (TOTP-based MFA) for all administrative users", "Built responsive React + Redux Toolkit frontend for cross-device compatibility", "Hardened the Linux server environment applying the principle of least privilege", "Configured horizontal scaling to handle high-concurrency public traffic", "Deployed live at amakuru.lands.rw — accessible nationwide"], tags=["React", "Redux", "Linux", "MFA", "TLS", "Security", "Government"]),
    dict(title="Head Residential Advisor", company="African Leadership University", company_url="https://alueducation.com", location="Kigali, Rwanda", period="Jan 2024 – May 2026", job_type="Leadership", current=True, bullets=["Managed sensitive student data with strict institutional data-protection compliance", "Led crisis management and conflict resolution across a large residential community", "Developed and ran leadership programmes and student welfare initiatives"], tags=["Leadership", "Data privacy", "Crisis management"]),
    dict(title="MERN & MySQL Trainer", company="Church of God TTS – School of Development", location="Kigali, Rwanda", period="Apr – May 2025", job_type="Contract", bullets=["Delivered MERN stack training with secure coding best practices to S6 students", "Covered environment variables, input sanitisation and SQL-injection prevention"], tags=["Teaching", "MERN", "Secure coding"]),
    dict(title="Website Development Coach", company="CODEJIKA", location="Kigali, Rwanda", period="Jan – May 2023", job_type="Part-time", bullets=["Delivered hands-on web development instruction in HTML, CSS, PHP and MySQL", "Designed training sessions that improved learners' grasp of web fundamentals"], tags=["Coaching", "HTML", "CSS", "PHP"]),
    dict(title="Full-Stack Developer", company="Grobal Growth Company", location="Kigali, Rwanda", period="Nov 2022 – Nov 2023", job_type="Full-time", bullets=["Built Youth Home — publishing and monetisation platform for African creators", "Integrated KPay with secure PCI-compliant transaction flows", "Developed an Android WebView app in Java, published to the Google Play Store"], tags=["PHP", "MySQL", "Android", "Java", "Payments"]),
]

SKILLS = [
    dict(name="Security & DevOps", icon="ShieldCheck", skills=[{"name": "OWASP Top 10", "level": 92}, {"name": "JWT / OAuth 2.0", "level": 90}, {"name": "TLS / HTTPS", "level": 90}, {"name": "MFA / TOTP", "level": 88}, {"name": "Role-based access control", "level": 90}, {"name": "Linux hardening", "level": 75}, {"name": "Docker", "level": 74}, {"name": "CI/CD pipelines", "level": 72}, {"name": "AWS EC2 / DigitalOcean", "level": 68}, {"name": "Secrets management", "level": 70}, {"name": "Arduino IoT", "level": 45}], applied=[{"name": "NLA Land Information Portal", "url": "https://amakuru.lands.rw"}, {"name": "Afiacare Health System"}, {"name": "Afriton Cross-Border Payment"}, {"name": "SafeLand Rwanda", "url": "https://safeland.rw"}, {"name": "Nexventures production APIs"}]),
    dict(name="Backend", icon="Server", skills=[{"name": "FastAPI", "level": 94}, {"name": "REST API design", "level": 92}, {"name": "Django", "level": 72}, {"name": "Express / Node.js", "level": 72}, {"name": "PHP", "level": 70}, {"name": "GraphQL", "level": 45}], applied=[{"name": "Afiacare Health System (FastAPI)"}, {"name": "Afriton Payment API (FastAPI)"}, {"name": "BookHub Backend", "url": "https://github.com/lscblack/BookHub_Backend_fastapi"}, {"name": "Course Management System", "url": "https://github.com/lscblack/course_management_system_Nodejs_mysql_redis"}, {"name": "EcoTrack Rwanda (Django)"}]),
    dict(name="Frontend", icon="LayoutTemplate", skills=[{"name": "React", "level": 93}, {"name": "TypeScript", "level": 90}, {"name": "Tailwind CSS", "level": 92}, {"name": "Redux Toolkit", "level": 86}, {"name": "Vite", "level": 88}, {"name": "Vue.js", "level": 68}, {"name": "Framer Motion", "level": 74}], applied=[{"name": "NLA Land Portal (React + Redux)", "url": "https://amakuru.lands.rw"}, {"name": "SafeLand Rwanda", "url": "https://safeland.rw"}, {"name": "EcoTrack Rwanda"}, {"name": "Prov-Rwanda (React + Firebase)", "url": "https://pro-rw.netlify.app/"}, {"name": "This portfolio"}]),
    dict(name="Mobile", icon="Smartphone", skills=[{"name": "Flutter", "level": 76}, {"name": "React Native", "level": 70}, {"name": "Firebase", "level": 74}, {"name": "Expo", "level": 68}, {"name": "Android / Java", "level": 48}], applied=[{"name": "Fam Care App (Flutter)", "url": "https://github.com/lscblack/Famcare"}, {"name": "Medical Insurance Estimator (Flutter)"}, {"name": "Cholare La Lumiere (React Native)"}, {"name": "Youth Home Android"}]),
    dict(name="AI / ML", icon="BrainCircuit", skills=[{"name": "Pandas / NumPy", "level": 90}, {"name": "Jupyter", "level": 90}, {"name": "TensorFlow", "level": 72}, {"name": "scikit-learn", "level": 74}, {"name": "Deep learning / CNN", "level": 70}, {"name": "NLP", "level": 50}, {"name": "Adversarial ML", "level": 45}], applied=[{"name": "RwandaCropGuard (TensorFlow CNN)"}, {"name": "Urban Sound Classifier", "url": "https://github.com/lscblack/Urban_Voice_classifier"}, {"name": "AfriTon Chatbot (NLP)", "url": "https://github.com/lscblack/AfriTon-chatbot"}, {"name": "Time-Series Forecasting", "url": "https://github.com/lscblack/Time-Series-Forecasting"}]),
    dict(name="Languages", icon="Code2", skills=[{"name": "Python", "level": 95}, {"name": "JavaScript", "level": 92}, {"name": "TypeScript", "level": 90}, {"name": "SQL", "level": 90}, {"name": "Shell", "level": 72}, {"name": "PHP", "level": 70}, {"name": "Dart", "level": 68}, {"name": "Go", "level": 50}, {"name": "C / C++", "level": 45}, {"name": "Java", "level": 45}], applied=[{"name": "Python: Afiacare, ML pipelines, EcoTrack"}, {"name": "TypeScript: NLA Portal, SafeLand", "url": "https://github.com/lscblack/Safe_Land_Rwanda"}, {"name": "Dart: Fam Care", "url": "https://github.com/lscblack/Famcare"}, {"name": "Go: OrganiChain chaincode", "url": "https://github.com/lscblack/OrganiChain"}]),
    dict(name="Databases", icon="Database", skills=[{"name": "PostgreSQL", "level": 92}, {"name": "MySQL", "level": 90}, {"name": "MongoDB", "level": 72}, {"name": "Firebase Firestore", "level": 72}, {"name": "Redis", "level": 55}], applied=[{"name": "PostgreSQL: Afiacare, Afriton, NLA Portal"}, {"name": "MySQL: Course Management", "url": "https://github.com/lscblack/course_management_system_Nodejs_mysql_redis"}, {"name": "MongoDB: Inventory System"}, {"name": "Firebase: Prov-Rwanda, Fam Care"}]),
    dict(name="Tools", icon="Wrench", skills=[{"name": "Git / GitHub", "level": 94}, {"name": "Postman", "level": 90}, {"name": "Linux CLI", "level": 90}, {"name": "VS Code", "level": 92}, {"name": "GitLab", "level": 70}, {"name": "Figma", "level": 68}, {"name": "Google Colab", "level": 72}], applied=[{"name": "GitHub: 107+ repositories", "url": "https://github.com/lscblack"}, {"name": "Figma: NLA Portal UI/UX"}, {"name": "Postman: API testing for Afiacare and Afriton"}, {"name": "Linux: NLA deployment and hardening"}]),
]

PROJECTS = [
    dict(title="NLA Land Information Portal", featured=True, role="Security & frontend engineer", year="2024", description="Rwanda's national land information system protecting 14M+ citizen records with end-to-end TLS, Google Authenticator MFA and horizontal scaling.", technologies=["React", "Redux Toolkit", "Linux", "MFA", "TLS"], categories=["Web", "Security"], live_url="https://amakuru.lands.rw", highlights=["14M+ records protected", "TOTP MFA for every admin", "Nationwide availability"]),
    dict(title="SafeLand Rwanda", featured=True, role="Architect & lead engineer", year="2024", description="National digital real-estate marketplace — blockchain-backed parcel records integrated with LAIS, RDB, RRA and Irembo; ML-powered valuation and fraud detection; multilingual for citizens, agents and government.", technologies=["Hyperledger Fabric", "FastAPI", "Go", "React", "Flutter", "PostgreSQL", "Redis", "ML"], categories=["Web", "Security", "Blockchain"], live_url="https://safeland.rw", github_url="https://github.com/lscblack/Safe_Land_Rwanda", highlights=["Blockchain parcel ledger", "ML valuation + fraud detection", "RW / EN / FR"]),
    dict(title="Prov-Rwanda", featured=True, role="Creator", year="2023", description="Live civic platform helping Rwandans pass the driving theory permit exam — quizzes, traffic rule guides and study resources.", technologies=["React", "Firebase"], categories=["Web", "Open Source"], live_url="https://pro-rw.netlify.app/", github_url="https://github.com/lscblack", highlights=["Thousands of learners", "Free and open"]),
    dict(title="Afriton Cross-Border Payment", year="2024", description="Pan-African unified payment system with encrypted transaction flows and fraud prevention.", technologies=["React", "FastAPI", "PostgreSQL"], categories=["Web", "Security"], github_url="https://github.com/lscblack"),
    dict(title="Afiacare Health System", year="2024", description="Patient health record platform with encrypted storage and OWASP-compliant API endpoints.", technologies=["FastAPI", "React", "Vite", "PostgreSQL"], categories=["Web", "Security"], github_url="https://github.com/lscblack"),
    dict(title="EcoTrack Rwanda", year="2024", description="Smart waste management for households, collectors and admins with real-time route optimisation.", technologies=["React", "Django", "Google Maps API"], categories=["Web"], github_url="https://github.com/lscblack"),
    dict(title="RwandaCropGuard", year="2024", description="Deep learning pipeline classifying crop diseases from leaf images.", technologies=["TensorFlow", "Python"], categories=["AI / ML"], github_url="https://github.com/lscblack"),
    dict(title="Urban Sound Classifier", year="2024", description="ML pipeline for urban sound classification — audio feature extraction and multi-class modelling.", technologies=["scikit-learn", "Python"], categories=["AI / ML"], github_url="https://github.com/lscblack/Urban_Voice_classifier"),
    dict(title="Medical Insurance Estimator", year="2024", description="Privacy-preserving mobile ML app estimating medical costs with on-device inference.", technologies=["Flutter", "Firebase"], categories=["Mobile", "AI / ML"], github_url="https://github.com/lscblack"),
    dict(title="Fam Care App", year="2023", description="Family healthcare management — health records, appointments and family member profiles.", technologies=["Flutter", "Firebase"], categories=["Mobile"], github_url="https://github.com/lscblack/Famcare"),
    dict(title="Cholare La Lumiere", year="2023", description="Mobile app for managing and enjoying the choir's songs with audio playback.", technologies=["React Native", "Expo", "Firebase"], categories=["Mobile", "Open Source"], github_url="https://github.com/lscblack"),
    dict(title="Inventory Management System", year="2023", description="Full-stack inventory tracking with real-time stock updates, reporting and user roles.", technologies=["React", "Node.js", "Express", "MongoDB"], categories=["Web"], github_url="https://github.com/lscblack"),
    dict(title="Youth Home Platform", year="2022", description="Publishing and monetisation platform for African writers and artists with integrated KPay.", technologies=["PHP", "MySQL", "Bootstrap"], categories=["Web"], github_url="https://github.com/lscblack"),
    dict(title="OrganiChain", year="2024", description="Transparent organ donation system using Hyperledger Fabric and a Go backend.", technologies=["Hyperledger Fabric", "Go", "TypeScript"], categories=["Web", "Security", "Blockchain"], github_url="https://github.com/lscblack/OrganiChain"),
    dict(title="AfriTon Chatbot", year="2024", description="Conversational AI chatbot tailored for African languages and contexts using NLP.", technologies=["Python", "NLP", "Jupyter"], categories=["AI / ML"], github_url="https://github.com/lscblack/AfriTon-chatbot"),
]

EDUCATION = [
    dict(period="2023 – 2027", kind="degree", title="B.Sc. Software Engineering", subtitle="Machine Learning specialisation · First Class Honours", org="African Leadership University", location="Kigali, Rwanda", note="Bachelor of Science in Software Engineering with a specialisation in Machine Learning, awarded with First Class Honours. Graduation: 17 July 2027. Coursework: Linux, web development & security, databases, algorithms, mobile development, machine learning.", tags=["Linux", "Security", "Databases", "Algorithms", "Mobile", "ML"], status="First Class Honours"),
    dict(period="2020 – 2022", kind="diploma", title="A2 National Diploma", subtitle="Computer Science & Mathematics", org="Rwanda Education Board", location="Kigali, Rwanda", note="Advanced level — the top secondary qualification in Rwanda.", tags=["C++", "Python", "Algorithms", "Mathematics"], status="Completed"),
]

CERTS = [
    dict(title="Data Science Short Course", issuer="Stanford University (Prof. Jennifer Widom)", url="https://drive.google.com/file/d/1KwNCV12SIs_1YLbxTr1XPv8uEDlAP_TZ/view?usp=sharing"),
    dict(title="Applied Unsupervised Learning in Python", issuer="University of Michigan", grade="100%", url="https://drive.google.com/file/d/1FoE-09df7BoG2_qUINQgo8fcjKSwHLBk/view?usp=drive_link"),
    dict(title="Flutter & Dart: iOS, Android & Mobile Apps", issuer="IBM", grade="100%", url="https://drive.google.com/file/d/16WenQo_bBnnxZHUc2zN4tYELxgib-iog/view?usp=drive_link"),
    dict(title="Getting Started with R", issuer="Coursera", grade="100%", url="https://drive.google.com/file/d/19CS0P2JG-KsCkCZnvkDPjA_h3XZO2L2b/view?usp=sharing"),
    dict(title="Introduction to Academic Writing", issuer="O.P. Jindal Global University", grade="100%", url="https://drive.google.com/file/d/1oBwwj2uTWI7YblQlvSiddDC4HxsY-P5O/view?usp=sharing"),
]

ACTIVITIES = [
    dict(label="Piano", icon="Piano", quote="Debugging in music — finding harmony in complexity, one key at a time."),
    dict(label="Guitar", icon="Guitar", quote="From classical fingerpicking to African rhythms. Improvisation outside of code."),
    dict(label="Dancing", icon="Zap", quote="Movement is a universal language. Keeps me present, energised, connected to culture."),
    dict(label="Running", icon="Footprints", quote="Early morning runs are where I process problems. Most breakthroughs happen mid-run."),
    dict(label="Reading", icon="BookOpen", quote="Tech, philosophy, African literature. Reading is how I stay curious beyond my discipline."),
    dict(label="Mentoring youth", icon="Users", quote="Teaching web development to young Rwandans. Sharing knowledge multiplies impact."),
    dict(label="Community", icon="Globe", quote="Building inclusive communities as Head RA — a skill I carry into every team."),
    dict(label="Faith", icon="Heart", quote="Keeps me grounded, purposeful and focused on work that genuinely serves others."),
]

INTERESTS = [
    dict(title="Cybersecurity & secure systems", icon="ShieldCheck", items=["Application & API security", "Cryptographic protocols and TLS internals", "Zero-trust architecture", "AI security & adversarial ML", "Cybersecurity in African digital infrastructure"]),
    dict(title="Artificial intelligence", icon="BrainCircuit", items=["Deep learning for agriculture & health", "Privacy-preserving ML — federated learning, differential privacy", "NLP in African languages", "AI safety & responsible deployment"]),
    dict(title="Software architecture", icon="Boxes", items=["Distributed systems & microservices", "Event-driven architecture", "High-availability infrastructure design", "Open source & developer tooling"]),
    dict(title="African tech ecosystem", icon="Globe", items=["Trusted digital infrastructure across Africa", "Fintech innovation & cross-border payments", "AgriTech & climate tech", "Digital policy & data sovereignty"]),
    dict(title="Research", icon="FlaskConical", items=["Secure software development methodologies", "Threat modelling & formal security analysis", "Human factors in cybersecurity", "IoT device security"]),
    dict(title="Creative & cultural", icon="Palette", items=["African music theory & composition", "Technology x African culture", "Literature from the continent", "Community-led technology education"]),
]


def _fill(session: Session, model, rows: list[dict]) -> None:
    if session.exec(select(model).limit(1)).first() is not None:
        return
    for i, row in enumerate(rows):
        obj = model(**row)
        if hasattr(obj, "order"):
            obj.order = i
        session.add(obj)
    log.info("Seeded %s (%d rows)", model.__tablename__, len(rows))


def seed() -> None:
    with Session(engine) as s:
        if s.get(SiteSettings, 1) is None:
            s.add(_site_settings()); log.info("Seeded site settings")
        if s.get(AboutContent, 1) is None:
            s.add(_about()); log.info("Seeded about")
        _fill(s, JourneyMilestone, JOURNEY)
        _fill(s, ExperienceItem, EXPERIENCE)
        _fill(s, SkillCategory, SKILLS)
        _fill(s, Project, PROJECTS)
        _fill(s, EducationItem, EDUCATION)
        _fill(s, Certification, CERTS)
        _fill(s, ActivityItem, ACTIVITIES)
        _fill(s, InterestItem, INTERESTS)
        s.commit()

        if s.exec(select(AdminUser).limit(1)).first() is None:
            pw = settings.DEFAULT_ADMIN_PASSWORD
            if not pw:
                import secrets
                pw = secrets.token_urlsafe(12)
                log.warning("DEFAULT_ADMIN_PASSWORD not set — generated one-time password for %s: %s", settings.DEFAULT_ADMIN_EMAIL, pw)
            s.add(AdminUser(email=settings.DEFAULT_ADMIN_EMAIL.lower().strip(), name=settings.DEFAULT_ADMIN_NAME, password_hash=hash_password(pw)))
            s.commit()
            log.info("Created administrator %s", settings.DEFAULT_ADMIN_EMAIL)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    from .db.session import ensure_database, init_db
    ensure_database(); init_db(); seed()
