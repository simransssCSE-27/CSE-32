import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Atom,
  Award,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileText,
  GraduationCap,
  Lightbulb,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

import subjectNoteFiles from "virtual:subject-notes";
import questionPaperFiles from "virtual:question-papers";

const questionPaperMeta = {
  "25AI101.pdf": ["Artificial Intelligence", "25AI01"],
  "25AS101.pdf": ["Applied Science", "25AS01"],
  "25AS102.pdf": ["Applied Physics", "25AS02"],
  "25AS103.pdf": ["Applied Chemistry", "25AS03"],
  "25CS101.pdf": ["Computer Science", "25CS01"],
  "25EC101.pdf": ["Electronics", "25EC01"],
  "25EL101.pdf": ["Electrical Engineering", "25EL01"],
  "25HU101.pdf": ["Human Values", "25HU01"],
  "25HU102.pdf": ["Communication Skills", "25HU02"],
  "25ME101.pdf": ["Mechanical Engineering", "25ME01"],
};

const questionPapers = questionPaperFiles
  .filter((resource) => /\.pdf$/i.test(resource.file))
  .map((resource) => {
    const [name, code] = questionPaperMeta[resource.file] || [
      resource.file.replace(/\.pdf$/i, "").replace(/[_-]+/g, " "),
      "ABES",
    ];
    return {
      name,
      file: resource.file,
      code,
      relativePath: resource.relativePath,
    };
  });

const subjectMeta = {
  "Design Thinking": [Lightbulb, "25HU102"],
  DSA: [Code2, "25CS101"],
  Electronics: [Cpu, "25EC101"],
  FSD: [Code2, "25CS102"],
  MATHS: [Atom, "25AS101"],
  Mechanics: [Zap, "25ME101"],
  "soft skill": [Brain, "25HU101"],
};

const quickLinks = [
  [
    "Student Portal",
    "https://erp.abes.ac.in/Login.aspx",
    GraduationCap,
  ],
  [
    "Academic Calendar",
    "https://www.abes.ac.in/Academic-Calender.html",
    CalendarDays,
  ],
  [
    "Admissions",
    "https://www.abes.ac.in/courses-offered.html",
    BookOpen,
  ],
  [
    "Results",
    "https://lustrous-kataifi-f8a3c4.netlify.app/",
    Award,
  ],
];

/* --------------------------------------------------
   LIVE BACKGROUND
-------------------------------------------------- */

