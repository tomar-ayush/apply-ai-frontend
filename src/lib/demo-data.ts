import { JobStatus } from "@/types/enums";
import type { JobResponse, JobJDResponse, ReferralResponse } from "@/types/api";

export const DEMO_JOB: JobResponse = {
  id: "demo",
  status: JobStatus.JD_PARSED,
  referral_received: false,
  user_id: "demo-user",
  workday_url: "https://tiket.com/careers/job",
  optimized_resume_pdf_url: null,
  optimized_resume_latex_url: null,
  created_at: "2026-08-02T09:48:11.547087Z",
  updated_at: "2026-08-02T09:48:11.547087Z",
};

export const DEMO_JOBS_LIST = [
  {
      id: "d149cb00-30da-4046-b609-8559e07c79b5",
      user_id: "demo-user",
      workday_url: "https://bebetta.keka.com/careers/jobdetails/82566",
      status: "JD_PARSED",
      referral_received: false,
      optimized_resume_pdf_url: "https://de1078ce883f7a27214ee81447cd9fea.r2.cloudflarestorage.com/resume/slot_3.pdf",
      optimized_resume_latex_url: "https://de1078ce883f7a27214ee81447cd9fea.r2.cloudflarestorage.com/resume/slot_3.tex",
      created_at: "2026-08-09T08:48:50.777426Z",
      updated_at: "2026-08-09T09:23:54.291339Z",
      company: "BeBetta",
      role: "Junior Software Engineer - (Backend - Golang)",
      workday_job_id: null
  },
  {
      id: "demo",
      user_id: "demo-user",
      workday_url: "https://tiketdotcom.wd3.myworkdayjobs.com/Tiket_Careers/job/Jakarta-Indonesia/Software-Engineer-I_R-3221?source=LinkedIn",
      status: "JD_PARSED",
      referral_received: false,
      optimized_resume_pdf_url: null,
      optimized_resume_latex_url: null,
      created_at: "2026-08-02T09:52:57.779090Z",
      updated_at: "2026-08-02T09:52:57.779090Z",
      company: "tiket.com",
      role: "Software Engineer",
      workday_job_id: null
  }
];

