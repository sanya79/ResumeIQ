/**
 * ResumeIQ Comprehensive Multi-Role Keywords & Skills Database
 * Defines key skills, tools, frameworks, concepts, and weighted synonyms across 26+ job domains.
 */
export const keywordsDb = {
  roles: {
    frontend: [
      { term: "React", weight: 10, synonyms: ["ReactJS", "React.js"] },
      { term: "JavaScript", weight: 9, synonyms: ["JS", "ES6", "ESNext", "Vanilla JS"] },
      { term: "TypeScript", weight: 9, synonyms: ["TS"] },
      { term: "HTML5", weight: 7, synonyms: ["HTML", "Semantic HTML"] },
      { term: "CSS3", weight: 7, synonyms: ["CSS", "SCSS", "SASS", "LESS"] },
      { term: "Vue.js", weight: 8, synonyms: ["Vue", "VueJS", "Nuxt"] },
      { term: "Angular", weight: 8, synonyms: ["AngularJS", "Angular.io"] },
      { term: "Next.js", weight: 8, synonyms: ["NextJS", "SSR"] },
      { term: "TailwindCSS", weight: 7, synonyms: ["Tailwind", "Tailwind CSS", "Bootstrap"] },
      { term: "Webpack", weight: 6, synonyms: ["Vite", "Rollup", "Parcel", "Turbopack"] },
      { term: "State Management", weight: 8, synonyms: ["Redux", "Zustand", "MobX", "Recoil", "Context API"] },
      { term: "Responsive Design", weight: 7, synonyms: ["Mobile-first", "Flexbox", "CSS Grid"] }
    ],
    backend: [
      { term: "Node.js", weight: 10, synonyms: ["Node", "NodeJS"] },
      { term: "Express.js", weight: 8, synonyms: ["Express", "ExpressJS", "Fastify", "NestJS"] },
      { term: "Python", weight: 9, synonyms: ["Py", "Django", "FastAPI", "Flask"] },
      { term: "Java", weight: 9, synonyms: ["JDK", "Spring Boot", "Spring Cloud", "JEE"] },
      { term: "Go", weight: 9, synonyms: ["Golang"] },
      { term: "SQL", weight: 8, synonyms: ["PostgreSQL", "MySQL", "SQLite", "Oracle", "SQL Server"] },
      { term: "NoSQL", weight: 8, synonyms: ["MongoDB", "Redis", "DynamoDB", "Cassandra"] },
      { term: "REST API", weight: 8, synonyms: ["REST", "RESTful API", "Web APIs"] },
      { term: "GraphQL", weight: 8, synonyms: ["Apollo Client", "Apollo Server"] },
      { term: "Docker", weight: 7, synonyms: ["Containers"] },
      { term: "Microservices", weight: 8, synonyms: ["Distributed Systems", "SOA", "Event-driven"] }
    ],
    fullstack: [
      { term: "React", weight: 9, synonyms: ["ReactJS", "React.js", "Vue", "Angular"] },
      { term: "Node.js", weight: 9, synonyms: ["Node", "NodeJS", "Express", "Python", "Java"] },
      { term: "JavaScript", weight: 8, synonyms: ["JS", "TypeScript"] },
      { term: "TypeScript", weight: 8, synonyms: ["TS"] },
      { term: "SQL", weight: 8, synonyms: ["PostgreSQL", "MySQL", "Database"] },
      { term: "NoSQL", weight: 7, synonyms: ["MongoDB", "Redis"] },
      { term: "Docker", weight: 7, synonyms: ["Containers"] },
      { term: "REST API", weight: 8, synonyms: ["RESTful", "Web APIs", "GraphQL"] },
      { term: "Git", weight: 7, synonyms: ["GitHub", "GitLab"] },
      { term: "AWS", weight: 7, synonyms: ["Amazon Web Services", "Cloud", "GCP", "Azure"] }
    ],
    mobile: [
      { term: "React Native", weight: 10, synonyms: ["RN"] },
      { term: "Flutter", weight: 10, synonyms: ["Dart"] },
      { term: "Swift", weight: 9, synonyms: ["iOS", "SwiftUI"] },
      { term: "Kotlin", weight: 9, synonyms: ["Android", "Jetpack Compose"] },
      { term: "Mobile App Development", weight: 9, synonyms: ["App Store", "Google Play"] },
      { term: "REST API", weight: 7, synonyms: ["JSON", "Mobile Backend"] },
      { term: "State Management", weight: 7, synonyms: ["Redux", "Provider", "Bloc"] },
      { term: "Git", weight: 6, synonyms: ["GitHub"] }
    ],
    ai_engineer: [
      { term: "Python", weight: 10, synonyms: ["Py"] },
      { term: "PyTorch", weight: 9, synonyms: ["Torch"] },
      { term: "TensorFlow", weight: 9, synonyms: ["Keras"] },
      { term: "OpenAI", weight: 9, synonyms: ["LLMs", "GPT", "Claude", "LangChain", "LlamaIndex"] },
      { term: "NLP", weight: 9, synonyms: ["Natural Language Processing", "Transformers", "BERT", "NLTK", "spaCy"] },
      { term: "Computer Vision", weight: 8, synonyms: ["CV", "OpenCV", "CNN", "YOLO"] },
      { term: "Vector Database", weight: 9, synonyms: ["Pinecone", "ChromaDB", "Milvus", "Qdrant", "FAISS"] },
      { term: "Machine Learning", weight: 9, synonyms: ["ML", "Deep Learning", "Neural Networks"] },
      { term: "RAG", weight: 9, synonyms: ["Retrieval-Augmented Generation", "Embeddings"] }
    ],
    ml_engineer: [
      { term: "Python", weight: 10, synonyms: ["Py"] },
      { term: "Scikit-Learn", weight: 9, synonyms: ["sklearn"] },
      { term: "Pandas", weight: 8, synonyms: ["NumPy", "SciPy"] },
      { term: "PyTorch", weight: 9, synonyms: ["Torch"] },
      { term: "TensorFlow", weight: 9, synonyms: ["TF", "Keras"] },
      { term: "MLOps", weight: 9, synonyms: ["MLflow", "DVC", "Kubeflow", "SageMaker", "Model Deployment"] },
      { term: "ETL", weight: 8, synonyms: ["Data Ingestion", "Spark", "Airflow"] },
      { term: "Deep Learning", weight: 9, synonyms: ["Neural Networks", "CNN", "RNN", "LSTM"] }
    ],
    data_scientist: [
      { term: "Python", weight: 10, synonyms: ["Py", "R"] },
      { term: "SQL", weight: 9, synonyms: ["PostgreSQL", "MySQL", "Snowflake", "BigQuery"] },
      { term: "Pandas", weight: 9, synonyms: ["NumPy", "Dataframes"] },
      { term: "Machine Learning", weight: 9, synonyms: ["Statistical Modeling", "Regression", "Classification", "Clustering"] },
      { term: "Data Visualization", weight: 8, synonyms: ["Matplotlib", "Seaborn", "Tableau", "Power BI"] },
      { term: "A/B Testing", weight: 8, synonyms: ["Hypothesis Testing", "Experimentation", "Statistics"] },
      { term: "Feature Engineering", weight: 8, synonyms: ["Data Cleaning", "Preprocessing"] }
    ],
    data_engineer: [
      { term: "Python", weight: 9, synonyms: ["Py", "Scala", "Java"] },
      { term: "SQL", weight: 10, synonyms: ["PostgreSQL", "Snowflake", "BigQuery", "Redshift"] },
      { term: "Apache Spark", weight: 9, synonyms: ["Spark", "PySpark", "Databricks"] },
      { term: "ETL Pipelines", weight: 10, synonyms: ["ETL", "ELT", "Data Pipeline", "Airflow", "dbt", "Prefect"] },
      { term: "Data Warehousing", weight: 9, synonyms: ["Data Lake", "Data Warehouse", "Snowflake", "Redshift"] },
      { term: "Kafka", weight: 8, synonyms: ["Streaming Data", "Event Streaming", "Pulsar"] },
      { term: "Docker", weight: 7, synonyms: ["Kubernetes", "Cloud Infrastructure"] }
    ],
    data_analyst: [
      { term: "SQL", weight: 10, synonyms: ["PostgreSQL", "MySQL", "SQL Server"] },
      { term: "Excel", weight: 9, synonyms: ["Advanced Excel", "VLOOKUP", "Pivot Tables", "VBA"] },
      { term: "Tableau", weight: 9, synonyms: ["Power BI", "Looker", "Dashboarding", "BI Tools"] },
      { term: "Python", weight: 8, synonyms: ["Pandas", "R"] },
      { term: "Data Analysis", weight: 9, synonyms: ["Business Intelligence", "Reporting", "Data Insights"] },
      { term: "Communication", weight: 7, synonyms: ["Stakeholder Management", "Presentation"] }
    ],
    devops: [
      { term: "Docker", weight: 10, synonyms: ["Containers"] },
      { term: "Kubernetes", weight: 10, synonyms: ["K8s", "EKS", "GKE", "AKS"] },
      { term: "Terraform", weight: 9, synonyms: ["IaC", "CloudFormation", "Ansible", "Puppet"] },
      { term: "CI/CD", weight: 9, synonyms: ["GitHub Actions", "Jenkins", "GitLab CI", "CircleCI", "ArgoCD"] },
      { term: "AWS", weight: 9, synonyms: ["Amazon Web Services", "Azure", "GCP"] },
      { term: "Linux", weight: 8, synonyms: ["Ubuntu", "Bash", "Shell scripting", "CentOS"] },
      { term: "Prometheus", weight: 8, synonyms: ["Grafana", "ELK", "Datadog", "Monitoring", "Observability"] },
      { term: "Python", weight: 7, synonyms: ["Go", "Scripting"] }
    ],
    cloud_architect: [
      { term: "AWS", weight: 10, synonyms: ["Amazon Web Services", "Azure", "Google Cloud", "GCP"] },
      { term: "Cloud Security", weight: 9, synonyms: ["IAM", "VPC", "Compliance", "Security Groups"] },
      { term: "System Architecture", weight: 9, synonyms: ["High Availability", "Disaster Recovery", "Scalability"] },
      { term: "Terraform", weight: 8, synonyms: ["Infrastructure as Code", "IaC"] },
      { term: "Kubernetes", weight: 8, synonyms: ["Microservices Architecture"] },
      { term: "Cost Optimization", weight: 8, synonyms: ["FinOps", "Cloud Economy"] }
    ],
    cybersecurity: [
      { term: "Network Security", weight: 10, synonyms: ["Firewalls", "VPN", "IDS/IPS", "Wireshark"] },
      { term: "Penetration Testing", weight: 9, synonyms: ["Ethical Hacking", "Metasploit", "Burp Suite", "Kali Linux"] },
      { term: "SIEM", weight: 9, synonyms: ["Splunk", "Sentinel", "Log Analysis", "SOC"] },
      { term: "Vulnerability Assessment", weight: 9, synonyms: ["Nessus", "Qualys", "CVE"] },
      { term: "Incident Response", weight: 9, synonyms: ["Forensics", "Threat Hunting"] },
      { term: "Compliance", weight: 8, synonyms: ["ISO 27001", "SOC2", "HIPAA", "GDPR", "NIST"] }
    ],
    sre: [
      { term: "Site Reliability", weight: 10, synonyms: ["SRE", "SLO", "SLA", "SLI", "Error Budgets"] },
      { term: "Kubernetes", weight: 9, synonyms: ["K8s", "Docker"] },
      { term: "Observability", weight: 9, synonyms: ["Prometheus", "Grafana", "Datadog", "OpenTelemetry"] },
      { term: "Python", weight: 8, synonyms: ["Go", "Bash", "Automation"] },
      { term: "Incident Management", weight: 9, synonyms: ["Post-mortems", "On-call", "PagerDuty"] }
    ],
    qa_engineer: [
      { term: "Test Automation", weight: 10, synonyms: ["Selenium", "Cypress", "Playwright", "Appium"] },
      { term: "Quality Assurance", weight: 9, synonyms: ["QA", "Software Testing", "Manual Testing"] },
      { term: "API Testing", weight: 9, synonyms: ["Postman", "REST Assured", "JMeter"] },
      { term: "JavaScript", weight: 8, synonyms: ["Python", "Java", "TypeScript"] },
      { term: "CI/CD", weight: 8, synonyms: ["Jenkins", "GitHub Actions"] },
      { term: "Test Planning", weight: 8, synonyms: ["Test Cases", "Bug Tracking", "Jira"] }
    ],
    software_architect: [
      { term: "System Design", weight: 10, synonyms: ["Software Architecture", "High Level Design", "HLD", "LLD"] },
      { term: "Microservices", weight: 9, synonyms: ["Event-Driven Architecture", "Domain-Driven Design", "DDD"] },
      { term: "Design Patterns", weight: 9, synonyms: ["GOF Patterns", "SOLID Principles"] },
      { term: "Scalability", weight: 9, synonyms: ["Performance Optimization", "Distributed Systems"] },
      { term: "Technical Leadership", weight: 8, synonyms: ["Mentorship", "Tech Stack Selection"] }
    ],
    product_manager: [
      { term: "Product Strategy", weight: 10, synonyms: ["Product Roadmap", "Product Vision"] },
      { term: "Agile", weight: 9, synonyms: ["Scrum", "Kanban", "User Stories", "Sprint Planning"] },
      { term: "User Research", weight: 8, synonyms: ["User Experience", "UX Research", "Customer Discovery"] },
      { term: "Product Analytics", weight: 9, synonyms: ["Mixpanel", "Amplitude", "Google Analytics", "KPIs", "Metrics"] },
      { term: "Stakeholder Management", weight: 8, synonyms: ["Cross-functional Leadership"] },
      { term: "Prioritization", weight: 8, synonyms: ["RICE Framework", "MoSCoW"] }
    ],
    project_manager: [
      { term: "Project Management", weight: 10, synonyms: ["PMP", "Project Lifecycle", "Scope Management"] },
      { term: "Agile", weight: 9, synonyms: ["Scrum", "Scrum Master", "Kanban", "Sprint Management"] },
      { term: "Risk Management", weight: 9, synonyms: ["Risk Mitigation", "Dependency Tracking"] },
      { term: "Jira", weight: 8, synonyms: ["Confluence", "Asana", "Trello", "MS Project"] },
      { term: "Budgeting", weight: 8, synonyms: ["Cost Estimation", "Resource Allocation"] },
      { term: "Communication", weight: 8, synonyms: ["Stakeholder Reporting", "Status Updates"] }
    ],
    ui_ux_designer: [
      { term: "Figma", weight: 10, synonyms: ["Sketch", "Adobe XD"] },
      { term: "User Interface Design", weight: 9, synonyms: ["UI Design", "Visual Design", "Design Systems"] },
      { term: "User Experience Design", weight: 9, synonyms: ["UX Design", "Wireframing", "Prototyping"] },
      { term: "User Research", weight: 8, synonyms: ["Usability Testing", "Personas", "User Journeys"] },
      { term: "Design System", weight: 8, synonyms: ["Component Libraries", "UI Kit"] }
    ],
    business_analyst: [
      { term: "Business Analysis", weight: 10, synonyms: ["Requirements Gathering", "BRD", "FRD"] },
      { term: "Process Mapping", weight: 9, synonyms: ["BPMN", "Flowcharts", "Gap Analysis"] },
      { term: "SQL", weight: 8, synonyms: ["Data Analysis", "Excel"] },
      { term: "Agile", weight: 8, synonyms: ["Scrum", "User Stories", "Acceptance Criteria"] },
      { term: "Stakeholder Management", weight: 9, synonyms: ["Client Workshops", "Facilitation"] }
    ],
    digital_marketing: [
      { term: "SEO", weight: 10, synonyms: ["Search Engine Optimization", "SEM", "Google Ads"] },
      { term: "Content Marketing", weight: 9, synonyms: ["Copywriting", "Social Media Marketing", "SMM"] },
      { term: "Google Analytics", weight: 9, synonyms: ["GA4", "Marketing Analytics", "Conversion Rate Optimization", "CRO"] },
      { term: "Email Marketing", weight: 8, synonyms: ["HubSpot", "Mailchimp", "Klaviyo"] },
      { term: "Paid Media", weight: 8, synonyms: ["PPC", "Meta Ads", "LinkedIn Ads"] }
    ],
    content_writer: [
      { term: "Copywriting", weight: 10, synonyms: ["Content Creation", "Article Writing", "Blogging"] },
      { term: "SEO Writing", weight: 9, synonyms: ["Keyword Research", "On-Page SEO"] },
      { term: "Editing", weight: 8, synonyms: ["Proofreading", "Content Strategy"] },
      { term: "WordPress", weight: 7, synonyms: ["CMS", "Medium"] }
    ],
    hr_manager: [
      { term: "Talent Acquisition", weight: 10, synonyms: ["Recruitment", "Sourcing", "Hiring", "Headhunting"] },
      { term: "Employee Relations", weight: 9, synonyms: ["Performance Management", "HR Policies"] },
      { term: "HRIS", weight: 8, synonyms: ["Workday", "BambooHR", "Greenhouse", "Lever"] },
      { term: "Onboarding", weight: 8, synonyms: ["Offboarding", "Employee Engagement"] }
    ],
    financial_analyst: [
      { term: "Financial Modeling", weight: 10, synonyms: ["DCF", "Valuation", "Financial Forecasting"] },
      { term: "Excel", weight: 10, synonyms: ["Advanced Excel", "Financial Statements", "Pivot Tables"] },
      { term: "Variance Analysis", weight: 8, synonyms: ["Budgeting", "FP&A"] },
      { term: "Accounting", weight: 8, synonyms: ["GAAP", "IFRS", "Balance Sheet", "P&L"] }
    ],
    sales_manager: [
      { term: "B2B Sales", weight: 10, synonyms: ["Account Executive", "Business Development", "SaaS Sales"] },
      { term: "CRM", weight: 9, synonyms: ["Salesforce", "HubSpot CRM", "Pipedrive"] },
      { term: "Pipeline Management", weight: 9, synonyms: ["Prospecting", "Closing Deals", "Quota Attainment"] },
      { term: "Negotiation", weight: 8, synonyms: ["Contract Negotiation", "Client Presentation"] }
    ],
    operations_manager: [
      { term: "Operations Management", weight: 10, synonyms: ["Process Improvement", "Supply Chain", "Logistics"] },
      { term: "Lean", weight: 8, synonyms: ["Six Sigma", "Kaizen", "Workflow Optimization"] },
      { term: "Vendor Management", weight: 8, synonyms: ["Cross-functional Leadership", "KPI Tracking"] }
    ],
    embedded_engineer: [
      { term: "C", weight: 10, synonyms: ["Embedded C", "C++"] },
      { term: "RTOS", weight: 9, synonyms: ["FreeRTOS", "Embedded Linux", "Microcontrollers", "MCU"] },
      { term: "Microcontrollers", weight: 9, synonyms: ["STM32", "ESP32", "ARM Cortex", "Arduino"] },
      { term: "Protocols", weight: 8, synonyms: ["UART", "SPI", "I2C", "CAN bus"] },
      { term: "Hardware Debugging", weight: 8, synonyms: ["Oscilloscope", "Logic Analyzer"] }
    ]
  }
};

export default keywordsDb;