function LiveWallpaper() {
  useEffect(() => {
    const canvas = document.querySelector(".live-wallpaper");

    if (!canvas) return;

    const context = canvas.getContext("2d");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const stars = Array.from({ length: 150 }, (_, index) => ({
      x: (index * 83) % 1000,
      y: (index * 137) % 700,
      radius:
        index % 9 === 0
          ? 1.7
          : 0.6 + (index % 4) * 0.25,
      speed: 0.08 + (index % 6) * 0.025,
      phase: index * 0.7,
    }));

    let frame;
    let width = 0;
    let height = 0;
    let time = 0;

    function resize() {
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );
    }

    function draw() {
      time += 0.012;

      /* Background */
      const background =
        context.createLinearGradient(
          0,
          0,
          width,
          height
        );

      background.addColorStop(0, "#061522");
      background.addColorStop(0.52, "#09283b");
      background.addColorStop(1, "#04121e");

      context.fillStyle = background;
      context.fillRect(
        0,
        0,
        width,
        height
      );

      /* Cyan glow */
      const cyanGlow =
        context.createRadialGradient(
          width *
            (0.25 + Math.sin(time) * 0.08),
          height * 0.2,
          0,
          width * 0.25,
          height * 0.2,
          width * 0.55
        );

      cyanGlow.addColorStop(
        0,
        "rgba(0, 220, 255, .48)"
      );

      cyanGlow.addColorStop(
        1,
        "rgba(0, 220, 255, 0)"
      );

      context.fillStyle = cyanGlow;
      context.fillRect(
        0,
        0,
        width,
        height
      );

      /* Blue glow */
      const blueGlow =
        context.createRadialGradient(
          width *
            (0.82 +
              Math.cos(time * 0.8) * 0.1),
          height * 0.25,
          0,
          width * 0.82,
          height * 0.25,
          width * 0.48
        );

      blueGlow.addColorStop(
        0,
        "rgba(47, 131, 255, .34)"
      );

      blueGlow.addColorStop(
        1,
        "rgba(47, 131, 255, 0)"
      );

      context.fillStyle = blueGlow;
      context.fillRect(
        0,
        0,
        width,
        height
      );

      /* Stars */
      stars.forEach((star) => {
        const x =
          (star.x / 1000) * width;

        const y =
          (((star.y +
            time *
              star.speed *
              100) %
            800) /
            800) *
          height;

        const pulse =
          0.45 +
          Math.abs(
            Math.sin(
              time * 2 +
                star.phase
            )
          ) *
            0.55;

        context.beginPath();

        context.arc(
          x,
          y,
          star.radius,
          0,
          Math.PI * 2
        );

        context.fillStyle = `rgba(153, 242, 255, ${pulse})`;

        context.fill();
      });

      if (!reduceMotion) {
        frame =
          requestAnimationFrame(draw);
      }
    }

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    draw();

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  return (
    <canvas
      className="live-wallpaper"
      aria-hidden="true"
    />
  );
}

/* --------------------------------------------------
   SUBJECT GROUPING
-------------------------------------------------- */

function subjectGroups() {
  return subjectNoteFiles.reduce(
    (groups, resource) => {
      groups[resource.subject] ||= {};

      groups[resource.subject][
        resource.folder
      ] ||= [];

      groups[resource.subject][
        resource.folder
      ].push(resource);

      return groups;
    },
    {}
  );
}

/* --------------------------------------------------
   GREETING
-------------------------------------------------- */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Heyyyy";
}

/* --------------------------------------------------
   LOCAL RESOURCE
-------------------------------------------------- */

function LocalResource({
  name,
  file,
  folder,
  onOpen,
}) {
  const encodedFolder = folder
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

  const pdfUrl = `/resources/${encodedFolder}/${encodeURIComponent(file)}`;

  return (
    <button
      className="resource-row scroll-reveal resource-button"
      type="button"
      onClick={() => onOpen(pdfUrl, name || file)}
    >
      <span className="resource-icon">
        <FileText size={18} />
      </span>

      <span className="resource-name">
        {name}
      </span>

      <span className="resource-file">
        {file}
      </span>

      <ArrowUpRight size={17} />
    </button>
  );
}

