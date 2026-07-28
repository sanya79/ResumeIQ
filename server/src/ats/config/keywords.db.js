/**
 * ResumeIQ Target Role Keywords Database
 * Defines key skills, programming languages, tools, frameworks, and synonyms per role.
 * Includes weights (1-10) to mark relative importance.
 */
export const keywordsDb = {
  roles: {
    frontend: [
      { term: "React", weight: 10, synonyms: ["ReactJS", "React.js"] },
      { term: "JavaScript", weight: 9, synonyms: ["JS", "ES6", "ESNext"] },
      { term: "TypeScript", weight: 9, synonyms: ["TS"] },
      { term: "HTML5", weight: 7, synonyms: ["HTML", "XHTML"] },
      { term: "CSS3", weight: 7, synonyms: ["CSS", "SCSS", "SASS", "LESS"] },
      { term: "Vue.js", weight: 8, synonyms: ["Vue", "VueJS"] },
      { term: "Angular", weight: 8, synonyms: ["AngularJS", "Angular.io"] },
      { term: "Next.js", weight: 8, synonyms: ["NextJS"] },
      { term: "TailwindCSS", weight: 6, synonyms: ["Tailwind", "Tailwind CSS"] },
      { term: "Webpack", weight: 6, synonyms: ["Vite", "Rollup", "Parcel"] },
      { term: "Redux", weight: 7, synonyms: ["Zustand", "MobX", "Recoil", "Context API"] }
    ],
    backend: [
      { term: "Node.js", weight: 10, synonyms: ["Node", "NodeJS"] },
      { term: "Express.js", weight: 8, synonyms: ["Express", "ExpressJS"] },
      { term: "Python", weight: 9, synonyms: ["Py"] },
      { term: "Java", weight: 9, synonyms: ["JDK", "JEE"] },
      { term: "Go", weight: 9, synonyms: ["Golang"] },
      { term: "SQL", weight: 8, synonyms: ["PostgreSQL", "MySQL", "SQLite", "Oracle"] },
      { term: "NoSQL", weight: 8, synonyms: ["MongoDB", "Redis", "DynamoDB", "Cassandra"] },
      { term: "REST API", weight: 8, synonyms: ["REST", "RESTful API", "Web APIs"] },
      { term: "GraphQL", weight: 8, synonyms: ["Apollo Client", "Apollo Server"] },
      { term: "Docker", weight: 7, synonyms: ["Containers"] },
      { term: "Microservices", weight: 8, synonyms: ["Distributed Systems", "SOA"] }
    ],
    fullstack: [
      { term: "React", weight: 9, synonyms: ["ReactJS", "React.js"] },
      { term: "Node.js", weight: 9, synonyms: ["Node", "NodeJS"] },
      { term: "JavaScript", weight: 8, synonyms: ["JS"] },
      { term: "TypeScript", weight: 8, synonyms: ["TS"] },
      { term: "SQL", weight: 7, synonyms: ["PostgreSQL", "MySQL"] },
      { term: "NoSQL", weight: 7, synonyms: ["MongoDB", "Redis"] },
      { term: "Docker", weight: 7, synonyms: ["Containers"] },
      { term: "REST API", weight: 7, synonyms: ["RESTful"] },
      { term: "Git", weight: 6, synonyms: ["GitHub", "GitLab"] },
      { term: "AWS", weight: 7, synonyms: ["Amazon Web Services", "Cloud"] }
    ],
    ai_engineer: [
      { term: "Python", weight: 10, synonyms: ["Py"] },
      { term: "PyTorch", weight: 9 },
      { term: "TensorFlow", weight: 9, synonyms: ["Keras"] },
      { term: "OpenAI", weight: 9, synonyms: ["LLMs", "GPT", "Claude", "LangChain", "LlamaIndex"] },
      { term: "NLP", weight: 8, synonyms: ["Natural Language Processing", "Transformers", "BERT", "NLTK"] },
      { term: "Computer Vision", weight: 8, synonyms: ["CV", "OpenCV", "CNN"] },
      { term: "SQL", weight: 6, synonyms: ["Postgres", "MySQL"] },
      { term: "Hugging Face", weight: 8, synonyms: ["Diffusers", "Transformers Library"] },
      { term: "Vector Database", weight: 9, synonyms: ["Pinecone", "ChromaDB", "Milvus", "Qdrant"] },
      { term: "Machine Learning", weight: 9, synonyms: ["ML", "Supervised Learning", "Unsupervised Learning"] }
    ],
    ml_engineer: [
      { term: "Python", weight: 10, synonyms: ["Py"] },
      { term: "Scikit-Learn", weight: 9, synonyms: ["sklearn"] },
      { term: "Pandas", weight: 8, synonyms: ["NumPy", "SciPy"] },
      { term: "PyTorch", weight: 9, synonyms: ["Torch"] },
      { term: "TensorFlow", weight: 9, synonyms: ["TF"] },
      { term: "MLOps", weight: 9, synonyms: ["MLflow", "DVC", "Kubeflow", "SageMaker"] },
      { term: "Data Ingestion", weight: 7, synonyms: ["ETL", "Spark", "Hadoop", "Airflow"] },
      { term: "Deep Learning", weight: 9, synonyms: ["Neural Networks", "CNN", "RNN", "LSTM"] }
    ],
    devops: [
      { term: "Docker", weight: 10, synonyms: ["Containers"] },
      { term: "Kubernetes", weight: 10, synonyms: ["K8s", "EKS", "GKE"] },
      { term: "Terraform", weight: 9, synonyms: ["IaC", "CloudFormation", "Ansible"] },
      { term: "CI/CD", weight: 9, synonyms: ["GitHub Actions", "Jenkins", "GitLab CI", "CircleCI"] },
      { term: "AWS", weight: 8, synonyms: ["Amazon Web Services"] },
      { term: "Linux", weight: 8, synonyms: ["Ubuntu", "Bash", "Shell scripting", "CentOS"] },
      { term: "Prometheus", weight: 7, synonyms: ["Grafana", "ELK", "Datadog", "Monitoring"] },
      { term: "Python", weight: 7, synonyms: ["Go", "Bash", "Scripting Languages"] }
    ]
  }
};