export const DEMO_JD = {
  id: "ab35f151-eeaa-40a4-9e5c-86deb31fa9ff",
  job_id: "demo",
  company: "tiket.com",
  role: "Software Engineer",
  workday_job_id: null,
  raw_text: "We think you also hate when travel app is giving you a headache, right? A slight misinformation can ruin the trip. That is exactly what we are tackling as t-fam! Making sure that our 50+ million users have the best experience in crafting their own adventure. Your main duties in flying with us : Write good quality code. Design system that will delight our customers. Architect systems with super stringent SLAs like 99%ile of API latencies < 50 millisec, 4 9’s of availability. Design, test, evaluate and build new features into the app/backend and also improve them. Mandatory belongings that you must prepare : 0-2 years of relevant work experience Experienced in using Java or Golang Strong analytical skills and aptitude. Understanding of data architecture, software design and best coding practices. Think horizontal scale more than vertical scale. Basic understanding of RDBMS or NoSQL - comfortable writing queries and understanding schemas, though not expected to independently design indexing strategies. Willingness to learn log analysis and debugging techniques under guidance. Collaborative mindset - receptive to feedback, comfortable working closely with senior engineers and cross-functional teams (Product, QA). Strong sense of ownership - takes responsibility for the delivery end to end; ensuring quality and completion of assigned tasks. Comfortable using AI tools (e.g., GitHub Copilot, Claude Code, Cursor, ChatGPT) to support coding and learning. In the event that you haven’t received any updates after 3 weeks, your data will be kept and we may contact you for another career destination. Meanwhile, discover more about tiket.com on Instagram, LinkedIn, or YouTube. tiket.com is the pioneer of online travel agent (OTA) in Indonesia established in 2011. tiket.com is one of the largest and most comprehensive online travel companies in Indonesia, offering a full spectrum of travel products and services core to the travel experience, ranging from flights, ground transport, accommodations, attractions, activities, event ticketing, and travel essentials. tiket.com’s mission is to accommodate the best access for online travel booking through web and mobile applications. In 2017, tiket.com became an affiliated company of Blibli and by 2021 became a consolidating subsidiary of Blibli. Blibli has a unified omnichannel ecosystem known as Blibli Tiket, consisting of its subsidiary entities, tiket.com, and Ranch Market. This is to emphasize the synergies within the ecosystem that provide convenience and added value for customers by offering more comprehensive, beneficial, and integrated services across every channel and platform. In 2022, Blibli's shares were officially listed and traded on the Indonesia Stock Exchange (“IDX”) under the stock code \"BELI.\" tiket.com is the fastest-growing OTA in the world by Sabre and rated the fastest Net Promoter Score (NPS) growth for OTA among its peers, according to a survey done by Jakpat. going anywhere? tiket.com!",
  clean_text: "",
  is_valid: true,
  skills: {
      required: [
          "Java",
          "Golang",
          "RDBMS",
          "NoSQL",
          "Data architecture",
          "Software design",
          "Analytical skills"
      ],
      preferred: [
          "AI tools (GitHub Copilot, Claude Code, Cursor, ChatGPT)",
          "Log analysis",
          "Debugging techniques"
      ]
  },
  keywords: [
      "tiket.com",
      "Java",
      "Golang",
      "Backend Engineer",
      "Software Engineer",
      "Low Latency",
      "High Availability",
      "System Design",
      "RDBMS",
      "NoSQL",
      "Horizontal Scaling"
  ],
  extracted_department: [
      "site:linkedin.com/in \"tiket.com\" AND (\"Engineering Lead\" OR \"Manager\" OR \"Tech Manager\" OR \"VP Engineering\" OR \"Backend Lead\" OR \"Human Resources\" OR \"HR\") AND \"Backend\" AND \"India\"",
      "site:linkedin.com/in \"tiket.com\" AND (\"Engineering Lead\" OR \"Manager\" OR \"Tech Manager\" OR \"VP Engineering\" OR \"Backend Lead\" OR \"Human Resources\" OR \"HR\") AND \"Engineering\" AND \"India\"",
      "site:linkedin.com/in \"tiket.com\" AND (\"Engineering Lead\" OR \"Manager\" OR \"Tech Manager\" OR \"VP Engineering\" OR \"Human Resources\" OR \"HR\") AND \"India\""
  ],
  llm_summary: "tiket.com is hiring an entry-to-early level engineer with 0-2 years of experience to design and build high-performance backend systems using Java or Golang. The position focuses on maintaining high availability (99.99%) and low API latency (<50ms) for over 50 million users across travel products. Candidates will work with databases, horizontal scaling, and modern AI coding tools in a collaborative environment.",
  learning: {
      "Java & Golang Fundamentals": [
          "How does garbage collection differ between Java and Golang, and how does it impact low-latency applications?",
          "What are goroutines in Golang and how do they differ from OS threads or Java virtual threads in terms of memory overhead?",
          "How would you handle concurrent data access in Java using synchronized blocks versus channels in Go?"
      ],
      "Distributed Systems & Scalability": [
          "What architectural strategies would you use to achieve 99.99% availability and keep 99th percentile latencies under 50ms?",
          "How do you approach horizontal scaling vs vertical scaling when designing microservices for high traffic?",
          "What techniques are used to prevent cascading failures in high-throughput API systems?"
      ],
      "Database Architecture & Querying": [
          "How do you optimize an SQL query that is causing high CPU utilization on an RDBMS?",
          "What factors determine whether a NoSQL database or an RDBMS is appropriate for storing user itinerary data?",
          "How does database indexing work under the hood, and what are the trade-offs of adding multiple indexes to a table?"
      ],
      "Log Analysis & Debugging": [
          "How do you systematically debug a intermittent latency spike reported in production APIs?",
          "What key log fields and metrics (RED/USE signals) should be tracked to monitor microservice health effectively?",
          "How do distributed tracing tools assist in pinpointing bottlenecks across multi-service transactions?"
      ]
  },
  created_at: "2026-08-02T09:48:11.547087Z"
} as unknown as JobJDResponse;

export const DEMO_REFERRALS: ReferralResponse[] = [
  {
      id: "38e6927a-9356-4b85-b94d-c4e235d01cbd",
      job_id: "demo",
      name: "Prateek Yadav",
      linkedin_url: "https://www.linkedin.com/in/prateeksuresh23/",
      status: "REQUESTED",
      priority: 1,
      asked_at: "2026-08-08T19:09:36.996736Z",
      responded_at: null,
      created_at: "2026-08-02T09:53:40.406631Z"
  },
  {
      id: "70dc5e68-3000-49d6-807b-022af35359e1",
      job_id: "demo",
      name: "Pavan Kalyan Bheesetty",
      linkedin_url: "https://www.linkedin.com/in/kalyan05/",
      status: "REQUESTED",
      priority: 1,
      asked_at: "2026-08-08T19:09:25.842694Z",
      responded_at: null,
      created_at: "2026-08-02T09:53:40.406631Z"
  },
  {
      id: "7bb4e26a-ffe6-48cb-901d-3e9ade27380b",
      job_id: "demo",
      name: "Himanshu Jindal",
      linkedin_url: "https://www.linkedin.com/in/himanshu-jindal-dev/",
      status: "REQUESTED",
      priority: 1,
      asked_at: "2026-08-08T19:09:28.968396Z",
      responded_at: null,
      created_at: "2026-08-02T09:53:40.406631Z"
  },
  {
      id: "85e43a0e-0e86-4afc-8d0e-8d4e4063157b",
      job_id: "demo",
      name: "Shubham Yadav",
      linkedin_url: "https://www.linkedin.com/in/shubham-yadav-680a40216/",
      status: "REQUESTED",
      priority: 1,
      asked_at: "2026-08-08T19:09:27.979074Z",
      responded_at: null,
      created_at: "2026-08-02T09:53:40.406631Z"
  }
];
