import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiClock, FiTrendingUp, FiStar } from 'react-icons/fi';

const roles = [
    {
        id: 'swe',
        title: 'Software Engineer',
        emoji: '💻',
        demand: 'Very High',
        salary: '₹8L - ₹40L',
        timeline: '8-12 weeks',
        color: '#6366f1',
        mustHave: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'System Design Basics', 'SQL & Databases', 'Git & Version Control', 'One Language (Python/Java/C++)'],
        goodToHave: ['Cloud (AWS/GCP/Azure)', 'Docker & Kubernetes', 'CI/CD pipelines', 'GraphQL', 'Redis/Caching'],
        advanced: ['Distributed Systems', 'Microservices Architecture', 'Kafka/Message Queues', 'Performance Tuning'],
        companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Swiggy', 'Zepto'],
        rounds: ['Coding Round (DSA)', 'Technical Interview', 'System Design', 'HR Round'],
    },
    {
        id: 'frontend',
        title: 'Frontend Developer',
        emoji: '🎨',
        demand: 'High',
        salary: '₹6L - ₹30L',
        timeline: '6-10 weeks',
        color: '#ec4899',
        mustHave: ['HTML5, CSS3, JavaScript (ES6+)', 'React or Vue or Angular', 'REST APIs & Fetch/Axios', 'Responsive Design', 'Git', 'Browser DevTools'],
        goodToHave: ['TypeScript', 'Next.js / Nuxt.js', 'State Management (Redux/Zustand)', 'CSS Frameworks', 'Web Performance Optimization'],
        advanced: ['Micro-Frontends', 'WebAssembly', 'PWA', 'WebSockets', 'Three.js / WebGL'],
        companies: ['Zomato', 'Razorpay', 'Meesho', 'CRED', 'Groww'],
        rounds: ['Portfolio Review', 'Coding (JS/DOM)', 'React Assignment', 'HR Round'],
    },
    {
        id: 'ml',
        title: 'ML Engineer',
        emoji: '🤖',
        demand: 'Very High',
        salary: '₹12L - ₹50L',
        timeline: '12-16 weeks',
        color: '#10b981',
        mustHave: ['Python', 'Linear Algebra & Statistics', 'Supervised & Unsupervised ML', 'Scikit-learn, TensorFlow or PyTorch', 'Feature Engineering', 'Model Evaluation Metrics'],
        goodToHave: ['NLP & Transformers', 'Computer Vision', 'MLOps (MLflow, Kubeflow)', 'SQL & Spark', 'A/B Testing'],
        advanced: ['LLMs & Fine-tuning', 'Reinforcement Learning', 'Distributed ML Training', 'RAG Systems'],
        companies: ['Google DeepMind', 'OpenAI', 'Sarvam AI', 'Flipkart', 'Paytm'],
        rounds: ['ML Theory Round', 'Coding (Python)', 'Case Study', 'System Design (ML)', 'HR'],
    },
    {
        id: 'devops',
        title: 'DevOps Engineer',
        emoji: '⚙️',
        demand: 'High',
        salary: '₹8L - ₹35L',
        timeline: '10-14 weeks',
        color: '#f59e0b',
        mustHave: ['Linux & Shell Scripting', 'Docker & Kubernetes', 'CI/CD (Jenkins/GitHub Actions)', 'AWS / GCP / Azure', 'Terraform (IaC)', 'Monitoring (Prometheus, Grafana)'],
        goodToHave: ['Ansible', 'Helm Charts', 'Service Mesh (Istio)', 'ELK Stack', 'ArgoCD'],
        advanced: ['Multi-Cloud Architecture', 'FinOps', 'Zero-Trust Security', 'Chaos Engineering'],
        companies: ['ThoughtWorks', 'Razorpay', 'Walmart Labs', 'PhonePe', 'Dream11'],
        rounds: ['Linux/Scripting Test', 'Technical Deep Dive', 'Architecture Design', 'HR'],
    },
    {
        id: 'data',
        title: 'Data Scientist',
        emoji: '📊',
        demand: 'High',
        salary: '₹9L - ₹40L',
        timeline: '10-14 weeks',
        color: '#3b82f6',
        mustHave: ['Python (Pandas, NumPy)', 'Statistics & Probability', 'ML Algorithms', 'SQL', 'Data Visualization (Matplotlib, Seaborn)', 'Jupyter Notebooks'],
        goodToHave: ['R Language', 'Spark / BigQuery', 'Tableau / Power BI', 'Time Series Analysis', 'Bayesian Methods'],
        advanced: ['Deep Learning', 'Causal Inference', 'Experiment Design', 'NLP'],
        companies: ['Urban Company', 'MakeMyTrip', 'Agoda', 'BookMyShow', 'Meesho'],
        rounds: ['Python/SQL Test', 'Stats/Probability', 'ML Case Study', 'Communication Round', 'HR'],
    },
    {
        id: 'pm',
        title: 'Product Manager',
        emoji: '🚀',
        demand: 'Very High',
        salary: '₹15L - ₹60L',
        timeline: '8-12 weeks',
        color: '#a855f7',
        mustHave: ['Product Sense & Metrics', 'User Research & Empathy', 'Data Analysis (Excel/SQL)', 'Roadmapping & Prioritization', 'Stakeholder Communication', 'A/B Testing basics'],
        goodToHave: ['Technical Background', 'Growth Hacking', 'Agile/Scrum', 'Figma/Wireframing', 'SQL'],
        advanced: ['ML Product Strategy', 'Pricing & Monetization', 'Platform Product Management', 'Market Expansion'],
        companies: ['Flipkart', 'Amazon', 'Google', 'Swiggy', 'Razorpay'],
        rounds: ['Product Sense Round', 'Analytical Round', 'Technical Round (basics)', 'Leadership Principles', 'HR'],
    },
];

export default function Roles() {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="animate-fade">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎯 Role-Based Roadmaps</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Select your target role to get a complete learning roadmap, skills, and interview questions.
                </p>
            </div>

            <div className="grid-3">
                {roles.map((role) => (
                    <div key={role.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.25s' }}
                        onClick={() => navigate(`/roles/${role.id}`)}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = role.color; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${role.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                {role.emoji}
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{role.title}</h3>
                                <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 100, background: `${role.color}20`, color: role.color, fontWeight: 600 }}>
                                    {role.demand} Demand
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <FiTrendingUp size={13} /> {role.salary}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                <FiClock size={13} /> {role.timeline}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Must-Have Skills:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {role.mustHave.slice(0, 3).map(s => (
                                    <span key={s} className="badge badge-accent" style={{ fontSize: '0.68rem' }}>{s}</span>
                                ))}
                                {role.mustHave.length > 3 && (
                                    <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>+{role.mustHave.length - 3} more</span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {role.companies.slice(0, 4).map(c => (
                                <span key={c} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{c}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: role.color, fontSize: '0.82rem', fontWeight: 600 }}>
                            View Full Roadmap <FiChevronRight />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
