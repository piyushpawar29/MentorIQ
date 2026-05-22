/**
 * Seed script – inserts 25 dummy mentor accounts + profiles.
 * Run once inside the backend container:
 *   docker exec connected_backend node seed.js
 * Or via docker-compose:
 *   docker compose exec backend node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env
const envLoaded = dotenv.config({ path: './config/config.env' });
if (envLoaded.error) dotenv.config();

const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ConnectEd';

const mentors = [
  {
    name: 'Dr. Arjun Sharma',
    email: 'arjun.sharma@mentoriq.com',
    bio: 'Professor of Computer Science with 15 years of teaching experience. Specialises in Algorithms and Data Structures.',
    expertise: ['Algorithms', 'Data Structures', 'Discrete Structures'],
    experience: 'Professor at IIT Delhi',
    company: 'IIT Delhi',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.9,
  },
  {
    name: 'Prof. Meera Nair',
    email: 'meera.nair@mentoriq.com',
    bio: 'Senior lecturer specialising in Database Management and Computer Networks. Passionate about helping students grasp complex concepts.',
    expertise: ['Database Management Systems', 'Computer Networks', 'Operating Systems'],
    experience: 'Senior Lecturer at NIT Calicut',
    company: 'NIT Calicut',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.8,
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@mentoriq.com',
    bio: 'Software Engineer at Google with expertise in OOP and Software Engineering best practices.',
    expertise: ['Object-Oriented Programming (Java/C++)', 'Software Engineering', 'Algorithms'],
    experience: 'Software Engineer at Google',
    company: 'Google',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.7,
  },
  {
    name: 'Dr. Priya Krishnan',
    email: 'priya.krishnan@mentoriq.com',
    bio: 'AI researcher and educator. Loves making Artificial Intelligence and Machine Learning accessible to undergrads.',
    expertise: ['Artificial Intelligence', 'Machine Learning', 'Algorithms'],
    experience: 'Research Scientist at Microsoft Research',
    company: 'Microsoft Research',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.9,
  },
  {
    name: 'Aditya Patel',
    email: 'aditya.patel@mentoriq.com',
    bio: 'Cloud architect with 8 years of industry experience. Helps students understand Cloud Computing and DevOps.',
    expertise: ['Cloud Computing', 'Operating Systems', 'Computer Networks'],
    experience: 'Cloud Architect at AWS',
    company: 'Amazon Web Services',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.6,
  },
  {
    name: 'Dr. Sunita Rao',
    email: 'sunita.rao@mentoriq.com',
    bio: 'Compiler design expert and professor. Authored two textbooks on Theory of Computation.',
    expertise: ['Compiler Design', 'Theory of Computation', 'Discrete Structures'],
    experience: 'Associate Professor at BITS Pilani',
    company: 'BITS Pilani',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.8,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@mentoriq.com',
    bio: 'Cybersecurity professional with experience in ethical hacking and network security.',
    expertise: ['Cyber Security', 'Computer Networks', 'Operating Systems'],
    experience: 'Security Engineer at Infosys',
    company: 'Infosys',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.7,
  },
  {
    name: 'Dr. Kavitha Menon',
    email: 'kavitha.menon@mentoriq.com',
    bio: 'Mathematics professor specialising in Engineering Mathematics and Discrete Structures.',
    expertise: ['Engineering Mathematics', 'Discrete Structures', 'Algorithms'],
    experience: 'Professor at VIT University',
    company: 'VIT University',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.9,
  },
  {
    name: 'Sanjay Kumar',
    email: 'sanjay.kumar@mentoriq.com',
    bio: 'Full-stack developer and mentor. Passionate about teaching Programming and Data Structures to beginners.',
    expertise: ['Programming for Problem Solving (C language)', 'Data Structures', 'Object-Oriented Programming (Java/C++)'],
    experience: 'Senior Developer at TCS',
    company: 'TCS',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.5,
  },
  {
    name: 'Dr. Ananya Bose',
    email: 'ananya.bose@mentoriq.com',
    bio: 'Digital systems and VLSI design expert. Helps students bridge the gap between theory and hardware.',
    expertise: ['Digital Systems', 'Basic Electrical/Electronics Engineering', 'Computer Networks'],
    experience: 'Assistant Professor at Jadavpur University',
    company: 'Jadavpur University',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.7,
  },
  {
    name: 'Rohan Desai',
    email: 'rohan.desai@mentoriq.com',
    bio: 'Machine learning engineer at a leading startup. Mentors students on ML projects and career paths.',
    expertise: ['Machine Learning', 'Artificial Intelligence', 'Data Structures'],
    experience: 'ML Engineer at Flipkart',
    company: 'Flipkart',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.8,
  },
  {
    name: 'Dr. Lakshmi Iyer',
    email: 'lakshmi.iyer@mentoriq.com',
    bio: 'Software engineering professor with industry experience at Wipro. Focuses on agile methodologies.',
    expertise: ['Software Engineering', 'Object-Oriented Programming (Java/C++)', 'Database Management Systems'],
    experience: 'Professor at Anna University',
    company: 'Anna University',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.6,
  },
  {
    name: 'Nikhil Joshi',
    email: 'nikhil.joshi@mentoriq.com',
    bio: 'Operating systems and systems programming enthusiast. Loves helping students understand the internals of OS.',
    expertise: ['Operating Systems', 'Compiler Design', 'Programming for Problem Solving (C language)'],
    experience: 'Systems Engineer at Intel',
    company: 'Intel',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.7,
  },
  {
    name: 'Dr. Pooja Agarwal',
    email: 'pooja.agarwal@mentoriq.com',
    bio: 'Physics and Engineering Mathematics educator. Makes first-year subjects approachable and fun.',
    expertise: ['Physics', 'Engineering Mathematics', 'Engineering Graphics'],
    experience: 'Associate Professor at Delhi Technological University',
    company: 'Delhi Technological University',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.8,
  },
  {
    name: 'Amit Tiwari',
    email: 'amit.tiwari@mentoriq.com',
    bio: 'Backend developer with deep knowledge of databases and distributed systems.',
    expertise: ['Database Management Systems', 'Computer Networks', 'Cloud Computing'],
    experience: 'Backend Engineer at Zomato',
    company: 'Zomato',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.5,
  },
  {
    name: 'Dr. Ritu Saxena',
    email: 'ritu.saxena@mentoriq.com',
    bio: 'Chemistry and basic sciences professor. Helps engineering students build a strong foundation.',
    expertise: ['Chemistry', 'Physics', 'Engineering Mathematics'],
    experience: 'Professor at NIT Rourkela',
    company: 'NIT Rourkela',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.6,
  },
  {
    name: 'Karan Mehta',
    email: 'karan.mehta@mentoriq.com',
    bio: 'DevOps and cloud computing specialist. Guides students through real-world cloud deployments.',
    expertise: ['Cloud Computing', 'Operating Systems', 'Software Engineering'],
    experience: 'DevOps Lead at HCL Technologies',
    company: 'HCL Technologies',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.7,
  },
  {
    name: 'Dr. Deepa Pillai',
    email: 'deepa.pillai@mentoriq.com',
    bio: 'Theory of Computation and formal languages expert. Simplifies abstract concepts for students.',
    expertise: ['Theory of Computation', 'Discrete Structures', 'Algorithms'],
    experience: 'Professor at Amrita University',
    company: 'Amrita University',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.9,
  },
  {
    name: 'Suresh Babu',
    email: 'suresh.babu@mentoriq.com',
    bio: 'Electrical and electronics engineering mentor. Bridges the gap between EE fundamentals and CS.',
    expertise: ['Basic Electrical/Electronics Engineering', 'Digital Systems', 'Engineering Graphics'],
    experience: 'Senior Engineer at BHEL',
    company: 'BHEL',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.5,
  },
  {
    name: 'Dr. Nandita Ghosh',
    email: 'nandita.ghosh@mentoriq.com',
    bio: 'AI and NLP researcher. Mentors students on cutting-edge AI projects and research papers.',
    expertise: ['Artificial Intelligence', 'Machine Learning', 'Algorithms'],
    experience: 'Research Lead at IISc Bangalore',
    company: 'IISc Bangalore',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 5.0,
  },
  {
    name: 'Pranav Kulkarni',
    email: 'pranav.kulkarni@mentoriq.com',
    bio: 'Cybersecurity analyst and CTF enthusiast. Teaches practical security skills to students.',
    expertise: ['Cyber Security', 'Computer Networks', 'Operating Systems'],
    experience: 'Security Analyst at Wipro',
    company: 'Wipro',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.6,
  },
  {
    name: 'Dr. Shweta Mishra',
    email: 'shweta.mishra@mentoriq.com',
    bio: 'Data structures and algorithms coach. Has helped 200+ students crack top tech interviews.',
    expertise: ['Data Structures', 'Algorithms', 'Object-Oriented Programming (Java/C++)'],
    experience: 'Assistant Professor at IIIT Hyderabad',
    company: 'IIIT Hyderabad',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.9,
  },
  {
    name: 'Tarun Bhatia',
    email: 'tarun.bhatia@mentoriq.com',
    bio: 'Engineering graphics and CAD specialist. Makes technical drawing intuitive for first-year students.',
    expertise: ['Engineering Graphics', 'Basic Electrical/Electronics Engineering', 'Physics'],
    experience: 'Design Engineer at L&T',
    company: 'L&T',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.4,
  },
  {
    name: 'Dr. Varsha Reddy',
    email: 'varsha.reddy@mentoriq.com',
    bio: 'Software engineering and agile development expert. Mentors students on real-world project management.',
    expertise: ['Software Engineering', 'Database Management Systems', 'Cloud Computing'],
    experience: 'Professor at Osmania University',
    company: 'Osmania University',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Video Call',
    rating: 4.7,
  },
  {
    name: 'Mohit Choudhary',
    email: 'mohit.choudhary@mentoriq.com',
    bio: 'Full-stack developer and open-source contributor. Passionate about teaching C programming to beginners.',
    expertise: ['Programming for Problem Solving (C language)', 'Data Structures', 'Software Engineering'],
    experience: 'Software Developer at Razorpay',
    company: 'Razorpay',
    category: 'Technology',
    hourlyRate: 0,
    communicationPreference: 'Chat',
    rating: 4.6,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const PASSWORD = 'MentorIQ@2024';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    let created = 0;
    let skipped = 0;

    for (const m of mentors) {
      const existing = await User.findOne({ email: m.email });
      if (existing) {
        skipped++;
        continue;
      }

      // Create user (bypass pre-save hook by inserting directly with already-hashed password)
      const user = await User.create({
        name: m.name,
        email: m.email,
        password: hashedPassword,
        role: 'mentor',
      });

      await MentorProfile.create({
        user: user._id,
        role: 'mentor',
        bio: m.bio,
        expertise: m.expertise,
        experience: m.experience,
        company: m.company,
        category: m.category,
        hourlyRate: m.hourlyRate,
        communicationPreference: m.communicationPreference,
        languages: ['English'],
        rating: m.rating,
        reviews: Math.floor(Math.random() * 80) + 10,
        sessions: Math.floor(Math.random() * 150) + 20,
      });

      created++;
      console.log(`✓ Created mentor: ${m.name}`);
    }

    console.log(`\nDone. Created: ${created}, Skipped (already exist): ${skipped}`);
    console.log(`Default password for all seeded mentors: ${PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