function PdfViewer({ file, title, onClose }) {
  if (!file) return null;

  return (
    <div
      className="pdf-viewer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title || "PDF viewer"}
    >
      <div className="pdf-viewer">
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <FileText size={18} />
            <span>{title || "PDF Document"}</span>
          </div>

          <div className="pdf-viewer-actions">
            <a
              className="pdf-download"
              href={file}
              download
            >
              Download
            </a>

            <button
              type="button"
              className="pdf-close"
              onClick={onClose}
              aria-label="Close PDF viewer"
            >
              Close
            </button>
          </div>
        </div>

        <iframe
          className="pdf-frame"
          src={file}
          title={title || "PDF Document"}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------
   MAIN APP
-------------------------------------------------- */

export default function App() {
  const [openSubject, setOpenSubject] =
    useState(null);

  const [pdfViewer, setPdfViewer] = useState(null);

  const [query, setQuery] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("papers");

  const groups = useMemo(
    () => subjectGroups(),
    []
  );

  const groupEntries =
    Object.entries(groups);

  /* Filter question papers */
  const filteredPapers =
    questionPapers.filter(
      (paper) =>
        `${paper.name} ${paper.file} ${paper.code}`
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );

  /* Filter subjects */
  const filteredSubjects =
    groupEntries.filter(
      ([subject, folders]) =>
        `${subject} ${Object.values(
          folders
        )
          .flat()
          .map((file) => file.file)
          .join(" ")}`
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );

  /* Scroll reveal */
  useEffect(() => {
    const elements =
      document.querySelectorAll(
        ".scroll-reveal"
      );

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "is-visible"
                );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.12,
        }
      );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () =>
      observer.disconnect();
  }, [
    openSubject,
    activeTab,
    query,
  ]);

  return (
    <div className="abes-app">

      {/* BACKGROUND */}
      <LiveWallpaper />

    <header className="simple-header">
  <a
    className="brand"
    href="#top"
    aria-label="ABES home"
  >
    <img
      src="/abes-logo.webp"
      alt="ABES Engineering College logo"
      className="abes-logo"
    />
  </a>

  <div className="campus-info">
    <span>Established 2000</span>
    <span>Autonomous since 2025</span>
    <span>Ghaziabad, Delhi NCR</span>
  </div>

  <nav className="official-links">
    <a
      className="portal-link"
      href="https://erp.abes.ac.in/Login.aspx"
      target="_blank"
      rel="noreferrer"
    >
      Student Portal
    </a>

    <a
      href="https://www.abes.ac.in/"
      target="_blank"
      rel="noreferrer"
    >
      Official site
    </a>

    <a
      href="https://www.abes.ac.in/courses-offered.html"
      target="_blank"
      rel="noreferrer"
    >
      Admissions
    </a>

    <a
      href="https://www.abes.ac.in/Academic-Calender.html"
      target="_blank"
      rel="noreferrer"
    >
      Calendar
    </a>

    <a
      href="https://www.abes.ac.in/placement.html"
      target="_blank"
      rel="noreferrer"
    >
      Placements
    </a>

    <a
      href="https://lustrous-kataifi-f8a3c4.netlify.app/"
      target="_blank"
      rel="noreferrer"
    >
      Results
    </a>
  </nav>
</header>

      {/* STUDENT STRIP */}
      <div className="student-strip">
        <strong>
          {getGreeting()}, Ready to make today count?
        </strong>

        <span>
          Everything you need for your semester,
          in one place.
        </span>
      </div>

      {/* MAIN */}
      <main
        className="resource-page"
        id="top"
      >

        {/* HERO */}
        <section className="dashboard-hero">

          <div>

            <p className="eyebrow">
              <Sparkles size={14} />

              YOUR SEMESTER, ORGANISED
            </p>

            <h1>
              One place..
              <br />
              <em>
                Every resource..
              </em>
            </h1>

            <p className="hero-copy">
              Find your papers, notes, results,
              and study material without losing
              your flow.
            </p>

          </div>

          <div className="status-chips">

            <span>
              First Year
            </span>

            <span>
              2025–26
            </span>

            <span>
              {groupEntries.length} Subjects
            </span>

          </div>

        </section>

        {/* SEARCH + QUICK LINKS */}
        <section className="study-tools">

          <label className="search-field">

            <Search size={18} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search subjects, notes, papers..."
              aria-label="Search subjects, notes, and papers"
            />

          </label>

          <div className="quick-links">

            {quickLinks.map(
              ([
                label,
                url,
                Icon,
              ]) => (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  key={label}
                >
                  <Icon size={16} />

                  {label}

                  <ArrowUpRight
                    size={13}
                  />
                </a>
              )
            )}

          </div>

        </section>

        {/* ==================================================
            TABS
        ================================================== */}

        <div
          className="resource-tabs"
          role="tablist"
        >

          {/* QUESTION PAPERS */}
          <button
            className={
              activeTab ===
              "papers"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "papers"
              )
            }
            role="tab"
            aria-selected={
              activeTab ===
              "papers"
            }
            type="button"
          >
            <FileText size={16} />

            Question Papers
          </button>

          {/* SUBJECT NOTES */}
          <button
            className={
              activeTab ===
              "notes"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "notes"
              )
            }
            role="tab"
            aria-selected={
              activeTab ===
              "notes"
            }
            type="button"
          >
            <BookOpen size={16} />

            Subject Notes
          </button>

          {/* RESULTS */}
          <button
            className={
              activeTab ===
              "results"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "results"
              )
            }
            role="tab"
            aria-selected={
              activeTab ===
              "results"
            }
            type="button"
          >
            <Award size={16} />

            Results
          </button>

        </div>

        {/* ==================================================
            QUESTION PAPERS
        ================================================== */}

        {activeTab ===
          "papers" && (
          <section
            className="resource-section scroll-reveal"
            id="question-papers"
          >

            <div className="section-title">

              <span className="section-number">
                01
              </span>

              <div>

                <p className="eyebrow">
                  2025–26 · ODD SEMESTER
                </p>

                <h2>
                  Question Papers
                </h2>

                <p>
                  End-term papers arranged
                  by subject.
                </p>

              </div>

              <span className="section-total">
                {
                  filteredPapers.length
                }{" "}
                papers
              </span>

            </div>

            <div className="resource-list">

              {filteredPapers.map(
                (
                  paper,
                  index
                ) => (
                  <button
                    className="resource-row scroll-reveal resource-button"
                    type="button"
                    onClick={() =>
                      setPdfViewer({
                        file: `/resources/question-papers/${paper.relativePath
                          .split("/")
                          .filter(Boolean)
                          .map((part) => encodeURIComponent(part))
                          .join("/")}`,
                        title: paper.name,
                      })
                    }
                    key={paper.relativePath}
                  >

                    <span
                      className={`resource-icon tone-${
                        index % 6
                      }`}
                    >
                      <FileText
                        size={18}
                      />
                    </span>

                    <span className="resource-name">

                      <strong>
                        {paper.name}
                      </strong>

                      <small>
                        {paper.code} · question paper
                      </small>

                    </span>

                    <ArrowUpRight
                      size={17}
                    />

                  </button>
                )
              )}

            </div>

            {!filteredPapers.length && (
              <p className="empty-state">
                No paper matches
                “{query}”.
              </p>
            )}

          </section>
        )}

        {/* ==================================================
            SUBJECT NOTES
        ================================================== */}

        {activeTab ===
          "notes" && (
          <section
            className="resource-section scroll-reveal"
            id="subject-notes"
          >

            <div className="section-title">

              <span className="section-number">
                02
              </span>

              <div>

                <p className="eyebrow">
                  REVISION MATERIAL
                </p>

                <h2>
                  Subject Notes
                </h2>

                <p>
                  Open a subject to see
                  all its units and PDFs.
                </p>

              </div>

              <span className="section-total">
                {
                  subjectNoteFiles.length
                }{" "}
                resources
              </span>

            </div>

            <div className="notes-subjects">

              {filteredSubjects.map(
                (
                  [
                    subject,
                    folders,
                  ],
                  index
                ) => {

                  const isOpen =
                    openSubject ===
                    subject;

                  const [
                    Icon,
                    code,
                  ] =
                    subjectMeta[
                      subject
                    ] ||
                    [
                      FileText,
                      "ABES",
                    ];

                  const count =
                    Object.values(
                      folders
                    )
                      .flat()
                      .length;

                  return (
                    <article
                      className={`notes-subject ${
                        isOpen
                          ? "is-open"
                          : ""
                      }`}
                      key={subject}
                    >

                      <button
                        className="subject-toggle"
                        type="button"
                        aria-expanded={
                          isOpen
                        }
                        onClick={() =>
                          setOpenSubject(
                            isOpen
                              ? null
                              : subject
                          )
                        }
                      >

                        <span>

                          <span className="subject-index">
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span
                            className={`subject-icon tone-${
                              index %
                              6
                            }`}
                          >
                            <Icon
                              size={19}
                            />
                          </span>

                          <span>

                            <h3>
                              {subject}
                            </h3>

                            <small>
                              {code} ·{" "}
                              {count}{" "}
                              study
                              materials
                            </small>

                          </span>

                        </span>

                        <span className="subject-action">

                          {isOpen
                            ? "Close"
                            : "Explore"}

                          <ChevronRight
                            size={16}
                          />

                        </span>

                      </button>

                      {isOpen && (
                        <div className="subject-content">

                          {Object.entries(
                            folders
                          ).map(
                            (
                              [
                                folder,
                                resources,
                              ]
                            ) => (
                              <div
                                className="notes-folder"
                                key={
                                  folder
                                }
                              >

                                <h4>
                                  {folder}
                                </h4>

                                <div className="resource-list">

                                  {resources.map(
                                    (
                                      resource
                                    ) => (
                                      <LocalResource
                                        key={
                                          resource.relativePath
                                        }
                                        name={
                                          resource.file
                                        }
                                        file={
                                          resource.file
                                        }
                                        folder={`subject-notes/${resource.relativePath
                                          .split(
                                            "/"
                                          )
                                          .slice(
                                            0,
                                            -1
                                          )
                                          .join(
                                            "/"
                                          )}`}
                                        onOpen={(file, title) =>
                                          setPdfViewer({
                                            file,
                                            title,
                                          })
                                        }
                                      />
                                    )
                                  )}

                                </div>

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </article>
                  );
                }
              )}

            </div>

            {!filteredSubjects.length && (
              <p className="empty-state">
                No subject matches
                “{query}”.
              </p>
            )}

          </section>
        )}

        {/* ==================================================
            RESULTS
        ================================================== */}

        {activeTab ===
          "results" && (
          <section
            className="resource-section results-section scroll-reveal"
            id="results"
          >

            <div className="section-title">

              <span className="section-number">
                03
              </span>

              <div>

                <p className="eyebrow">
                  ACADEMIC PERFORMANCE
                </p>

                <h2>
                  Results
                </h2>

                <p>
                  Access your academic
                  results through the
                  official ABES EduNova
                  dashboard.
                </p>

              </div>

              <span className="section-total">
                Official Portal
              </span>

            </div>

            <div className="results-grid">

              {/* MAIN RESULT CARD */}
              <article className="result-main-card">

                <div className="result-icon">
                  <Award
                    size={28}
                  />
                </div>

                <div className="result-card-content">

                  <p className="result-label">
                    ABES EDUNOVA · INSYNC
                  </p>

                  <h3>
                    Check Your Result
                  </h3>

                  <p>
                    View your academic
                    performance, semester
                    results and related
                    information through
                    the official ABES
                    EduNova InSync
                    dashboard.
                  </p>

                  <a
                    className="result-button"
                    href="https://lustrous-kataifi-f8a3c4.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Results Dashboard

                    <ArrowUpRight
                      size={16}
                    />
                  </a>

                </div>

              </article>

              {/* INFO CARD 1 */}
              <article className="result-info-card">

                <CheckCircle2
                  size={24}
                />

                <div>

                  <h3>
                    Official ABES Dashboard
                  </h3>

                  <p>
                    This button takes you
                    directly to the ABES
                    AI EduNova InSync
                    dashboard.
                  </p>

                </div>

              </article>

              {/* INFO CARD 2 */}
              <article className="result-info-card">

                <GraduationCap
                  size={24}
                />

                <div>

                  <h3>
                    Academic Performance
                  </h3>

                  <p>
                    Use the official
                    dashboard to access
                    your academic result
                    and performance
                    information.
                  </p>

                </div>

              </article>

            </div>

          </section>
        )}

      </main>

      {pdfViewer && (
        <PdfViewer
          file={pdfViewer.file}
          title={pdfViewer.title}
          onClose={() => setPdfViewer(null)}
        />
      )}

      {/* FOOTER */}
      <footer>
        Thoughtfully Designed · Carefully Built ·
        Simran Yadav · 2nd year
      </footer>

    </div>
  );
}