import bcrypt from "bcrypt";
import { storage } from "./storage";

export async function seedDatabase() {
  const existingUser = await storage.getUserByEmail("empresa@techcorp.es");
  if (existingUser) return;

  console.log("Seeding database with initial data...");

  const companyPassword = await bcrypt.hash("password123", 12);
  const alumniPassword = await bcrypt.hash("password123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  await storage.createUser({
    email: "admin@conectafp.es",
    password: adminPassword,
    role: "ADMIN",
    name: "Administrador",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const company1 = await storage.createUser({
    email: "empresa@techcorp.es",
    password: companyPassword,
    role: "COMPANY",
    name: "Ana García",
    phone: "+34 911 234 567",
    companyName: "TechCorp Solutions",
    companyDescription: "Empresa líder en soluciones tecnológicas con más de 15 años de experiencia en el sector. Especializados en desarrollo de software, IA y cloud computing.",
    companyWebsite: "https://techcorp.es",
    companySector: "Tecnología",
    companyEmail: "info@techcorp.es",
    companyCif: "B12345678",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const company2 = await storage.createUser({
    email: "rrhh@innovadigital.com",
    password: companyPassword,
    role: "COMPANY",
    name: "Carlos López",
    phone: "+34 912 345 678",
    companyName: "Innova Digital",
    companyDescription: "Agencia digital enfocada en transformación digital, marketing online y desarrollo de aplicaciones móviles.",
    companyWebsite: "https://innovadigital.com",
    companySector: "Marketing Digital",
    companyEmail: "contacto@innovadigital.com",
    companyCif: "B87654321",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const company3 = await storage.createUser({
    email: "talento@greenenergy.es",
    password: companyPassword,
    role: "COMPANY",
    name: "Laura Martínez",
    phone: "+34 913 456 789",
    companyName: "GreenEnergy Systems",
    companyDescription: "Empresa de energía renovable comprometida con la sostenibilidad. Desarrollamos soluciones de energía solar y eólica.",
    companyWebsite: "https://greenenergy.es",
    companySector: "Energía Renovable",
    companyEmail: "info@greenenergy.es",
    companyCif: "A11223344",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const alumni1 = await storage.createUser({
    email: "maria@alumni.com",
    password: alumniPassword,
    role: "ALUMNI",
    name: "María Fernández",
    phone: "+34 620 123 456",
    bio: "Titulada en Desarrollo de Aplicaciones Web (DAW) con pasión por el desarrollo web y la inteligencia artificial. Busco mi primera oportunidad profesional.",
    university: "IES Vallecas",
    graduationYear: 2024,
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Desarrollo de Aplicaciones Web (DAW)",
    skills: "JavaScript, TypeScript, React, Node.js, Python, SQL",
    cvUrl: "https://drive.google.com/example-cv-maria",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const alumni2 = await storage.createUser({
    email: "pablo@alumni.com",
    password: alumniPassword,
    role: "ALUMNI",
    name: "Pablo Rodríguez",
    phone: "+34 630 234 567",
    bio: "Técnico superior en Administración de Sistemas Informáticos en Red (ASIR) con experiencia en prácticas. Especializado en backend y arquitectura de microservicios.",
    university: "IES Joan d'Austria",
    graduationYear: 2023,
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Administración de Sistemas Informáticos en Red (ASIR)",
    skills: "Java, Spring Boot, Docker, Kubernetes, AWS, PostgreSQL",
    cvUrl: "https://drive.google.com/example-cv-pablo",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const job1 = await storage.createJob(company1.id, {
    title: "Desarrollador Full-Stack Junior",
    description: "Buscamos un desarrollador full-stack para unirse a nuestro equipo de innovación. Trabajarás en proyectos de alta tecnología con las últimas herramientas del mercado. Ofrecemos formación continua y un ambiente de trabajo dinámico.",
    location: "Madrid, España",
    salaryMin: 25000,
    salaryMax: 35000,
    jobType: "FULL_TIME",
    requirements: "Título de FP en DAW, DAM o similar. Conocimientos de JavaScript, React y Node.js. Nivel de inglés B2.",
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Desarrollo de Aplicaciones Web (DAW)",
    expiresAt: threeMonthsFromNow,
  });

  const job2 = await storage.createJob(company1.id, {
    title: "Data Scientist - IA",
    description: "Incorporamos un Data Scientist para nuestro departamento de Inteligencia Artificial. Participarás en proyectos de machine learning y análisis de datos a gran escala.",
    location: "Madrid (Híbrido)",
    salaryMin: 30000,
    salaryMax: 45000,
    jobType: "FULL_TIME",
    requirements: "FP Superior o formación equivalente en Data Science. Experiencia con Python, TensorFlow, pandas. Conocimientos de estadística avanzada.",
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)",
    expiresAt: threeMonthsFromNow,
  });

  const job3 = await storage.createJob(company2.id, {
    title: "Diseñador UX/UI - Prácticas",
    description: "Ofrecemos prácticas remuneradas en diseño UX/UI. Aprenderás a crear interfaces de usuario atractivas y funcionales para clientes de primer nivel.",
    location: "Barcelona, España",
    salaryMin: 12000,
    salaryMax: 15000,
    jobType: "INTERNSHIP",
    requirements: "Estudiante o recién titulado en FP de Diseño o similar. Portfolio de proyectos. Manejo de Figma y Adobe XD.",
    familiaProfesional: "Imagen y Sonido",
    cicloFormativo: "CFGS Animaciones 3D, Juegos y Entornos Interactivos",
    expiresAt: threeMonthsFromNow,
  });

  const job4 = await storage.createJob(company2.id, {
    title: "Community Manager",
    description: "Gestionarás las redes sociales de nuestros clientes más importantes. Creación de contenido, análisis de métricas y estrategias de crecimiento.",
    location: "Remoto",
    salaryMin: 20000,
    salaryMax: 28000,
    jobType: "REMOTE",
    requirements: "FP en Marketing y Publicidad, Comunicación o similar. Experiencia con herramientas de gestión de RRSS. Creatividad y capacidad analítica.",
    familiaProfesional: "Comercio y Marketing",
    cicloFormativo: "CFGS Marketing y Publicidad",
    expiresAt: threeMonthsFromNow,
  });

  const job5 = await storage.createJob(company3.id, {
    title: "Ingeniero de Energías Renovables",
    description: "Buscamos ingeniero para diseñar e implementar soluciones de energía solar fotovoltaica en proyectos residenciales y comerciales.",
    location: "Valencia, España",
    salaryMin: 28000,
    salaryMax: 38000,
    jobType: "FULL_TIME",
    requirements: "FP Superior en Energías Renovables, Electricidad o similar. Conocimientos en energía solar. Carnet de conducir B.",
    familiaProfesional: "Energía y Agua",
    cicloFormativo: "CFGS Energías Renovables",
    expiresAt: threeMonthsFromNow,
  });

  await storage.createApplication(alumni1.id, {
    jobOfferId: job1.id,
    coverLetter: "Me apasiona el desarrollo full-stack y creo que mi formación en React y Node.js encaja perfectamente con lo que buscan. Estoy deseando aportar valor a su equipo.",
  });

  await storage.createApplication(alumni2.id, {
    jobOfferId: job1.id,
    coverLetter: "Aunque mi especialidad es backend, tengo sólidos conocimientos full-stack y experiencia en prácticas que me permitirían adaptarme rápidamente.",
  });

  await storage.createApplication(alumni1.id, {
    jobOfferId: job3.id,
    coverLetter: "Aunque mi formación es en informática, siempre he tenido interés por el diseño y tengo experiencia personal creando interfaces con Figma.",
  });

  console.log("Database seeded successfully!");
}
